import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminShellComponent } from './admin-shell.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { GalleryManagerComponent } from './gallery-manager/gallery-manager.component';
import { BookingManagerComponent } from './booking-manager/booking-manager.component';
import { LogsViewerComponent } from './logs-viewer/logs-viewer.component';

@NgModule({
  declarations: [
    AdminShellComponent,
    DashboardComponent,
    GalleryManagerComponent,
    BookingManagerComponent,
    LogsViewerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: AdminShellComponent,
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', component: DashboardComponent },
          { path: 'gallery', component: GalleryManagerComponent },
          { path: 'bookings', component: BookingManagerComponent },
          { path: 'logs', component: LogsViewerComponent },
        ],
      },
    ]),
  ],
})
export class AdminModule {}
