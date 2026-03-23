import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StoreState, selectAllProducts, selectProductEntities } from './store.reducer';

export const selectStoreState = createFeatureSelector<StoreState>('store');

export const selectProducts = createSelector(selectStoreState, selectAllProducts);
export const selectProductById = (id: string) =>
  createSelector(selectStoreState, selectProductEntities, (_, entities) => entities[id] ?? null);

export const selectCart = createSelector(selectStoreState, s => s.cart);
export const selectCartCount = createSelector(selectCart, cart =>
  cart.reduce((acc, item) => acc + item.quantity, 0)
);
export const selectCartTotal = createSelector(selectCart, cart =>
  cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0)
);
export const selectStoreLoading = createSelector(selectStoreState, s => s.loading);
export const selectCheckingOut = createSelector(selectStoreState, s => s.checkingOut);
export const selectOrders = createSelector(selectStoreState, s => s.orders);
