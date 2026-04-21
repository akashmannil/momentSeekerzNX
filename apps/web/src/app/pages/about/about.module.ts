import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UiModule } from '@sm/ui';
import { AboutComponent } from './about.component';

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, UiModule, RouterModule.forChild([{ path: '', component: AboutComponent }])],
})
export class AboutModule {}
