import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PricingComponent } from './pricing.component';

@NgModule({
  declarations: [PricingComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: PricingComponent }]),
  ],
})
export class PricingModule {}
