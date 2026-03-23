import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';
import { ToastComponent } from './components/toast/toast.component';

@NgModule({
  declarations: [NavComponent, FooterComponent, LoadingOverlayComponent, ToastComponent],
  imports: [CommonModule, RouterModule],
  exports: [NavComponent, FooterComponent, LoadingOverlayComponent, ToastComponent],
})
export class UiModule {}
