import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { StoreActions } from './store.actions';
import { selectCart } from './store.selectors';
import { API_SERVICE_TOKEN } from '../../tokens';
import { Product, Order } from '@mss/shared';

@Injectable()
export class StoreEffects {
  private actions$ = inject(Actions);
  private api = inject(API_SERVICE_TOKEN);
  private store = inject(Store);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StoreActions.loadProducts),
      switchMap(({ page = 1, featured }) => {
        const params: Record<string, string> = { page: String(page) };
        if (featured !== undefined) params['featured'] = String(featured);
        return this.api.get<{ data: Product[]; total: number; pages: number }>('/store/products', params).pipe(
          map(r => StoreActions.loadProductsSuccess({ products: r.data, total: r.total, pages: r.pages })),
          catchError(err => of(StoreActions.loadProductsFailure({ error: err.message })))
        );
      })
    )
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StoreActions.loadProduct),
      switchMap(({ id }) =>
        this.api.get<Product>(`/store/products/${id}`).pipe(
          map(product => StoreActions.loadProductSuccess({ product })),
          catchError(err => of(StoreActions.loadProductsFailure({ error: err.message })))
        )
      )
    )
  );

  checkout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StoreActions.checkout),
      withLatestFrom(this.store.select(selectCart)),
      switchMap(([{ customerEmail, customerName }, cart]) =>
        this.api.post<{ url: string }>('/store/checkout', {
          customerEmail,
          customerName,
          items: cart.map(c => ({
            productId: c.productId,
            size: c.size,
            finish: c.finish,
            quantity: c.quantity,
          })),
        }).pipe(
          map(({ url }) => {
            window.location.href = url; // redirect to Stripe Checkout
            return StoreActions.checkoutSuccess({ checkoutUrl: url });
          }),
          catchError(err => of(StoreActions.checkoutFailure({ error: err.message })))
        )
      )
    )
  );

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StoreActions.loadOrders),
      switchMap(({ page = 1 }) =>
        this.api.get<{ data: Order[]; total: number }>('/store/orders', { page: String(page) }).pipe(
          map(r => StoreActions.loadOrdersSuccess({ orders: r.data, total: r.total })),
          catchError(() => of(StoreActions.loadOrdersSuccess({ orders: [], total: 0 })))
        )
      )
    )
  );
}
