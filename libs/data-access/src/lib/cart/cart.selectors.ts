import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartItemType, SubscriptionStatus } from '@sm/shared';
import { CartState } from './cart.reducer';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems    = createSelector(selectCartState, s => s.items);
export const selectCartSubtotal = createSelector(selectCartState, s => s.subtotalCents);
export const selectCartCount    = createSelector(selectCartState, s =>
  s.items.reduce((acc, i) => acc + i.quantity, 0)
);
export const selectCartDrawerOpen = createSelector(selectCartState, s => s.drawerOpen);
export const selectCartLoading    = createSelector(selectCartState, s => s.loading);
export const selectCartError      = createSelector(selectCartState, s => s.error);
export const selectCheckingOut    = createSelector(selectCartState, s => s.checkingOut);

export const selectActiveTier      = createSelector(selectCartState, s => s.activeTier);
export const selectIsSubscribed    = createSelector(selectCartState, s =>
  s.subscriptionStatus === SubscriptionStatus.ACTIVE ||
  s.subscriptionStatus === SubscriptionStatus.TRIALING
);

export const selectServiceCoverage = (serviceId: string) =>
  createSelector(selectCartState, s => {
    const line = s.items.find(i => i.type === CartItemType.SERVICE && i.serviceId === serviceId);
    return { inCart: !!line, includedByTier: !!(line && 'includedByTier' in line && line.includedByTier) };
  });
