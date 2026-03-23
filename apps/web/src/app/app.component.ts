import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AuthActions } from '@mss/data-access';

@Component({
  selector: 'mss-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    // Restore auth session from localStorage on app boot
    this.store.dispatch(AuthActions.restoreSession());
  }
}
