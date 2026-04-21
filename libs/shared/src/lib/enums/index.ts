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

export enum PrintSize {
  WALLET = '2.5x3.5',
  FOUR_SIX = '4x6',
  FIVE_SEVEN = '5x7',
  EIGHT_TEN = '8x10',
  ELEVEN_FOURTEEN = '11x14',
  SIXTEEN_TWENTY = '16x20',
  TWENTY_THIRTY = '20x30',
}

export enum PrintFinish {
  MATTE = 'matte',
  GLOSSY = 'glossy',
  METALLIC = 'metallic',
  FINE_ART = 'fine-art',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
