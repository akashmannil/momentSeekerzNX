export enum PhotoCategory {
  REAL_ESTATE = 'real-estate',
  PRODUCT_BRAND = 'product-brand',
  PORTRAIT = 'portrait',
  AERIAL = 'aerial',
  CINEMATIC = 'cinematic',
  EVENTS = 'events',
  COMMERCIAL = 'commercial',
}

export enum SessionType {
  REAL_ESTATE = 'real-estate',
  PRODUCT_BRAND = 'product-brand',
  PORTRAIT = 'portrait',
  DRONE_AERIAL = 'drone-aerial',
  VIRTUAL_TOUR = 'virtual-tour',
  CINEMATIC_VIDEO = 'cinematic-video',
  VERTICAL_REEL = 'vertical-reel',
  EVENT_COVERAGE = 'event-coverage',
  CORPORATE_CAMPAIGN = 'corporate-campaign',
  OTHER = 'other',
}

export enum ServiceCategory {
  CORE_VISUAL = 'core-visual',
  ADVANCED_TOOLS = 'advanced-tools',
  MARKETING_BRANDING = 'marketing-branding',
  ADD_ON_PREMIUM = 'add-on-premium',
}

export enum PricingTier {
  LITE = 'lite',
  PRO = 'pro',
  BUSINESS = 'business',
  CUSTOM = 'custom',
}

export enum BookingStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum CartItemType {
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FULFILLING = 'fulfilling',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum SubscriptionStatus {
  NONE = 'none',
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past-due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  ENDED = 'ended',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
