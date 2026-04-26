import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  CartActions,
  selectCartItems,
  selectCartSubtotal,
  selectCartCount,
  selectActiveTier,
  selectIsAuthenticated,
  selectCheckingOut,
  selectCartError,
} from '@sm/data-access';
import { CartLineItem, CartItemType, PricingTier } from '@sm/shared';

@Component({
  selector: 'sm-cart',
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  readonly CartItemType = CartItemType;

  items$: Observable<CartLineItem[]>       = this.store.select(selectCartItems);
  subtotalCents$: Observable<number>       = this.store.select(selectCartSubtotal);
  count$: Observable<number>               = this.store.select(selectCartCount);
  activeTier$: Observable<PricingTier | null> = this.store.select(selectActiveTier);
  isAuthenticated$: Observable<boolean>    = this.store.select(selectIsAuthenticated);
  checkingOut$: Observable<boolean>        = this.store.select(selectCheckingOut);
  error$: Observable<string | null>        = this.store.select(selectCartError);

  guestForm: FormGroup = this.fb.group({
    customerEmail: ['', [Validators.required, Validators.email]],
    customerName:  ['', [Validators.required, Validators.minLength(2)]],
  });

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.store.dispatch(CartActions.loadCart());
  }

  trackById = (_: number, item: CartLineItem) => item.id;

  increment(item: CartLineItem): void {
    if (item.type !== CartItemType.SERVICE) return;
    this.store.dispatch(CartActions.updateQuantity({
      serviceId: item.serviceId,
      quantity: item.quantity + 1,
    }));
  }

  decrement(item: CartLineItem): void {
    if (item.type !== CartItemType.SERVICE || item.quantity <= 1) return;
    this.store.dispatch(CartActions.updateQuantity({
      serviceId: item.serviceId,
      quantity: item.quantity - 1,
    }));
  }

  remove(item: CartLineItem): void {
    if (item.type !== CartItemType.SERVICE) return;
    this.store.dispatch(CartActions.removeItem({ serviceId: item.serviceId }));
  }

  clear(): void {
    this.store.dispatch(CartActions.clearCart());
  }

  checkout(isAuthenticated: boolean): void {
    if (isAuthenticated) {
      this.store.dispatch(CartActions.checkoutServices({}));
      return;
    }
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      return;
    }
    const { customerEmail, customerName } = this.guestForm.value;
    this.store.dispatch(CartActions.checkoutServices({ customerEmail, customerName }));
  }

  formatMoney(cents: number): string {
    return `CA$${(cents / 100).toFixed(2)}`;
  }
}
