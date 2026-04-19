import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { BookingActions } from './booking.actions';
import { API_SERVICE_TOKEN } from '../../tokens';
import { Booking } from '@sm/shared';

@Injectable()
export class BookingEffects {
  private actions$ = inject(Actions);
  private api = inject(API_SERVICE_TOKEN);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.submitBooking),
      switchMap(({ data }) =>
        this.api.post<Booking>('/booking', data).pipe(
          map(booking => BookingActions.submitBookingSuccess({ booking })),
          catchError(err => of(BookingActions.submitBookingFailure({ error: err.message })))
        )
      )
    )
  );

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadBookings),
      switchMap(({ status }) => {
        const params: Record<string, string> = {};
        if (status) params['status'] = status;
        return this.api.get<Booking[]>('/booking', params).pipe(
          map(bookings => BookingActions.loadBookingsSuccess({ bookings })),
          catchError(err => of(BookingActions.loadBookingsFailure({ error: err.message })))
        );
      })
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.updateBooking),
      switchMap(({ id, data }) =>
        this.api.patch<Booking>(`/booking/${id}`, data).pipe(
          map(booking => BookingActions.updateBookingSuccess({ booking })),
          catchError(err => of(BookingActions.updateBookingFailure({ error: err.message })))
        )
      )
    )
  );
}
