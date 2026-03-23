import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

// Feature state
import {
  authReducer, galleryReducer, bookingReducer, uiReducer,
  AuthEffects, GalleryEffects, BookingEffects,
  StoreEffects,
} from '@mss/data-access';
import { storeReducer } from '@mss/data-access';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core/core.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,

    // ── NgRx root store ──────────────────────────────────────────────────────
    StoreModule.forRoot({
      router: routerReducer,
      auth: authReducer,
      gallery: galleryReducer,
      booking: bookingReducer,
      ui: uiReducer,
      store: storeReducer,
    }),
    EffectsModule.forRoot([AuthEffects, GalleryEffects, BookingEffects, StoreEffects]),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'Moment Seekers Studio',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
