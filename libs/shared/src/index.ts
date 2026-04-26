// Enums
export * from './lib/enums';

// Catalog (plans + services — source of truth for server & client)
export * from './lib/catalog';

// Interfaces
export * from './lib/interfaces/photo.interface';
export * from './lib/interfaces/user.interface';
export * from './lib/interfaces/booking.interface';
export * from './lib/interfaces/cart.interface';

// DTOs (also used by the NestJS API for validation)
export * from './lib/dtos/auth.dto';
export * from './lib/dtos/gallery.dto';
export * from './lib/dtos/booking.dto';
export * from './lib/dtos/cart.dto';
