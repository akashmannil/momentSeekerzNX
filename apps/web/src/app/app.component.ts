import { AfterViewInit, Component, NgZone, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from '@sm/data-access';

const MIN_SPLASH_MS = 600;

@Component({
  selector: 'sm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private readonly store: Store, private readonly ngZone: NgZone) {}

  ngOnInit(): void {
    // Restore auth session from localStorage on app boot
    this.store.dispatch(AuthActions.restoreSession());
  }

  ngAfterViewInit(): void {
    const wait = Math.max(0, MIN_SPLASH_MS - performance.now());
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.add('app-ready');
        });
      }, wait);
    });
  }
}
