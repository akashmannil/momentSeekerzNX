import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { UiModule } from '@sm/ui';
import { StorePageComponent } from './store-page.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartSidebarComponent } from './cart-sidebar/cart-sidebar.component';
import { CheckoutSuccessComponent } from './checkout-success/checkout-success.component';

@NgModule({
  declarations: [
    StorePageComponent,
    ProductDetailComponent,
    CartSidebarComponent,
    CheckoutSuccessComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: '', component: StorePageComponent },
      { path: 'order-success', component: CheckoutSuccessComponent },
      { path: ':id', component: ProductDetailComponent },
    ]),
  ],
})
export class StorePageModule {}
