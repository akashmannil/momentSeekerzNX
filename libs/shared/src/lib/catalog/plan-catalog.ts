/**
 * Pricing plan catalog — subscription tiers and their displayable feature matrix.
 *
 * Prices in cents; server re-validates on checkout.
 * Stripe price IDs are NOT stored here (server looks them up from env vars
 * by tier: STRIPE_PRICE_LITE, STRIPE_PRICE_PRO, STRIPE_PRICE_BUSINESS).
 *
 * Edit this file only to change displayed pricing or feature rows.
 */
import { PricingTier } from '../enums';
import { ServiceId, TIER_INCLUDED_SERVICES } from './service-catalog';

export interface PlanDefinition {
  tier: PricingTier;
  name: string;
  monthlyPriceCents: number | null;
  currency: 'CAD';
  tagline: string;
  featured?: boolean;
  highlights: readonly string[];
  turnaround: string;
  get includedServices(): readonly ServiceId[];
}

export const PLANS: readonly PlanDefinition[] = [
  {
    tier: PricingTier.LITE,
    name: 'Lite',
    monthlyPriceCents: 9900,
    currency: 'CAD',
    tagline: 'For solo creators & small brands starting out.',
    highlights: [
      '15 edited photos per month',
      '1 short-form video (15\u201330 sec)',
      'Royalty-free music included',
      'Basic retouching & colour grading',
      '3-day delivery',
    ],
    turnaround: '3-day delivery',
    get includedServices() { return TIER_INCLUDED_SERVICES[PricingTier.LITE]; },
  },
  {
    tier: PricingTier.PRO,
    name: 'Pro',
    monthlyPriceCents: 24900,
    currency: 'CAD',
    tagline: 'For growing brands who post weekly.',
    featured: true,
    highlights: [
      '25 edited photos per month',
      '1 cinematic video (60\u201390 sec)',
      '1 vertical reel',
      'Basic motion graphics',
      'Licensed music library',
      '2-day delivery',
    ],
    turnaround: '2-day delivery',
    get includedServices() { return TIER_INCLUDED_SERVICES[PricingTier.PRO]; },
  },
  {
    tier: PricingTier.BUSINESS,
    name: 'Business',
    monthlyPriceCents: 49900,
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
    get includedServices() { return TIER_INCLUDED_SERVICES[PricingTier.BUSINESS]; },
  },
  {
    tier: PricingTier.CUSTOM,
    name: 'Custom',
    monthlyPriceCents: null,
    currency: 'CAD',
    tagline: 'Multi-day productions and custom volume.',
    highlights: [
      'Scoped to your brief',
      'Multi-day productions',
      'Long-form campaigns',
      'Dedicated producer',
    ],
    turnaround: 'By agreement',
    get includedServices() { return TIER_INCLUDED_SERVICES[PricingTier.CUSTOM]; },
  },
];

export const PLANS_BY_TIER: Readonly<Record<PricingTier, PlanDefinition>> =
  PLANS.reduce((acc, p) => ({ ...acc, [p.tier]: p }), {} as Record<PricingTier, PlanDefinition>);

export function getPlanOrThrow(tier: string): PlanDefinition {
  const plan = PLANS_BY_TIER[tier as PricingTier];
  if (!plan) throw new Error(`Unknown plan tier: ${tier}`);
  return plan;
}

// ─── Feature comparison table (Claude-style) ──────────────────────────────────

export type FeatureValue = string | boolean;

export interface PlanFeatureRow {
  key: string;
  label: string;
  group: 'content' | 'production' | 'services' | 'delivery' | 'support';
  values: Record<PricingTier, FeatureValue>;
}

export const FEATURE_GROUPS: { key: PlanFeatureRow['group']; label: string }[] = [
  { key: 'content',    label: 'Monthly Content' },
  { key: 'production', label: 'Production & Post' },
  { key: 'services',   label: 'Included \u00c0 La Carte' },
  { key: 'delivery',   label: 'Delivery & SLAs' },
  { key: 'support',    label: 'Support' },
];

export const PLAN_FEATURES: readonly PlanFeatureRow[] = [
  // content
  { key: 'photos',         label: 'Edited photos / month',    group: 'content',    values: { lite: '15',       pro: '25',       business: '40',      custom: 'Unlimited' } },
  { key: 'short-video',    label: 'Short-form video',         group: 'content',    values: { lite: '1',        pro: '1',        business: '2',       custom: 'Custom'    } },
  { key: 'reels',          label: 'Vertical reels',           group: 'content',    values: { lite: false,      pro: '1',        business: '2',       custom: 'Custom'    } },
  { key: 'brand-story',    label: 'Brand-story video',        group: 'content',    values: { lite: false,      pro: false,      business: true,      custom: true         } },
  // production
  { key: 'retouch',        label: 'Retouching & colour',      group: 'production', values: { lite: 'Basic',    pro: 'Advanced', business: 'Advanced', custom: 'Advanced'  } },
  { key: 'motion',         label: 'Motion graphics',          group: 'production', values: { lite: false,      pro: 'Basic',    business: 'Advanced', custom: 'Custom'    } },
  { key: 'scripting',      label: 'Scriptwriting & storyboarding', group: 'production', values: { lite: false,  pro: false,      business: true,      custom: true         } },
  { key: 'source-files',   label: 'Source files included',    group: 'production', values: { lite: false,      pro: false,      business: true,      custom: true         } },
  { key: 'music',          label: 'Licensed music library',   group: 'production', values: { lite: 'Royalty-free', pro: true,   business: true,      custom: true         } },
  // services (tier-included à la carte)
  { key: 'vertical-reels', label: 'Vertical reels (\u00e0 la carte)',  group: 'services',   values: { lite: 'Included', pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'grading',        label: 'Colour grading & styling', group: 'services',   values: { lite: 'Included', pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'sky',            label: 'Sky / background replace', group: 'services',   values: { lite: 'Included', pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'cinematic-promo', label: 'Cinematic promo videos',  group: 'services',   values: { lite: 'Add-on',   pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'hero-banner',    label: 'Website hero banners',     group: 'services',   values: { lite: 'Add-on',   pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'logo-anim',      label: 'Logo animation / intros',  group: 'services',   values: { lite: 'Add-on',   pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'mockup',         label: 'Mockups & virtual staging', group: 'services',  values: { lite: 'Add-on',   pro: 'Included', business: 'Included', custom: 'Included' } },
  { key: 'portrait',       label: 'Team portraits',           group: 'services',   values: { lite: 'Add-on',   pro: 'Add-on',   business: 'Included', custom: 'Included' } },
  { key: 'social-kit',     label: 'Monthly social kit',       group: 'services',   values: { lite: 'Add-on',   pro: 'Add-on',   business: 'Included', custom: 'Included' } },
  { key: '3d-viz',         label: '3D concept visualization', group: 'services',   values: { lite: 'Add-on',   pro: 'Add-on',   business: 'Included', custom: 'Included' } },
  { key: 'creative-direction', label: 'Creative direction',   group: 'services',   values: { lite: 'Add-on',   pro: 'Add-on',   business: 'Included', custom: 'Included' } },
  // delivery
  { key: 'turnaround',     label: 'Turnaround',               group: 'delivery',   values: { lite: '3 days',   pro: '2 days',   business: '24 h',    custom: 'By agreement' } },
  { key: 'revisions',      label: 'Revision rounds',          group: 'delivery',   values: { lite: '1',        pro: '2',        business: '3',       custom: 'Unlimited' } },
  // support
  { key: 'chat-support',   label: 'Chat support',             group: 'support',    values: { lite: true,       pro: true,       business: true,      custom: true         } },
  { key: 'dedicated-pm',   label: 'Dedicated producer',       group: 'support',    values: { lite: false,      pro: false,      business: true,      custom: true         } },
];
