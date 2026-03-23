import { Component, HostListener, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectCartCount,
  AuthActions,
  UiActions,
  selectNavOpen,
} from '@mss/data-access';

@Component({
  selector: 'mss-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  isAdmin$: Observable<boolean> = this.store.select(selectIsAdmin);
  cartCount$: Observable<number> = this.store.select(selectCartCount);
  navOpen$: Observable<boolean> = this.store.select(selectNavOpen);
  scrolled = false;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  toggleNav(open: boolean): void {
    this.store.dispatch(UiActions.setNavOpen({ open }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
