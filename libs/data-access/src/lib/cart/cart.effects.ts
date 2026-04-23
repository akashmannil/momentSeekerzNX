import { Injectable, Inject, Optional, InjectionToken, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, tap } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { CartItemType, CartLineItem, PricingTier, SubscriptionStatus } from '@sm/shared';
import { CartActions, CartPayload } from './cart.actions';
import { API_SERVICE_TOKEN } from '../../tokens';
import { AuthActions } from '../auth/auth.actions';
import { selectIsAuthenticated } from '../auth/auth.selectors';
import { selectCartItems } from './cart.selectors';

export const CART_STORAGE_KEY = 'sm_guest_cart_v1';

export const CART_PERSISTENCE = new InjectionToken<CartPersistence>('CART_PERSISTENCE', {
  providedIn: 'root',
  factory: () => new LocalStorageCartPersistence(),
});

export interface CartPersistence {
  save(items: CartLineItem[]): void;
  load(): CartLineItem[];
  clear(): void;
}

export class LocalStorageCartPersistence implements CartPersistence {
  save(items: CartLineItem[]): void {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
  }
  load(): CartLineItem[] {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLineItem[]) : [];
    } catch { return []; }
  }
  clear(): void {
    try { localStorage.removeItem(CART_STORAGE_KEY); } catch { /* noop */ }
  }
}

@Injectable()
export class CartEffects {
  private actions$ = inject(Actions);
  private api = inject(API_SERVICE_TOKEN);
  private store = inject(Store);

  constructor(
    @Optional() @Inject(CART_PERSISTENCE) private readonly persistence: CartPersistence | null,
  ) {}

  loadCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.loadCart),
      switchMap(() =>
        this.api.get<CartPayload>('/cart').pipe(
          map(payload => CartActions.loadCartSuccess({ payload })),
          catchError(err => of(CartActions.loadCartFailure({ error: err?.message ?? 'Failed to load cart' })))
        )
      )
    )
  );

  addItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.addItem),
      mergeMap(({ serviceId, quantity }) =>
        this.api.post<CartPayload>('/cart/items', { serviceId, quantity }).pipe(
          map(payload => CartActions.addItemSuccess({ payload })),
          catchError(err => of(CartActions.loadCartFailure({ error: err?.message ?? 'Could not add to cart' })))
        )
      )
    )
  );

  updateQty$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.updateQuantity),
      mergeMap(({ serviceId, quantity }) =>
        this.api.patch<CartPayload>(`/cart/items/${serviceId}`, { quantity }).pipe(
          map(payload => CartActions.addItemSuccess({ payload })),
          catchError(err => of(CartActions.loadCartFailure({ error: err?.message ?? 'Could not update cart' })))
        )
      )
    )
  );

  removeItem$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.removeItem),
      mergeMap(({ serviceId }) =>
        this.api.delete<CartPayload>(`/cart/items/${serviceId}`).pipe(
          map(payload => CartActions.addItemSuccess({ payload })),
          catchError(err => of(CartActions.loadCartFailure({ error: err?.message ?? 'Could not remove item' })))
        )
      )
    )
  );

  clearCart$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.clearCart),
      switchMap(() =>
        this.api.delete<CartPayload>('/cart').pipe(
          map(() => CartActions.loadCartSuccess({
            payload: { items: [], subtotalCents: 0, currency: 'CAD', activeTier: null, subscriptionStatus: SubscriptionStatus.NONE },
          })),
          catchError(err => of(CartActions.loadCartFailure({ error: err?.message ?? 'Could not clear cart' })))
        )
      )
    )
  );

  checkoutServices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.checkoutServices),
      withLatestFrom(this.store.select(selectCartItems)),
      switchMap(([{ customerEmail, customerName }, items]) => {
        const serviceItems = items
          .filter(i => i.type === CartItemType.SERVICE && !('includedByTier' in i && i.includedByTier))
          .map(i => ({ serviceId: (i as { serviceId: string }).serviceId, quantity: i.quantity }));
        if (!serviceItems.length) {
          return of(CartActions.checkoutServicesFailure({ error: 'No chargeable items in cart' }));
        }
        return this.api.post<{ url: string }>('/checkout/services', {
          customerEmail, customerName, items: serviceItems,
        }).pipe(
          map(({ url }) => {
            window.location.href = url;
            return CartActions.checkoutServicesSuccess({ url });
          }),
          catchError(err => of(CartActions.checkoutServicesFailure({ error: err?.message ?? 'Checkout failed' })))
        );
      })
    )
  );

  checkoutSubscription$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CartActions.checkoutSubscription),
      switchMap(({ tier }) =>
        this.api.post<{ url: string }>('/checkout/subscription', { tier }).pipe(
          map(({ url }) => {
            window.location.href = url;
            return CartActions.checkoutSubscriptionSuccess({ url });
          }),
          catchError(err => of(CartActions.checkoutSubscriptionFailure({ error: err?.message ?? 'Checkout failed' })))
        )
      )
    )
  );

  // ─── Auth lifecycle integration ────────────────────────────────────────────

  mergeOnLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess, AuthActions.registerSuccess, AuthActions.sessionRestored),
      switchMap(() =>
        this.api.post<CartPayload>('/cart/merge', {}).pipe(
          map(payload => CartActions.loadCartSuccess({ payload })),
          catchError(() => of(CartActions.loadCart()))
        )
      )
    )
  );

  reloadOnLogout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      map(() => CartActions.loadCart())
    )
  );

  // ─── Guest persistence (localStorage mirror for offline hints) ─────────────

  persistItems$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CartActions.loadCartSuccess, CartActions.addItemSuccess),
        withLatestFrom(this.store.select(selectIsAuthenticated)),
        filter(([, authed]) => !authed),
        tap(([{ payload }]) => this.persistence?.save(payload.items)),
      ),
    { dispatch: false }
  );

  clearPersistOnAuth$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.persistence?.clear()),
      ),
    { dispatch: false }
  );
}

export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
}

export { PricingTier };
