import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CartLineItem, PricingTier, SubscriptionStatus } from '@sm/shared';

export interface CartPayload {
  items: CartLineItem[];
  subtotalCents: number;
  currency: 'CAD';
  activeTier: PricingTier | null;
  subscriptionStatus: SubscriptionStatus;
}

export const CartActions = createActionGroup({
  source: 'Cart',
  events: {
    'Load Cart':          emptyProps(),
    'Load Cart Success':  props<{ payload: CartPayload }>(),
    'Load Cart Failure':  props<{ error: string }>(),

    'Add Item':           props<{ serviceId: string; quantity: number }>(),
    'Add Item Success':   props<{ payload: CartPayload }>(),

    'Update Quantity':    props<{ serviceId: string; quantity: number }>(),
    'Remove Item':        props<{ serviceId: string }>(),
    'Clear Cart':         emptyProps(),

    'Merge Guest Cart':   emptyProps(),

    'Checkout Services':  props<{ customerEmail?: string; customerName?: string }>(),
    'Checkout Services Success': props<{ url: string }>(),
    'Checkout Services Failure': props<{ error: string }>(),

    'Checkout Subscription':         props<{ tier: PricingTier }>(),
    'Checkout Subscription Success': props<{ url: string }>(),
    'Checkout Subscription Failure': props<{ error: string }>(),

    'Open Cart Drawer':   emptyProps(),
    'Close Cart Drawer':  emptyProps(),
  },
});
