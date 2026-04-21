import { Component } from '@angular/core';
import { PricingPlan, PricingTier, ServiceCategory, ServiceOffering } from '@sm/shared';
import { IMAGES } from '../../shared/image-assets';

@Component({
  selector: 'sm-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent {
  readonly images = IMAGES;

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

  readonly plans: PricingPlan[] = [
    {
      tier: PricingTier.LITE,
      name: 'Lite',
      monthlyPrice: 99,
      currency: 'CAD',
      tagline: 'For solo creators & small brands starting out.',
      highlights: [
        '15 edited photos per month',
        '1 short-form video (15–30 sec)',
        'Royalty-free music included',
        'Basic retouching & colour grading',
        '3-day delivery',
      ],
      turnaround: '3-day delivery',
    },
    {
      tier: PricingTier.PRO,
      name: 'Pro',
      monthlyPrice: 249,
      currency: 'CAD',
      tagline: 'For growing brands who post weekly.',
      highlights: [
        '25 edited photos per month',
        '1 cinematic video (60–90 sec)',
        '1 vertical reel',
        'Basic motion graphics',
        'Licensed music library',
        '2-day delivery',
      ],
      turnaround: '2-day delivery',
      featured: true,
    },
    {
      tier: PricingTier.BUSINESS,
      name: 'Business',
      monthlyPrice: 499,
      currency: 'CAD',
      tagline: 'Full creative department, on retainer.',
      highlights: [
        '40 edited photos per month',
        '2 video edits (up to 2 min each)',
        '2 social reels + brand story video',
        'Team / founder portraits',
        'Scriptwriting & storyboarding',
        '24-hour turnaround',
        'Source files included',
      ],
      turnaround: '24-hour turnaround',
    },
  ];

  readonly alaCarte: ServiceOffering[] = [
    { id: 'product-brand', name: 'Product / Brand Photography', category: ServiceCategory.CORE_VISUAL, description: 'Studio-grade product & brand photography.', startingPrice: 250, currency: 'CAD' },
    { id: 'portrait', name: 'Personal & Team Portraits', category: ServiceCategory.CORE_VISUAL, description: 'Editorial portraits for founders, teams, talent.', startingPrice: 200, currency: 'CAD' },
    { id: 'drone', name: 'Drone & Aerial Shoots', category: ServiceCategory.CORE_VISUAL, description: 'Certified aerial coverage for properties and events.', startingPrice: 300, currency: 'CAD' },
    { id: 'virtual-tour', name: '360° Virtual Tours', category: ServiceCategory.CORE_VISUAL, description: 'Immersive walkthroughs for real estate & venues.', startingPrice: 350, currency: 'CAD' },
    { id: 'cinematic-promo', name: 'Cinematic Promo Videos', category: ServiceCategory.CORE_VISUAL, description: 'Brand films that convert.', startingPrice: 600, currency: 'CAD' },
    { id: 'vertical-reels', name: 'Vertical Reels (IG/TikTok/Shorts)', category: ServiceCategory.ADVANCED_TOOLS, description: 'Trend-driven short-form video.', startingPrice: 150, salePrice: 120, currency: 'CAD' },
    { id: 'hero-banner', name: 'Website Hero Video Banners', category: ServiceCategory.ADVANCED_TOOLS, description: 'Looping hero video for homepages.', startingPrice: 200, currency: 'CAD' },
    { id: 'logo-anim', name: 'Logo Animation / Intros', category: ServiceCategory.ADVANCED_TOOLS, description: 'Motion idents for video and streams.', startingPrice: 180, currency: 'CAD' },
    { id: 'mockup', name: 'Virtual Mockups & Staging', category: ServiceCategory.ADVANCED_TOOLS, description: 'Photoreal product mockups & virtual staging.', startingPrice: 120, currency: 'CAD' },
    { id: '3d-viz', name: '3D Concept Visualization', category: ServiceCategory.ADVANCED_TOOLS, description: 'Concept renders for pitch & launch.', startingPrice: 400, currency: 'CAD' },
    { id: 'grading', name: 'Colour Grading & Styling', category: ServiceCategory.ADVANCED_TOOLS, description: 'Cinematic colour for photo & video.', startingPrice: 90, currency: 'CAD' },
    { id: 'sky', name: 'Sky / Background Replacement', category: ServiceCategory.ADVANCED_TOOLS, description: 'Clean, on-brand backgrounds.', startingPrice: 60, currency: 'CAD' },
    { id: 'flyers', name: 'Branded Flyers & Templates', category: ServiceCategory.MARKETING_BRANDING, description: 'Flyers, templates, and collateral.', startingPrice: 80, currency: 'CAD' },
    { id: 'social-kit', name: 'Monthly Social Media Kits', category: ServiceCategory.MARKETING_BRANDING, description: 'A month of ready-to-post content.', startingPrice: 400, currency: 'CAD', unit: '/month' },
    { id: 'campaign', name: 'Campaign / Project Shoots', category: ServiceCategory.MARKETING_BRANDING, description: 'End-to-end campaign production.', startingPrice: 700, currency: 'CAD' },
    { id: 'event', name: 'Commercial & Event Coverage', category: ServiceCategory.ADD_ON_PREMIUM, description: 'On-site photo + video coverage.', startingPrice: 500, currency: 'CAD' },
    { id: 'creative-direction', name: 'Creative Direction & Concept', category: ServiceCategory.ADD_ON_PREMIUM, description: 'Strategy and concept sessions.', startingPrice: 100, currency: 'CAD', unit: '/session' },
  ];

  readonly categories: { key: ServiceCategory; label: string }[] = [
    { key: ServiceCategory.CORE_VISUAL, label: 'Core Visual' },
    { key: ServiceCategory.ADVANCED_TOOLS, label: 'Advanced Tools' },
    { key: ServiceCategory.MARKETING_BRANDING, label: 'Marketing & Branding' },
    { key: ServiceCategory.ADD_ON_PREMIUM, label: 'Add-On & Premium' },
  ];

  servicesFor(category: ServiceCategory): ServiceOffering[] {
    return this.alaCarte.filter(s => s.category === category);
  }
}
