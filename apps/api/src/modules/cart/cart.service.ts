import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CartLineItem,
  CartItemType,
  PricingTier,
  SubscriptionStatus,
  SERVICES_BY_ID,
  ServiceId,
  effectivePriceCents,
  tierIncludes,
} from '@sm/shared';
import { Cart, CartDocument } from './schemas/cart.schema';
import { UsersService } from '../users/users.service';

export interface CartIdentity {
  userId?: string;
  guestSid?: string;
}

export interface CartValidationResult {
  items: CartLineItem[];
  subtotalCents: number;
  currency: 'CAD';
  activeTier: PricingTier | null;
  subscriptionStatus: SubscriptionStatus;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    private readonly usersService: UsersService,
  ) {}

  private ownerQuery({ userId, guestSid }: CartIdentity) {
    if (userId) return { userId };
    if (guestSid) return { guestSid };
    throw new BadRequestException('No cart owner');
  }

  private async findOrCreate(identity: CartIdentity): Promise<CartDocument> {
    const query = this.ownerQuery(identity);
    const existing = await this.cartModel.findOne(query).exec();
    if (existing) return existing;
    return this.cartModel.create({ ...query, items: [] });
  }

  async getSnapshot(identity: CartIdentity): Promise<CartValidationResult> {
    const cart = await this.findOrCreate(identity);
    return this.buildSnapshot(cart, identity);
  }

  async addItem(identity: CartIdentity, serviceId: string, quantity: number): Promise<CartValidationResult> {
    const svc = SERVICES_BY_ID[serviceId as ServiceId];
    if (!svc) throw new BadRequestException(`Unknown service: ${serviceId}`);
    if (quantity < 1 || quantity > svc.maxQuantity) {
      throw new BadRequestException(`Quantity must be between 1 and ${svc.maxQuantity}`);
    }

    const cart = await this.findOrCreate(identity);
    const existing = cart.items.find(i => i.serviceId === serviceId);
    if (existing) {
      existing.quantity = Math.min(svc.maxQuantity, existing.quantity + quantity);
    } else {
      if (cart.items.length >= 20) throw new BadRequestException('Cart is full (max 20 line items)');
      cart.items.push({ serviceId, quantity, addedAt: new Date() });
    }
    await cart.save();
    return this.buildSnapshot(cart, identity);
  }

  async updateQuantity(identity: CartIdentity, serviceId: string, quantity: number): Promise<CartValidationResult> {
    const svc = SERVICES_BY_ID[serviceId as ServiceId];
    if (!svc) throw new BadRequestException(`Unknown service: ${serviceId}`);
    if (quantity < 1 || quantity > svc.maxQuantity) {
      throw new BadRequestException(`Quantity must be between 1 and ${svc.maxQuantity}`);
    }

    const cart = await this.findOrCreate(identity);
    const line = cart.items.find(i => i.serviceId === serviceId);
    if (!line) throw new NotFoundException('Item not in cart');
    line.quantity = quantity;
    await cart.save();
    return this.buildSnapshot(cart, identity);
  }

  async removeItem(identity: CartIdentity, serviceId: string): Promise<CartValidationResult> {
    const cart = await this.findOrCreate(identity);
    cart.items = cart.items.filter(i => i.serviceId !== serviceId);
    await cart.save();
    return this.buildSnapshot(cart, identity);
  }

  async clear(identity: CartIdentity): Promise<CartValidationResult> {
    const cart = await this.findOrCreate(identity);
    cart.items = [];
    await cart.save();
    return this.buildSnapshot(cart, identity);
  }

  /**
   * Merge guest cart into user cart. Idempotent. Called on login.
   * Guest items are added to user cart; duplicates combine quantities (capped per service).
   */
  async merge(userId: string, guestSid: string): Promise<CartValidationResult> {
    const [userCart, guestCart] = await Promise.all([
      this.cartModel.findOne({ userId }).exec(),
      this.cartModel.findOne({ guestSid }).exec(),
    ]);

    if (!guestCart || guestCart.items.length === 0) {
      if (guestCart) await guestCart.deleteOne();
      return this.getSnapshot({ userId });
    }

    const target = userCart ?? (await this.cartModel.create({ userId, items: [] }));

    for (const gItem of guestCart.items) {
      const svc = SERVICES_BY_ID[gItem.serviceId as ServiceId];
      if (!svc) continue;
      const existing = target.items.find(i => i.serviceId === gItem.serviceId);
      if (existing) {
        existing.quantity = Math.min(svc.maxQuantity, existing.quantity + gItem.quantity);
      } else if (target.items.length < 20) {
        target.items.push({ serviceId: gItem.serviceId, quantity: gItem.quantity, addedAt: gItem.addedAt });
      }
    }

    await target.save();
    await guestCart.deleteOne();
    return this.buildSnapshot(target, { userId });
  }

  /**
   * Re-prices cart from the server-side catalog. Marks items that are included in
   * the user's active subscription tier so the client can surface "already covered."
   */
  private async buildSnapshot(cart: CartDocument, identity: CartIdentity): Promise<CartValidationResult> {
    const { tier, status } = await this.resolveSubscription(identity.userId);

    const lineItems: CartLineItem[] = [];
    let subtotalCents = 0;

    for (const item of cart.items) {
      const svc = SERVICES_BY_ID[item.serviceId as ServiceId];
      if (!svc) continue;
      const unitPriceCents = effectivePriceCents(svc);
      const includedByTier = tier && tierIncludes(tier, item.serviceId as ServiceId) ? tier : undefined;
      const chargeablePrice = includedByTier ? 0 : unitPriceCents;
      subtotalCents += chargeablePrice * item.quantity;
      lineItems.push({
        id: `${svc.id}`,
        type: CartItemType.SERVICE,
        serviceId: svc.id,
        name: svc.name,
        quantity: item.quantity,
        unitPriceCents,
        includedByTier,
      });
    }

    return {
      items: lineItems,
      subtotalCents,
      currency: 'CAD',
      activeTier: tier,
      subscriptionStatus: status,
    };
  }

  private async resolveSubscription(userId?: string): Promise<{ tier: PricingTier | null; status: SubscriptionStatus }> {
    if (!userId) return { tier: null, status: SubscriptionStatus.NONE };
    const user = await this.usersService.findById(userId);
    const sub = user?.subscription;
    const status = (sub?.status as SubscriptionStatus) ?? SubscriptionStatus.NONE;
    const isActive = status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
    return {
      tier: isActive ? (sub?.tier as PricingTier | null) ?? null : null,
      status,
    };
  }
}
