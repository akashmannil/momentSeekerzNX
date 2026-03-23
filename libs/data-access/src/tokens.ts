/**
 * Injection token for the ApiService — avoids tight coupling between
 * data-access lib effects and the concrete Angular HttpClient-based service.
 * The actual ApiService is provided in the web app's CoreModule.
 */
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface IApiService {
  get<T>(path: string, params?: Record<string, string>): Observable<T>;
  post<T>(path: string, body: unknown): Observable<T>;
  patch<T>(path: string, body: unknown): Observable<T>;
  put<T>(path: string, body: unknown): Observable<T>;
  delete<T>(path: string): Observable<T>;
}

export const API_SERVICE_TOKEN = new InjectionToken<IApiService>('API_SERVICE');
