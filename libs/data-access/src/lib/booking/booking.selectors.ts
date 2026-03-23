import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingState, selectAllBookings } from './booking.reducer';

export const selectBookingState = createFeatureSelector<BookingState>('booking');

export const selectBookings = createSelector(selectBookingState, selectAllBookings);
export const selectBookingLoading = createSelector(selectBookingState, s => s.loading);
export const selectBookingSubmitting = createSelector(selectBookingState, s => s.submitting);
export const selectBookingSubmitSuccess = createSelector(selectBookingState, s => s.submitSuccess);
export const selectBookingError = createSelector(selectBookingState, s => s.error);
