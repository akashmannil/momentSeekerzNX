import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AuthActions, UiActions } from '@sm/data-access';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly store: Store) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Token expired — clear auth state
          this.store.dispatch(AuthActions.sessionExpired());
        } else if (err.status >= 500) {
          this.store.dispatch(
            UiActions.showToast({ message: 'A server error occurred. Please try again.', toastType: 'error' })
          );
        }
        const message = err.error?.message ?? err.message ?? 'Request failed';
        return throwError(() => new Error(Array.isArray(message) ? message.join(', ') : message));
      })
    );
  }
}
