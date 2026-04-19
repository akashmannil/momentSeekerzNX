import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { StoreActions, selectProductById, selectCart } from '@sm/data-access';
import { Product, ProductVariant, PrintSize, PrintFinish } from '@sm/shared';

@Component({
  selector: 'sm-product-detail',
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  product$!: Observable<Product | null>;
  selectedVariant: ProductVariant | null = null;
  quantity = 1;
  cartOpen = false;

  constructor(
    private readonly store: Store,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.store.dispatch(StoreActions.loadProduct({ id }));
    this.product$ = this.store.select(selectProductById(id));
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant = variant;
  }

  addToCart(product: Product): void {
    if (!this.selectedVariant) return;
    this.store.dispatch(
      StoreActions.addToCart({
        item: {
          productId: product._id,
          title: product.title,
          imageUrl: product.thumbnailUrl ?? product.imageUrl,
          size: this.selectedVariant.size,
          finish: this.selectedVariant.finish,
          quantity: this.quantity,
          unitPrice: this.selectedVariant.price,
          sku: this.selectedVariant.sku,
        },
      })
    );
    this.cartOpen = true;
  }
}
