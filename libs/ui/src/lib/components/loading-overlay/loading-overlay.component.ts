import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectLoading } from '@sm/data-access';

@Component({
  selector: 'sm-loading-overlay',
  template: `
    <div *ngIf="loading$ | async" class="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950/80 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-4">
        <div class="w-px h-16 bg-gold-400 animate-pulse"></div>
        <p class="section-label text-white/40">Loading</p>
      </div>
    </div>
  `,
})
export class LoadingOverlayComponent {
  loading$: Observable<boolean> = this.store.select(selectLoading);
  constructor(private readonly store: Store) {}
}
