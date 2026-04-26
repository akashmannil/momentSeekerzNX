import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'sm_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme$ = new BehaviorSubject<Theme>(this._resolve());

  readonly theme$: Observable<Theme> = this._theme$.asObservable();

  constructor() {
    // Apply immediately so the data-theme attribute matches localStorage/OS
    // preference before any component renders.
    this._apply(this._theme$.value);
  }

  toggle(): void {
    const next: Theme = this._theme$.value === 'dark' ? 'light' : 'dark';
    this._apply(next);
    this._theme$.next(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private browsing */ }
  }

  private _resolve(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch { /* private browsing */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private _apply(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
