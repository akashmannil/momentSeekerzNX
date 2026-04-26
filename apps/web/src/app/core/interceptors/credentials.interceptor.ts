import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Adds withCredentials + CSRF token to every API request.
 * We roll our own interceptor (not HttpClientXsrfModule) because the API is
 * on a different origin in dev (4200 → 3000) and Angular's built-in XSRF
 * support is same-origin only.
 */
@Injectable()
export class CredentialsInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let request = req.clone({ withCredentials: true });
    if (!SAFE_METHODS.has(request.method)) {
      const token = readCookie(CSRF_COOKIE);
      if (token) request = request.clone({ setHeaders: { [CSRF_HEADER]: token } });
    }
    return next.handle(request);
  }
}

function readCookie(name: string): string | null {
  const parts = (document.cookie || '').split(';').map(s => s.trim());
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    if (part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}
