import { createReducer, on } from '@ngrx/store';
import { CartLineItem, PricingTier, SubscriptionStatus } from '@sm/shared';
import { CartActions } from './cart.actions';

export interface CartState {
  items: CartLineItem[];
  subtotalCents: number;
  currency: 'CAD';
  activeTier: PricingTier | null;
  subscriptionStatus: SubscriptionStatus;
  loading: boolean;
  checkingOut: boolean;
  drawerOpen: boolean;
  error: string | null;
}

export const cartInitialState: CartState = {
  items: [],
  subtotalCents: 0,
  currency: 'CAD',
  activeTier: null,
  subscriptionStatus: SubscriptionStatus.NONE,
  loading: false,
  checkingOut: false,
  drawerOpen: false,
  error: null,
};

export const cartReducer = createReducer(
  cartInitialState,

  on(CartActions.loadCart, s => ({ ...s, loading: true, error: null })),
  on(CartActions.loadCartSuccess, (s, { payload }) => ({ ...s, ...payload, loading: false })),
  on(CartActions.loadCartFailure, (s, { error }) => ({ ...s, loading: false, error })),

  on(CartActions.addItemSuccess, (s, { payload }) => ({ ...s, ...payload })),

  on(CartActions.checkoutServices, s => ({ ...s, checkingOut: true, error: null })),
  on(CartActions.checkoutServicesFailure, (s, { error }) => ({ ...s, checkingOut: false, error })),
  on(CartActions.checkoutServicesSuccess, s => ({ ...s, checkingOut: false })),

  on(CartActions.checkoutSubscription, s => ({ ...s, checkingOut: true, error: null })),
  on(CartActions.checkoutSubscriptionFailure, (s, { error }) => ({ ...s, checkingOut: false, error })),
  on(CartActions.checkoutSubscriptionSuccess, s => ({ ...s, checkingOut: false })),

  on(CartActions.openCartDrawer, s => ({ ...s, drawerOpen: true })),
  on(CartActions.closeCartDrawer, s => ({ ...s, drawerOpen: false })),
);
