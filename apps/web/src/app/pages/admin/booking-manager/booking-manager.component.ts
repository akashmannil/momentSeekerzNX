import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  BookingActions,
  selectBookings,
  selectBookingLoading,
} from '@mss/data-access';
import { Booking, BookingStatus } from '@mss/shared';

@Component({
  selector: 'mss-booking-manager',
  templateUrl: './booking-manager.component.html',
})
export class BookingManagerComponent implements OnInit {
  bookings$: Observable<Booking[]> = this.store.select(selectBookings);
  loading$: Observable<boolean> = this.store.select(selectBookingLoading);
  selectedStatus: BookingStatus | undefined = undefined;
  statuses = Object.values(BookingStatus);

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(BookingActions.loadBookings({}));
  }

  filterByStatus(status: BookingStatus | ''): void {
    this.selectedStatus = status || undefined;
    this.store.dispatch(BookingActions.loadBookings({ status: this.selectedStatus }));
  }

  updateStatus(booking: Booking, status: BookingStatus): void {
    this.store.dispatch(
      BookingActions.updateBooking({ id: booking._id, data: { status } })
    );
  }

  statusClass(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      pending: 'text-yellow-400',
      reviewing: 'text-blue-400',
      confirmed: 'text-green-400',
      completed: 'text-white/40',
      cancelled: 'text-red-400',
    };
    return map[status] ?? '';
  }
}
