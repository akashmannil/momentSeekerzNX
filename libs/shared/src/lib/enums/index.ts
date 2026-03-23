export enum PhotoCategory {
  WEDDINGS = 'weddings',
  PORTRAITS = 'portraits',
  COMMERCIAL = 'commercial',
  LANDSCAPE = 'landscape',
  EVENTS = 'events',
  FINE_ART = 'fine-art',
}

export enum SessionType {
  PORTRAIT = 'portrait',
  WEDDING = 'wedding',
  ENGAGEMENT = 'engagement',
  CORPORATE = 'corporate',
  COMMERCIAL = 'commercial',
  BOUDOIR = 'boudoir',
  FAMILY = 'family',
  NEWBORN = 'newborn',
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
