import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from '@sm/data-access';

@Component({
  selector: 'sm-admin-shell',
  template: `
    <div class="flex min-h-screen">
      <aside class="w-60 bg-obsidian-900 border-r border-white/10 flex flex-col">
        <div class="p-6 border-b border-white/10">
          <p class="section-label">Savage Media</p>
          <h2 class="font-display text-xl mt-1">Admin</h2>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="dashboard" routerLinkActive="text-gold-400 bg-white/5"
             class="flex items-center gap-3 px-4 py-3 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors font-body text-sm">
            Dashboard
          </a>
          <a routerLink="gallery" routerLinkActive="text-gold-400 bg-white/5"
             class="flex items-center gap-3 px-4 py-3 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors font-body text-sm">
            Gallery
          </a>
          <a routerLink="bookings" routerLinkActive="text-gold-400 bg-white/5"
             class="flex items-center gap-3 px-4 py-3 rounded text-white/60 hover:text-white hover:bg-white/5 transition-colors font-body text-sm">
            Bookings
          </a>
        </nav>
        <div class="p-4 border-t border-white/10">
          <button (click)="logout()" class="btn-ghost text-xs w-full justify-start pl-4">Sign Out</button>
          <a routerLink="/" class="block text-white/30 text-xs text-center mt-2 hover:text-white">\u2190 View Site</a>
        </div>
      </aside>
      <main class="flex-1 bg-obsidian-950 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  constructor(private readonly store: Store) {}
  logout(): void { this.store.dispatch(AuthActions.logout()); }
}
