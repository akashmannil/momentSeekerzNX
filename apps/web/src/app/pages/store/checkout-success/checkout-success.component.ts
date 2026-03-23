import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { StoreActions } from '@mss/data-access';

@Component({
  selector: 'mss-checkout-success',
  template: `
    <div class="min-h-screen flex items-center justify-center px-6 page-enter">
      <div class="text-center max-w-md">
        <p class="section-label text-gold-400 mb-4">Order Confirmed!</p>
        <h1 class="font-display text-5xl font-light mb-6">Thank You</h1>
        <p class="font-body text-white/60 mb-12">
          Your fine art prints are being prepared. You'll receive a confirmation email shortly.
        </p>
        <a routerLink="/store" class="btn-primary">Continue Shopping</a>
      </div>
    </div>
  `,
})
export class CheckoutSuccessComponent implements OnInit {
  constructor(private readonly store: Store) {}
  ngOnInit(): void {
    // Clear cart after successful checkout
    this.store.dispatch(StoreActions.clearCart());
  }
}
