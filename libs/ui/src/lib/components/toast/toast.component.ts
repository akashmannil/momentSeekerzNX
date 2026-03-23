import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, delay, tap } from 'rxjs';
import { selectToast, UiActions } from '@mss/data-access';

@Component({
  selector: 'mss-toast',
  template: `
    <div
      *ngIf="toast$ | async as toast"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass-panel px-6 py-4 flex items-center gap-3 animate-fade-up shadow-xl min-w-[280px]"
      [ngClass]="{
        'border-green-500/30': toast.type === 'success',
        'border-red-500/30': toast.type === 'error',
        'border-gold-400/30': toast.type === 'info'
      }"
      role="alert"
    >
      <span *ngIf="toast.type === 'success'" class="text-green-400">✓</span>
      <span *ngIf="toast.type === 'error'" class="text-red-400">✕</span>
      <span *ngIf="toast.type === 'info'" class="text-gold-400">i</span>
      <p class="font-body text-sm">{{ toast.message }}</p>
      <button (click)="dismiss()" class="ml-auto text-white/40 hover:text-white" aria-label="Dismiss">✕</button>
    </div>
  `,
})
export class ToastComponent {
  toast$ = this.store.select(selectToast);
  constructor(private readonly store: Store) {}
  dismiss(): void { this.store.dispatch(UiActions.clearToast()); }
}
