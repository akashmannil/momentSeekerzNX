/**
 * Service catalog — single source of truth for all à la carte services.
 *
 * Server and client BOTH import from this file. Prices are stored in cents
 * so the server can re-validate cart totals without floating-point math.
 * To change a price, edit this file only — no schema migration required.
 */
import { PricingTier, ServiceCategory, SessionType } from '../enums';

export type ServiceId =
  | 'real-estate'
  | 'product-brand'
  | 'portrait'
  | 'drone'
  | 'virtual-tour'
  | 'cinematic-promo'
  | 'vertical-reels'
  | 'hero-banner'
  | 'logo-anim'
  | 'mockup'
  | '3d-viz'
  | 'grading'
  | 'sky'
  | 'flyers'
  | 'social-kit'
  | 'campaign'
  | 'event'
  | 'creative-direction';

export interface ServiceDefinition {
  id: ServiceId;
  name: string;
  category: ServiceCategory;
  description: string;
  priceCents: number;
  salePriceCents?: number;
  currency: 'CAD';
  unit?: string;
  sessionType?: SessionType;
  requiresScheduling: boolean;
  maxQuantity: number;
}

export const SERVICES: readonly ServiceDefinition[] = [
  { id: 'real-estate',       name: 'Real Estate Elite Pack',        category: ServiceCategory.CORE_VISUAL,       description: 'High-impact photo + video coverage for realtors, developers, and short-term rentals.', priceCents: 25000, currency: 'CAD', sessionType: SessionType.REAL_ESTATE,      requiresScheduling: true,  maxQuantity: 3 },
  { id: 'product-brand',     name: 'Product / Brand Photography',   category: ServiceCategory.CORE_VISUAL,       description: 'Studio-grade product & brand photography.',                                             priceCents: 25000, currency: 'CAD', sessionType: SessionType.PRODUCT_BRAND,    requiresScheduling: true,  maxQuantity: 3 },
  { id: 'portrait',          name: 'Personal & Team Portraits',     category: ServiceCategory.CORE_VISUAL,       description: 'Editorial portraits for founders, teams, talent.',                                      priceCents: 20000, currency: 'CAD', sessionType: SessionType.PORTRAIT,         requiresScheduling: true,  maxQuantity: 5 },
  { id: 'drone',             name: 'Drone & Aerial Shoots',         category: ServiceCategory.CORE_VISUAL,       description: 'Certified aerial coverage for properties and events.',                                  priceCents: 30000, currency: 'CAD', sessionType: SessionType.DRONE_AERIAL,     requiresScheduling: true,  maxQuantity: 3 },
  { id: 'virtual-tour',      name: '360\u00b0 Virtual Tours',           category: ServiceCategory.CORE_VISUAL,       description: 'Immersive walkthroughs for real estate & venues.',                                      priceCents: 35000, currency: 'CAD', sessionType: SessionType.VIRTUAL_TOUR,     requiresScheduling: true,  maxQuantity: 3 },
  { id: 'cinematic-promo',   name: 'Cinematic Promo Videos',        category: ServiceCategory.CORE_VISUAL,       description: 'Brand films that convert.',                                                             priceCents: 60000, currency: 'CAD', sessionType: SessionType.CINEMATIC_VIDEO,  requiresScheduling: true,  maxQuantity: 2 },

  { id: 'vertical-reels',    name: 'Vertical Reels (IG/TikTok/Shorts)', category: ServiceCategory.ADVANCED_TOOLS, description: 'Trend-driven short-form video.',                                                        priceCents: 15000, salePriceCents: 12000, currency: 'CAD', sessionType: SessionType.VERTICAL_REEL, requiresScheduling: true,  maxQuantity: 10 },
  { id: 'hero-banner',       name: 'Website Hero Video Banners',    category: ServiceCategory.ADVANCED_TOOLS,     description: 'Looping hero video for homepages.',                                                     priceCents: 20000, currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 3 },
  { id: 'logo-anim',         name: 'Logo Animation / Intros',       category: ServiceCategory.ADVANCED_TOOLS,     description: 'Motion idents for video and streams.',                                                  priceCents: 18000, currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 5 },
  { id: 'mockup',            name: 'Virtual Mockups & Staging',     category: ServiceCategory.ADVANCED_TOOLS,     description: 'Photoreal product mockups & virtual staging.',                                          priceCents: 12000, currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 10 },
  { id: '3d-viz',            name: '3D Concept Visualization',      category: ServiceCategory.ADVANCED_TOOLS,     description: 'Concept renders for pitch & launch.',                                                   priceCents: 40000, currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 5 },
  { id: 'grading',           name: 'Colour Grading & Styling',      category: ServiceCategory.ADVANCED_TOOLS,     description: 'Cinematic colour for photo & video.',                                                   priceCents: 9000,  currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 10 },
  { id: 'sky',               name: 'Sky / Background Replacement',  category: ServiceCategory.ADVANCED_TOOLS,     description: 'Clean, on-brand backgrounds.',                                                          priceCents: 6000,  currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 20 },

  { id: 'flyers',            name: 'Branded Flyers & Templates',    category: ServiceCategory.MARKETING_BRANDING, description: 'Flyers, templates, and collateral.',                                                    priceCents: 8000,  currency: 'CAD',                                           requiresScheduling: false, maxQuantity: 10 },
  { id: 'social-kit',        name: 'Monthly Social Media Kits',     category: ServiceCategory.MARKETING_BRANDING, description: 'A month of ready-to-post content.',                                                     priceCents: 40000, currency: 'CAD', unit: '/month',                           requiresScheduling: false, maxQuantity: 1 },
  { id: 'campaign',          name: 'Campaign / Project Shoots',     category: ServiceCategory.MARKETING_BRANDING, description: 'End-to-end campaign production.',                                                       priceCents: 70000, currency: 'CAD', sessionType: SessionType.CORPORATE_CAMPAIGN, requiresScheduling: true,  maxQuantity: 2 },

  { id: 'event',             name: 'Commercial & Event Coverage',   category: ServiceCategory.ADD_ON_PREMIUM,     description: 'On-site photo + video coverage.',                                                       priceCents: 50000, currency: 'CAD', sessionType: SessionType.EVENT_COVERAGE,   requiresScheduling: true,  maxQuantity: 2 },
  { id: 'creative-direction', name: 'Creative Direction & Concept', category: ServiceCategory.ADD_ON_PREMIUM,     description: 'Strategy and concept sessions.',                                                        priceCents: 10000, currency: 'CAD', unit: '/session',                         requiresScheduling: false, maxQuantity: 10 },
];

export const SERVICES_BY_ID: Readonly<Record<ServiceId, ServiceDefinition>> =
  SERVICES.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<ServiceId, ServiceDefinition>);

export function getServiceOrThrow(id: string): ServiceDefinition {
  const svc = SERVICES_BY_ID[id as ServiceId];
  if (!svc) throw new Error(`Unknown service id: ${id}`);
  return svc;
}

export function effectivePriceCents(svc: ServiceDefinition): number {
  return svc.salePriceCents ?? svc.priceCents;
}

/**
 * Tier \u2192 ServiceIds that are INCLUDED in that subscription (i.e. already paid).
 * If a user has this tier active, they should book these services without paying again.
 * If they try a service NOT in this list, they pay \u00e0 la carte.
 */
export const TIER_INCLUDED_SERVICES: Readonly<Record<PricingTier, readonly ServiceId[]>> = {
  [PricingTier.LITE]: [
    'vertical-reels',
    'grading',
    'sky',
  ],
  [PricingTier.PRO]: [
    'vertical-reels',
    'cinematic-promo',
    'hero-banner',
    'logo-anim',
    'mockup',
    'grading',
    'sky',
    'flyers',
  ],
  [PricingTier.BUSINESS]: [
    'real-estate',
    'product-brand',
    'portrait',
    'vertical-reels',
    'cinematic-promo',
    'hero-banner',
    'logo-anim',
    'mockup',
    '3d-viz',
    'grading',
    'sky',
    'flyers',
    'social-kit',
    'creative-direction',
  ],
  [PricingTier.CUSTOM]: [],
};

export function tierIncludes(tier: PricingTier | null | undefined, serviceId: ServiceId): boolean {
  if (!tier) return false;
  return TIER_INCLUDED_SERVICES[tier]?.includes(serviceId) ?? false;
}

/** Which plan tiers include a given service (for services-page badges). */
export function plansIncluding(serviceId: ServiceId): PricingTier[] {
  return (Object.entries(TIER_INCLUDED_SERVICES) as [PricingTier, readonly ServiceId[]][])
    .filter(([, ids]) => ids.includes(serviceId))
    .map(([tier]) => tier);
}
