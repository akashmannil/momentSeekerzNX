import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  StoreActions, selectProducts, selectStoreLoading,
  selectCartCount, selectCart,
} from '@sm/data-access';
import { Product, CartItem } from '@sm/shared';

@Component({
  selector: 'sm-store-page',
  templateUrl: './store-page.component.html',
  styleUrls: ['./store-page.component.scss'],
})
export class StorePageComponent implements OnInit {
  products$: Observable<Product[]> = this.store.select(selectProducts);
  loading$: Observable<boolean> = this.store.select(selectStoreLoading);
  cartCount$: Observable<number> = this.store.select(selectCartCount);
  cartOpen = false;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(StoreActions.loadProducts({}));
  }

  addToCart(item: CartItem): void {
    this.store.dispatch(StoreActions.addToCart({ item }));
    this.cartOpen = true;
  }

  trackByProductId(_: number, p: Product): string {
    return p._id;
  }
}
