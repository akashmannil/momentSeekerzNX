import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable, switchMap, take } from 'rxjs';
import { selectAccessToken } from '@mss/data-access';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly store: Store) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.store.select(selectAccessToken).pipe(
      take(1),
      switchMap(token => {
        if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          });
        }
        return next.handle(req);
      })
    );
  }
}
