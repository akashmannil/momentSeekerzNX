import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { createHash, randomBytes } from 'crypto';
import {
  SERVICES_BY_ID,
  ServiceId,
  PricingTier,
  OrderStatus,
  SubscriptionStatus,
  effectivePriceCents,
  tierIncludes,
} from '@sm/shared';
import { Order, OrderDocument } from './schemas/order.schema';
import { CartService, CartIdentity } from '../cart/cart.service';
import { UsersService } from '../users/users.service';

export interface CheckoutServicesInput {
  identity: CartIdentity;
  customerEmail?: string;
  customerName?: string;
  items: { serviceId: string; quantity: number }[];
  origin: string;
}

export interface CheckoutSubscriptionInput {
  userId: string;
  tier: PricingTier;
  customerEmail: string;
  origin: string;
}

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
    private readonly usersService: UsersService,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY', ''),
      { apiVersion: '2024-04-10' }
    );
  }

  // ─── Services (one-off payment) ────────────────────────────────────────────

  async createServicesSession(input: CheckoutServicesInput): Promise<{ url: string }> {
    if (!input.items.length) throw new BadRequestException('Cart is empty');
    if (input.items.length > 20) throw new BadRequestException('Cart has too many items');

    // Pull user subscription to know which items are already covered.
    const userTier = await this.resolveActiveTier(input.identity.userId);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    const orderItems: { serviceId: string; name: string; quantity: number; unitPriceCents: number; requiresScheduling: boolean }[] = [];
    let subtotalCents = 0;

    for (const item of input.items) {
      const svc = SERVICES_BY_ID[item.serviceId as ServiceId];
      if (!svc) throw new BadRequestException(`Unknown service: ${item.serviceId}`);
      if (item.quantity < 1 || item.quantity > svc.maxQuantity) {
        throw new BadRequestException(`Invalid quantity for ${svc.id}`);
      }
      // Skip items already paid for by active tier
      if (userTier && tierIncludes(userTier, svc.id)) continue;

      const unitCents = effectivePriceCents(svc);
      subtotalCents += unitCents * item.quantity;
      orderItems.push({
        serviceId: svc.id,
        name: svc.name,
        quantity: item.quantity,
        unitPriceCents: unitCents,
        requiresScheduling: svc.requiresScheduling,
      });
      lineItems.push({
        quantity: item.quantity,
        price_data: {
          currency: 'cad',
          unit_amount: unitCents,
          product_data: { name: svc.name, description: svc.description },
        },
      });
    }

    if (!lineItems.length) {
      throw new BadRequestException('All items are already covered by your subscription');
    }

    const idempotencyKey = this.deriveIdempotencyKey(input);

    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: lineItems,
        customer_email: input.customerEmail,
        allow_promotion_codes: true,
        success_url: `${input.origin}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/cart`,
        metadata: {
          kind: 'services',
          userId: input.identity.userId ?? '',
          guestSid: input.identity.guestSid ?? '',
          customerName: input.customerName ?? '',
          // Stripe metadata value limit is 500 chars; keep item payload compact.
          items: JSON.stringify(orderItems.map(i => ({ s: i.serviceId, q: i.quantity, u: i.unitPriceCents }))),
          subtotalCents: String(subtotalCents),
        },
      },
      { idempotencyKey },
    );

    return { url: session.url! };
  }

  // ─── Subscription ──────────────────────────────────────────────────────────

  async createSubscriptionSession(input: CheckoutSubscriptionInput): Promise<{ url: string }> {
    const priceId = this.stripePriceForTier(input.tier);
    if (!priceId) throw new BadRequestException(`No Stripe price configured for tier ${input.tier}`);

    const user = await this.usersService.findById(input.userId);
    if (!user) throw new BadRequestException('User not found');

    let stripeCustomerId = user.subscription?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: input.customerEmail,
        name: user.name,
        metadata: { userId: input.userId },
      });
      stripeCustomerId = customer.id;
      await this.usersService.updateSubscription(input.userId, { stripeCustomerId });
    }

    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${input.origin}/account?subscription=success`,
        cancel_url: `${input.origin}/pricing`,
        metadata: { kind: 'subscription', userId: input.userId, tier: input.tier },
      },
      { idempotencyKey: `sub-${input.userId}-${input.tier}-${Date.now()}` },
    );

    return { url: session.url! };
  }

  // ─── Webhook ───────────────────────────────────────────────────────────────

  async handleWebhook(payload: Buffer, sig: string): Promise<void> {
    const secret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
    if (!secret) throw new BadRequestException('Webhook secret not configured');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, secret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.['kind'] === 'services') {
          await this.fulfillServicesOrder(event.id, session);
        }
        // Subscription metadata is handled on subscription.* events below.
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await this.syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }
      default:
        break;
    }
  }

  private async fulfillServicesOrder(eventId: string, session: Stripe.Checkout.Session): Promise<void> {
    // Idempotency: unique index on stripeEventId prevents duplicate fulfillment.
    const existing = await this.orderModel.findOne({ stripeEventId: eventId }).exec();
    if (existing) return;

    const meta = session.metadata ?? {};
    type MetaItem = { s: string; q: number; u: number };
    let rawItems: MetaItem[] = [];
    try {
      rawItems = JSON.parse(meta['items'] ?? '[]') as MetaItem[];
    } catch {
      rawItems = [];
    }

    const items = rawItems
      .map(i => {
        const svc = SERVICES_BY_ID[i.s as ServiceId];
        if (!svc) return null;
        return {
          serviceId: svc.id,
          name: svc.name,
          quantity: i.q,
          unitPriceCents: i.u,
          requiresScheduling: svc.requiresScheduling,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    if (!items.length) return;

    const subtotalCents = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);

    const orderNumber = `SM-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    await this.orderModel.create({
      orderNumber,
      customerEmail: session.customer_email ?? '',
      customerName: meta['customerName'] || undefined,
      userId: meta['userId'] || undefined,
      items,
      subtotalCents,
      totalCents: session.amount_total ?? subtotalCents,
      currency: 'CAD',
      status: OrderStatus.PAID,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string | undefined,
      stripeEventId: eventId,
    });

    // Clear the cart that produced this checkout so the user doesn't see stale items.
    const cartIdentity: CartIdentity = meta['userId']
      ? { userId: meta['userId'] }
      : meta['guestSid']
        ? { guestSid: meta['guestSid'] }
        : ({} as CartIdentity);
    try { await this.cartService.clear(cartIdentity); } catch { /* best-effort */ }
  }

  private async syncSubscription(sub: Stripe.Subscription): Promise<void> {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
    const user = await this.usersService.findByStripeCustomerId(customerId);
    if (!user) return;

    const tier = this.tierFromStripePrice(sub.items.data[0]?.price.id);
    const status = this.mapStripeStatus(sub.status);

    await this.usersService.updateSubscription(String(user._id), {
      tier,
      status,
      stripeSubscriptionId: sub.id,
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private async resolveActiveTier(userId?: string): Promise<PricingTier | null> {
    if (!userId) return null;
    const user = await this.usersService.findById(userId);
    const status = user?.subscription?.status as SubscriptionStatus | undefined;
    if (status !== SubscriptionStatus.ACTIVE && status !== SubscriptionStatus.TRIALING) return null;
    return (user?.subscription?.tier as PricingTier | null) ?? null;
  }

  private stripePriceForTier(tier: PricingTier): string | undefined {
    const map: Record<PricingTier, string | undefined> = {
      [PricingTier.LITE]:     this.configService.get<string>('STRIPE_PRICE_LITE'),
      [PricingTier.PRO]:      this.configService.get<string>('STRIPE_PRICE_PRO'),
      [PricingTier.BUSINESS]: this.configService.get<string>('STRIPE_PRICE_BUSINESS'),
      [PricingTier.CUSTOM]:   undefined,
    };
    return map[tier];
  }

  private tierFromStripePrice(priceId?: string): PricingTier | null {
    if (!priceId) return null;
    const prices: Array<[string | undefined, PricingTier]> = [
      [this.configService.get<string>('STRIPE_PRICE_LITE'),     PricingTier.LITE],
      [this.configService.get<string>('STRIPE_PRICE_PRO'),      PricingTier.PRO],
      [this.configService.get<string>('STRIPE_PRICE_BUSINESS'), PricingTier.BUSINESS],
    ];
    return prices.find(([id]) => id === priceId)?.[1] ?? null;
  }

  private mapStripeStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
    switch (s) {
      case 'active':     return SubscriptionStatus.ACTIVE;
      case 'trialing':   return SubscriptionStatus.TRIALING;
      case 'past_due':   return SubscriptionStatus.PAST_DUE;
      case 'canceled':   return SubscriptionStatus.CANCELED;
      case 'incomplete':
      case 'incomplete_expired': return SubscriptionStatus.INCOMPLETE;
      case 'unpaid':     return SubscriptionStatus.PAST_DUE;
      case 'paused':     return SubscriptionStatus.ENDED;
      default:           return SubscriptionStatus.NONE;
    }
  }

  private deriveIdempotencyKey(input: CheckoutServicesInput): string {
    const payload = JSON.stringify({
      u: input.identity.userId ?? null,
      g: input.identity.guestSid ?? null,
      i: input.items,
      e: input.customerEmail ?? '',
    });
    return createHash('sha256').update(payload).digest('hex');
  }
}
