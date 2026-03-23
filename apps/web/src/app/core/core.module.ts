/**
 * CoreModule — singleton services and HTTP interceptors.
 * Imported only once in AppModule.
 */
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ApiService } from './services/api.service';
import { API_SERVICE_TOKEN } from '@mss/data-access';
import { UiModule } from '@mss/ui';

@NgModule({
  imports: [CommonModule, UiModule],
  exports: [UiModule],
  providers: [
    ApiService,
    // Provide ApiService via the InjectionToken so NgRx effects can use it
    { provide: API_SERVICE_TOKEN, useExisting: ApiService },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) throw new Error('CoreModule is already loaded. Import it only in AppModule.');
  }
}
