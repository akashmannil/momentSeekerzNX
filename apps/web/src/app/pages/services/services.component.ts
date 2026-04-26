import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import {
  SERVICES,
  ServiceDefinition,
  ServiceId,
  PLANS_BY_TIER,
  plansIncluding,
  tierIncludes,
  effectivePriceCents,
  ServiceCategory,
  PricingTier,
} from '@sm/shared';
import { CartActions, selectActiveTier } from '@sm/data-access';
import { IMAGES } from '../../shared/image-assets';

interface CategoryBlock {
  key: ServiceCategory;
  title: string;
  lede: string;
  hero: string;
  services: readonly ServiceDefinition[];
}

@Component({
  selector: 'sm-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent {
  readonly images = IMAGES;

  /** Image per service — local display concern only. */
  readonly serviceImages: Record<ServiceId, string> = {
    'real-estate':       IMAGES.realEstateInterior,
    'product-brand':     IMAGES.productBrand,
    'portrait':          IMAGES.portrait,
    'drone':             IMAGES.aerial,
    'virtual-tour':      IMAGES.virtualTour,
    'cinematic-promo':   IMAGES.promoVideo,
    'vertical-reels':    IMAGES.verticalReel,
    'hero-banner':       IMAGES.heroBanner,
    'logo-anim':         IMAGES.logoMotion,
    'mockup':            IMAGES.mockup,
    '3d-viz':            IMAGES.threeDViz,
    'grading':           IMAGES.colorGrading,
    'sky':               IMAGES.skyReplacement,
    'flyers':            IMAGES.flyers,
    'social-kit':        IMAGES.socialKit,
    'campaign':          IMAGES.campaign,
    'event':             IMAGES.eventCoverage,
    'creative-direction': IMAGES.creativeDirection,
  };

  readonly categories: CategoryBlock[] = [
    {
      key: ServiceCategory.CORE_VISUAL,
      title: 'Core Visual',
      lede: 'Photo and video production for the foundation of your brand.',
      hero: IMAGES.heroStudio,
      services: SERVICES.filter(s => s.category === ServiceCategory.CORE_VISUAL),
    },
    {
      key: ServiceCategory.ADVANCED_TOOLS,
      title: 'Advanced Visual Tools',
      lede: 'Motion, 3D, and post-production tools that push your content further.',
      hero: IMAGES.heroCinematic,
      services: SERVICES.filter(s => s.category === ServiceCategory.ADVANCED_TOOLS),
    },
    {
      key: ServiceCategory.MARKETING_BRANDING,
      title: 'Marketing & Branding',
      lede: 'Content that builds your brand and pushes it to market.',
      hero: IMAGES.heroAerial,
      services: SERVICES.filter(s => s.category === ServiceCategory.MARKETING_BRANDING),
    },
    {
      key: ServiceCategory.ADD_ON_PREMIUM,
      title: 'Add-On & Premium',
      lede: 'Heavier engagements — full-scale coverage or ongoing creative direction.',
      hero: IMAGES.heroBooking,
      services: SERVICES.filter(s => s.category === ServiceCategory.ADD_ON_PREMIUM),
    },
  ];

  activeTier$: Observable<PricingTier | null> = this.store.select(selectActiveTier);

  constructor(private readonly store: Store, private readonly router: Router) {}

  imageFor(svc: ServiceDefinition): string {
    return this.serviceImages[svc.id] ?? IMAGES.heroStudio;
  }

  priceLabel(svc: ServiceDefinition): string {
    const price = effectivePriceCents(svc) / 100;
    const unit = svc.unit ?? '';
    return `From CA$${price.toFixed(0)}${unit}`;
  }

  /** Plan names (not the currently-subscribed tier) that include this service. */
  includedPlanNames(svc: ServiceDefinition): string[] {
    return plansIncluding(svc.id).map(t => PLANS_BY_TIER[t].name);
  }

  isIncludedInTier(svc: ServiceDefinition, tier: PricingTier | null): boolean {
    return tierIncludes(tier, svc.id);
  }

  /**
   * Add-to-cart (or navigate to booking). For subscribed users with coverage,
   * the server marks the line-item as includedByTier (no charge) and we route
   * the user to /cart so they see the included badge before checkout.
   */
  addToCart(svc: ServiceDefinition): void {
    this.store.dispatch(CartActions.addItem({ serviceId: svc.id, quantity: 1 }));
    this.router.navigate(['/cart']);
  }

  book(svc: ServiceDefinition): void {
    this.router.navigate(['/booking'], {
      queryParams: svc.sessionType ? { session: svc.sessionType } : {},
    });
  }
}
