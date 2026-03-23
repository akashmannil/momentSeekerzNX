import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

const routes: Routes = [
  // ── Public routes ────────────────────────────────────────────────────────────
  {
    path: '',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule),
    title: 'Moment Seekers Studio',
  },
  {
    path: 'gallery',
    loadChildren: () => import('./pages/gallery/gallery.module').then(m => m.GalleryPageModule),
    title: 'Gallery — Moment Seekers Studio',
  },
  {
    path: 'store',
    loadChildren: () => import('./pages/store/store-page.module').then(m => m.StorePageModule),
    title: 'Prints & Store — Moment Seekers Studio',
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule),
    title: 'About — Moment Seekers Studio',
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule),
    title: 'Contact — Moment Seekers Studio',
  },
  {
    path: 'booking',
    loadChildren: () => import('./pages/booking/booking.module').then(m => m.BookingModule),
    title: 'Book a Session — Moment Seekers Studio',
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
    title: 'Sign In',
  },

  // ── Protected admin routes ───────────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule),
    title: 'Admin — Moment Seekers Studio',
  },

  // ── Fallback ─────────────────────────────────────────────────────────────────
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
