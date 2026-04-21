import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  BookingActions,
  selectBookingSubmitting,
  selectBookingSubmitSuccess,
  selectBookingError,
} from '@sm/data-access';
import { SessionType } from '@sm/shared';
import { IMAGES } from '../../shared/image-assets';

interface SessionPackage {
  type: SessionType;
  label: string;
  description: string;
  startingPrice: string;
  image: string;
}

@Component({
  selector: 'sm-booking',
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
    [SessionType.REAL_ESTATE]: 'Real Estate Shoot',
    [SessionType.PRODUCT_BRAND]: 'Product / Brand',
    [SessionType.PORTRAIT]: 'Portraits & Headshots',
    [SessionType.DRONE_AERIAL]: 'Drone & Aerial',
    [SessionType.VIRTUAL_TOUR]: '360° Virtual Tour',
    [SessionType.CINEMATIC_VIDEO]: 'Cinematic Promo Video',
    [SessionType.VERTICAL_REEL]: 'Vertical Reels',
    [SessionType.EVENT_COVERAGE]: 'Event Coverage',
    [SessionType.CORPORATE_CAMPAIGN]: 'Campaign / Corporate',
    [SessionType.OTHER]: 'Something Else',
  };

  readonly images = IMAGES;

  readonly packages: SessionPackage[] = [
    {
      type: SessionType.REAL_ESTATE,
      label: 'Real Estate',
      description: 'Photo + video coverage for realtors — exterior, interior, walkthrough.',
      startingPrice: 'From CA$250',
      image: IMAGES.realEstate,
    },
    {
      type: SessionType.PRODUCT_BRAND,
      label: 'Product / Brand',
      description: 'Perfectly lit, styled, and edited visuals that elevate your store.',
      startingPrice: 'From CA$250',
      image: IMAGES.productFlatlay,
    },
    {
      type: SessionType.PORTRAIT,
      label: 'Portraits',
      description: 'Personal, team, or founder portraits with editorial polish.',
      startingPrice: 'From CA$200',
      image: IMAGES.portraitStudio,
    },
    {
      type: SessionType.DRONE_AERIAL,
      label: 'Drone & Aerial',
      description: 'Certified aerial coverage — properties, events, cinematic B-roll.',
      startingPrice: 'From CA$300',
      image: IMAGES.aerialDrone,
    },
    {
      type: SessionType.VIRTUAL_TOUR,
      label: '360° Virtual Tour',
      description: 'Immersive walkthroughs for properties, spaces, and venues.',
      startingPrice: 'From CA$350',
      image: IMAGES.virtualTour,
    },
    {
      type: SessionType.CINEMATIC_VIDEO,
      label: 'Cinematic Promo',
      description: 'Brand films and hero videos built to convert.',
      startingPrice: 'From CA$600',
      image: IMAGES.cinematicFilm,
    },
    {
      type: SessionType.VERTICAL_REEL,
      label: 'Vertical Reels',
      description: 'Scroll-stopping short-form for IG, TikTok, and Shorts.',
      startingPrice: 'From CA$150',
      image: IMAGES.verticalReel,
    },
    {
      type: SessionType.EVENT_COVERAGE,
      label: 'Event Coverage',
      description: 'Commercial and live event photo + video, on-site crew.',
      startingPrice: 'From CA$500',
      image: IMAGES.eventCoverage,
    },
    {
      type: SessionType.CORPORATE_CAMPAIGN,
      label: 'Campaign Shoot',
      description: 'Full creative campaign — concept, production, post.',
      startingPrice: 'From CA$700',
      image: IMAGES.campaign,
    },
    {
      type: SessionType.OTHER,
      label: 'Something Else',
      description: 'Custom brief? Tell us what you need and we\'ll scope it.',
      startingPrice: 'Custom Quote',
      image: IMAGES.creativeDirection,
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store,
    private readonly route: ActivatedRoute,
  ) {}

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

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['session']) {
        this.form.patchValue({ sessionType: params['session'] });
      }
    });

    this.success$.pipe(takeUntil(this.destroy$)).subscribe(success => {
      if (success) this.form.reset();
    });
  }

  selectPackage(type: SessionType): void {
    this.form.patchValue({ sessionType: type });
    document.querySelector('#booking-form')?.scrollIntoView({ behavior: 'smooth' });
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
