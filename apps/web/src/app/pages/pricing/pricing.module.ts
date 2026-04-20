import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiModule } from '@sm/ui';
import { PricingComponent } from './pricing.component';

@NgModule({
  declarations: [PricingComponent],
  imports: [
    CommonModule,
    UiModule,
    RouterModule.forChild([{ path: '', component: PricingComponent }]),
  ],
})
export class PricingModule {}
