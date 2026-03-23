import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthActions } from './auth.actions';

// The ApiService is injected from the Angular app — effects only depend on actions + services.
// We use a token-based injection to avoid circular deps.
import { API_SERVICE_TOKEN } from '../../tokens';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private api = inject(API_SERVICE_TOKEN);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.api.post<any>('/auth/login', { email, password }).pipe(
          map(res =>
            AuthActions.loginSuccess({
              user: res.user,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            })
          ),
          catchError(err => of(AuthActions.loginFailure({ error: err.message ?? 'Login failed' })))
        )
      )
    )
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ email, name, password }) =>
        this.api.post<any>('/auth/register', { email, name, password }).pipe(
          map(res =>
            AuthActions.registerSuccess({
              user: res.user,
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
            })
          ),
          catchError(err => of(AuthActions.registerFailure({ error: err.message ?? 'Registration failed' })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(({ user, accessToken, refreshToken }) => {
          // Persist tokens to localStorage for session restoration
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          // Navigate based on role
          const dest = user.role === 'admin' ? '/admin' : '/gallery';
          this.router.navigate([dest]);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      switchMap(() =>
        this.api.post<void>('/auth/logout', {}).pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess())) // always clear on client
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          this.router.navigate(['/']);
        })
      ),
    { dispatch: false }
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      map(() => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          return AuthActions.sessionRestored({
            user: JSON.parse(userStr),
            accessToken: token,
          });
        }
        return AuthActions.sessionExpired();
      })
    )
  );
}
