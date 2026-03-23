import { createReducer, on } from '@ngrx/store';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Booking } from '@mss/shared';
import { BookingActions } from './booking.actions';

export interface BookingState extends EntityState<Booking> {
  loading: boolean;
  submitting: boolean;
  submitSuccess: boolean;
  error: string | null;
}

const adapter: EntityAdapter<Booking> = createEntityAdapter<Booking>({
  selectId: b => b._id,
  sortComparer: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
});

export const bookingInitialState: BookingState = adapter.getInitialState({
  loading: false,
  submitting: false,
  submitSuccess: false,
  error: null,
});

export const bookingReducer = createReducer(
  bookingInitialState,

  on(BookingActions.submitBooking, state => ({ ...state, submitting: true, error: null, submitSuccess: false })),
  on(BookingActions.submitBookingSuccess, (state, { booking }) =>
    adapter.addOne(booking, { ...state, submitting: false, submitSuccess: true })
  ),
  on(BookingActions.submitBookingFailure, (state, { error }) => ({ ...state, submitting: false, error })),

  on(BookingActions.loadBookings, state => ({ ...state, loading: true, error: null })),
  on(BookingActions.loadBookingsSuccess, (state, { bookings }) =>
    adapter.setAll(bookings, { ...state, loading: false })
  ),
  on(BookingActions.loadBookingsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(BookingActions.updateBookingSuccess, (state, { booking }) =>
    adapter.updateOne({ id: booking._id, changes: booking }, state)
  ),

  on(BookingActions.clearSubmission, state => ({ ...state, submitSuccess: false, error: null }))
);

export const { selectAll: selectAllBookings, selectEntities: selectBookingEntities } =
  adapter.getSelectors();
