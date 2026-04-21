import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  StoreActions,
  selectCart,
  selectCartTotal,
  selectCheckingOut,
} from '@sm/data-access';
import { CartItem } from '@sm/shared';

@Component({
  selector: 'sm-cart-sidebar',
  templateUrl: './cart-sidebar.component.html',
})
export class CartSidebarComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  cart$: Observable<CartItem[]> = this.store.select(selectCart);
  cartTotal$: Observable<number> = this.store.select(selectCartTotal);
  checkingOut$: Observable<boolean> = this.store.select(selectCheckingOut);
  checkoutForm!: FormGroup;

  constructor(private readonly store: Store, private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      customerName: ['', Validators.required],
      customerEmail: ['', [Validators.required, Validators.email]],
    });
  }

  removeItem(item: CartItem): void {
    this.store.dispatch(
      StoreActions.removeFromCart({
        productId: item.productId,
        size: item.size,
        finish: item.finish,
      })
    );
  }

  updateQty(item: CartItem, delta: number): void {
    const quantity = item.quantity + delta;
    if (quantity < 1) {
      this.removeItem(item);
      return;
    }
    this.store.dispatch(
      StoreActions.updateCartQuantity({
        productId: item.productId,
        size: item.size,
        finish: item.finish,
        quantity,
      })
    );
  }

  checkout(): void {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    const { customerName, customerEmail } = this.checkoutForm.value;
    this.store.dispatch(StoreActions.checkout({ customerName, customerEmail }));
  }
}
