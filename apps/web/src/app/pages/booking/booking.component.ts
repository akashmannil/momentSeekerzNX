import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  BookingActions,
  selectBookingSubmitting,
  selectBookingSubmitSuccess,
  selectBookingError,
} from '@mss/data-access';
import { SessionType } from '@mss/shared';

@Component({
  selector: 'mss-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
})
export class BookingComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  submitting$: Observable<boolean> = this.store.select(selectBookingSubmitting);
  success$: Observable<boolean> = this.store.select(selectBookingSubmitSuccess);
  error$: Observable<string | null> = this.store.select(selectBookingError);

  readonly sessionTypes = Object.values(SessionType);
  readonly sessionLabels: Record<string, string> = {
    portrait: 'Portrait Session',
    wedding: 'Wedding',
    engagement: 'Engagement',
    corporate: 'Corporate / Headshots',
    commercial: 'Commercial',
    boudoir: 'Boudoir',
    family: 'Family',
    newborn: 'Newborn',
  };

  private destroy$ = new Subject<void>();

  constructor(private readonly fb: FormBuilder, private readonly store: Store) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      clientName: ['', [Validators.required, Validators.maxLength(100)]],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientPhone: ['', Validators.required],
      sessionType: ['', Validators.required],
      preferredDate: ['', Validators.required],
      alternateDate: [''],
      location: [''],
      message: ['', Validators.maxLength(1000)],
    });

    // Reset form on success
    this.success$.pipe(takeUntil(this.destroy$)).subscribe(success => {
      if (success) this.form.reset();
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.dispatch(BookingActions.submitBooking({ data: this.form.value }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(BookingActions.clearSubmission());
  }
}
