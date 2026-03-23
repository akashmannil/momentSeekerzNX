import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateProductDto, UpdateProductDto, CreateOrderDto, OrderStatus } from '@mss/shared';

@Injectable()
export class StoreService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly configService: ConfigService
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', ''),
      { apiVersion: '2024-04-10' }
    );
  }

  // ── Products ──────────────────────────────────────────────────────────────────

  async createProduct(dto: CreateProductDto): Promise<ProductDocument> {
    return new this.productModel(dto).save();
  }

  async findAllProducts(page = 1, limit = 20, featured?: boolean): Promise<{
    data: ProductDocument[];
    total: number;
    pages: number;
  }> {
    const filter: Record<string, unknown> = { published: true };
    if (featured !== undefined) filter['featured'] = featured;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);
    return { data, total, pages: Math.ceil(total / limit) };
  }

  async findProductById(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    const product = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Product ${id} not found`);
  }

  // ── Orders & Checkout ─────────────────────────────────────────────────────────

  async createCheckoutSession(dto: CreateOrderDto, origin: string): Promise<{ url: string }> {
    // Validate all products and build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.findProductById(item.productId);
      const variant = product.variants.find(
        v => v.size === item.size && v.finish === item.finish
      );
      if (!variant) {
        throw new BadRequestException(
          `Variant ${item.size}/${item.finish} not found for product ${item.productId}`
        );
      }
      subtotal += variant.price * item.quantity;
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${product.title} — ${item.size} ${item.finish}`,
            images: [product.imageUrl],
          },
          unit_amount: Math.round(variant.price * 100),
        },
        quantity: item.quantity,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: dto.customerEmail,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU'] },
      success_url: `${origin}/store/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/store/cart`,
      metadata: {
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        items: JSON.stringify(dto.items),
      },
    });

    return { url: session.url! };
  }

  async handleStripeWebhook(payload: Buffer, sig: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillOrder(session);
    }
  }

  private async fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
    const orderNumber = `MSS-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const metadata = session.metadata as Record<string, string>;
    const items = JSON.parse(metadata['items'] || '[]');

    // Build enriched items
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        const product = await this.productModel.findById(item.productId);
        const variant = product?.variants.find(
          v => v.size === item.size && v.finish === item.finish
        );
        return {
          productId: item.productId,
          title: product?.title ?? 'Unknown',
          imageUrl: product?.imageUrl ?? '',
          size: item.size,
          finish: item.finish,
          quantity: item.quantity,
          unitPrice: (variant?.price ?? 0),
          sku: variant?.sku ?? '',
        };
      })
    );

    const subtotal = enrichedItems.reduce((s: number, i: any) => s + i.unitPrice * i.quantity, 0);

    await this.orderModel.create({
      orderNumber,
      customerEmail: session.customer_email ?? metadata['customerEmail'],
      customerName: metadata['customerName'],
      items: enrichedItems,
      subtotal,
      shippingCost: 0,
      tax: 0,
      total: (session.amount_total ?? 0) / 100,
      shippingAddress: session.shipping_details?.address ?? {},
      status: OrderStatus.PROCESSING,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
    });

    // Increment sales counts in background
    enrichedItems.forEach((item: any) => {
      this.productModel
        .findByIdAndUpdate(item.productId, { $inc: { salesCount: item.quantity } })
        .exec();
    });
  }

  async findAllOrders(status?: OrderStatus, page = 1, limit = 20) {
    const filter: Record<string, unknown> = {};
    if (status) filter['status'] = status;
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);
    return { data, total, pages: Math.ceil(total / limit) };
  }

  async findOrderById(id: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id).populate('items.productId').exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status, ...(trackingNumber ? { trackingNumber } : {}) }, { new: true })
      .exec();
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }
}
