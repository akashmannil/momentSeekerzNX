import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import {
  authReducer, galleryReducer, bookingReducer, uiReducer, cartReducer,
  AuthEffects, GalleryEffects, BookingEffects, CartEffects,
} from '@sm/data-access';

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
    StoreModule.forRoot({
      router: routerReducer,
      auth: authReducer,
      gallery: galleryReducer,
      booking: bookingReducer,
      ui: uiReducer,
      cart: cartReducer,
    }),
    EffectsModule.forRoot([AuthEffects, GalleryEffects, BookingEffects, CartEffects]),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
      name: 'Savage Media',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
