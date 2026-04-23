import { CartItemType, OrderStatus, PricingTier, SubscriptionStatus } from '../enums';
import { ServiceId } from '../catalog/service-catalog';

/**
 * Discriminated union — cart can contain services or (transient) subscription line.
 * Subscription is never stored alongside services in a checkout session,
 * but the type is defined here so the NgRx cart can model both with one shape.
 */
export type CartLineItem =
  | {
      id: string;
      type: CartItemType.SERVICE;
      serviceId: ServiceId;
      name: string;
      quantity: number;
      unitPriceCents: number;
      includedByTier?: PricingTier;
    }
  | {
      id: string;
      type: CartItemType.SUBSCRIPTION;
      tier: PricingTier;
      name: string;
      quantity: 1;
      unitPriceCents: number;
    };

export interface CartSnapshot {
  id?: string;
  items: CartLineItem[];
  subtotalCents: number;
  currency: 'CAD';
  updatedAt?: string;
}

export interface UserSubscription {
  tier: PricingTier | null;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface ServiceOrderItem {
  serviceId: ServiceId;
  name: string;
  quantity: number;
  unitPriceCents: number;
  requiresScheduling: boolean;
  scheduledAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string;
  userId?: string;
  items: ServiceOrderItem[];
  subtotalCents: number;
  totalCents: number;
  currency: 'CAD';
  status: OrderStatus;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeEventId?: string;
  createdAt: string;
  updatedAt: string;
}
