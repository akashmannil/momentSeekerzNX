import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  StoreActions, selectProducts, selectStoreLoading,
  selectCartCount, selectCart,
} from '@sm/data-access';
import { Product, CartItem } from '@sm/shared';
import { IMAGES } from '../../shared/image-assets';

const FALLBACK_PRINT_IMAGES = [
  IMAGES.fineArt,
  IMAGES.fineArtGallery,
  IMAGES.finePrints,
  IMAGES.aerial,
  IMAGES.cinematicFilm,
  IMAGES.philosophy,
  IMAGES.portraitEditorial,
  IMAGES.realEstateExterior,
  IMAGES.productFlatlay,
];

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
  readonly images = IMAGES;

  constructor(private readonly store: Store) {}

  productImage(product: Product, index: number): string {
    return product.thumbnailUrl || product.imageUrl || FALLBACK_PRINT_IMAGES[index % FALLBACK_PRINT_IMAGES.length];
  }

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
