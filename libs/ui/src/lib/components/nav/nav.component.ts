import { Component, HostListener, OnInit } from '@angular/core';
import { filter, map, Observable, startWith } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectCartCount,
  AuthActions,
  UiActions,
  selectNavOpen,
} from '@sm/data-access';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'sm-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
})
export class NavComponent implements OnInit {
  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  isAdmin$: Observable<boolean> = this.store.select(selectIsAdmin);
  cartCount$: Observable<number> = this.store.select(selectCartCount);
  navOpen$: Observable<boolean> = this.store.select(selectNavOpen);
  isDark$: Observable<boolean> = this.theme.theme$.pipe(map(t => t === 'dark'));
  isAdminRoute$: Observable<boolean> = this.router.events.pipe(
    filter((e): e is NavigationEnd => e instanceof NavigationEnd),
    map(e => e.urlAfterRedirects.startsWith('/admin')),
    startWith(this.router.url.startsWith('/admin')),
  );

  scrolled = false;
  navOpen = false;

  constructor(
    private readonly store: Store,
    private readonly theme: ThemeService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.navOpen$.subscribe(open => { this.navOpen = open; });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 50;
  }

  toggleNav(open: boolean): void {
    this.store.dispatch(UiActions.setNavOpen({ open }));
  }

  toggleTheme(): void {
    this.theme.toggle();
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
