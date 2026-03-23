import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Booking, BookingStatus } from '@mss/shared';

export const BookingActions = createActionGroup({
  source: 'Booking',
  events: {
    // Public submission
    'Submit Booking': props<{ data: Partial<Booking> }>(),
    'Submit Booking Success': props<{ booking: Booking }>(),
    'Submit Booking Failure': props<{ error: string }>(),

    // Admin — load all
    'Load Bookings': props<{ status?: BookingStatus }>(),
    'Load Bookings Success': props<{ bookings: Booking[] }>(),
    'Load Bookings Failure': props<{ error: string }>(),

    // Admin — update
    'Update Booking': props<{ id: string; data: Partial<Booking> }>(),
    'Update Booking Success': props<{ booking: Booking }>(),
    'Update Booking Failure': props<{ error: string }>(),

    // UI
    'Clear Submission': emptyProps(),
  },
});
