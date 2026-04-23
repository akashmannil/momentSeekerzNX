import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  PLANS,
  PlanDefinition,
  PLAN_FEATURES,
  PlanFeatureRow,
  FEATURE_GROUPS,
  SERVICES,
  ServiceDefinition,
  PricingTier,
  ServiceCategory,
  effectivePriceCents,
} from '@sm/shared';
import {
  CartActions,
  selectActiveTier,
  selectCheckingOut,
} from '@sm/data-access';
import { IMAGES } from '../../shared/image-assets';

@Component({
  selector: 'sm-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent {
  readonly images = IMAGES;

  readonly plans: readonly PlanDefinition[] = PLANS;
  readonly featureGroups = FEATURE_GROUPS;
  readonly features: readonly PlanFeatureRow[] = PLAN_FEATURES;
  readonly pricedPlans = PLANS.filter(p => p.monthlyPriceCents !== null);
  readonly tiers: PricingTier[] = PLANS.map(p => p.tier);

  readonly planImages: Record<PricingTier, string> = {
    [PricingTier.LITE]: IMAGES.productFlatlay,
    [PricingTier.PRO]: IMAGES.cinematicSet,
    [PricingTier.BUSINESS]: IMAGES.campaign,
    [PricingTier.CUSTOM]: IMAGES.creativeDirection,
  };

  readonly categoryImages: Record<ServiceCategory, string> = {
    [ServiceCategory.CORE_VISUAL]: IMAGES.heroStudio,
    [ServiceCategory.ADVANCED_TOOLS]: IMAGES.heroCinematic,
    [ServiceCategory.MARKETING_BRANDING]: IMAGES.heroAerial,
    [ServiceCategory.ADD_ON_PREMIUM]: IMAGES.heroBooking,
  };

  readonly categories: { key: ServiceCategory; label: string }[] = [
    { key: ServiceCategory.CORE_VISUAL, label: 'Core Visual' },
    { key: ServiceCategory.ADVANCED_TOOLS, label: 'Advanced Tools' },
    { key: ServiceCategory.MARKETING_BRANDING, label: 'Marketing & Branding' },
    { key: ServiceCategory.ADD_ON_PREMIUM, label: 'Add-On & Premium' },
  ];

  activeTier$: Observable<PricingTier | null> = this.store.select(selectActiveTier);
  checkingOut$: Observable<boolean>           = this.store.select(selectCheckingOut);

  constructor(private readonly store: Store) {}

  servicesFor(category: ServiceCategory): ServiceDefinition[] {
    return SERVICES.filter(s => s.category === category);
  }

  featuresInGroup(group: PlanFeatureRow['group']): PlanFeatureRow[] {
    return this.features.filter(f => f.group === group);
  }

  isBoolean(v: unknown): v is boolean {
    return typeof v === 'boolean';
  }

  dollars(cents: number): string {
    return `${(cents / 100).toFixed(0)}`;
  }

  priceDollars(svc: ServiceDefinition): number {
    return effectivePriceCents(svc) / 100;
  }

  fullPriceDollars(svc: ServiceDefinition): number {
    return svc.priceCents / 100;
  }

  subscribe(tier: PricingTier): void {
    if (tier === PricingTier.CUSTOM) return;
    this.store.dispatch(CartActions.checkoutSubscription({ tier }));
  }
}
