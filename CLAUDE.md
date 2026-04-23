# CLAUDE.md — Savage Media

This file is the authoritative guide for AI-assisted development on this project.
**Read this before making any changes.**

---

## Project Identity

**Savage Media** is a full-service visual production studio — photography, cinematic video, aerial/drone, 360° virtual tours, 3D visualization, and creative direction. Migration target of [savagemedia.online](https://www.savagemedia.online/).

Revenue streams:

- **Monthly subscription plans** — Lite (CA$99), Pro (CA$249), Business (CA$499) — recurring photo + video content (Stripe subscription mode)
- **À la carte services** — one-off shoots, edits, and deliverables across 4 service categories (Stripe one-off payment mode via cart)
- **Client booking** — custom projects scoped via a consultation flow

Subscribed users get a set of à la carte services **included** in their tier; services outside that set still require à la carte payment through the cart flow.

It is an Nx monorepo with an Angular frontend, NestJS backend, and MongoDB database.

### Service Categories (see `ServiceCategory` enum in `@sm/shared`)

1. **Core Visual** — Real estate, product/brand, portraits, drone & aerial, 360° virtual tours, cinematic campaigns
2. **Advanced Visual Tools** — Vertical reels, cinematic promos, hero banners, logo animations, mockups, 3D viz, colour grading, sky replacement
3. **Marketing & Branding** — Influencer kits, corporate identity, event packages, architect/designer viz, flyers, monthly social kits
4. **Add-On & Premium** — Commercial/event coverage, content subscriptions, creative direction

### Pricing Tiers (see `PricingTier` enum in `@sm/shared`)

- `LITE` — CA$99/mo, 15 photos + 1 short video, 3-day delivery
- `PRO` — CA$249/mo, 25 photos + 1 video + 1 reel, 2-day delivery **(featured)**
- `BUSINESS` — CA$499/mo, 40 photos + 2 videos + 2 reels + brand story, 24h turnaround
- `CUSTOM` — scoped per brief

---

## Monorepo Architecture

```
savageMedia/
├── apps/
│   ├── web/          Angular 18 SPA (prefix: sm)
│   └── api/          NestJS 10 REST API
├── libs/
│   ├── shared/       TypeScript interfaces, DTOs, enums — used by BOTH apps
│   ├── data-access/  NgRx store (actions, reducers, selectors, effects)
│   ├── ui/           Reusable Angular components (nav, footer, overlays)
│   ├── feature-gallery/   (extend here)
│   ├── feature-booking/   (extend here)
│   └── feature-admin/     (extend here)
├── docker/
├── .github/workflows/
└── docker-compose.yml
```

### Path aliases (tsconfig.base.json)
```
@sm/shared       → libs/shared/src/index.ts
@sm/ui           → libs/ui/src/index.ts
@sm/data-access  → libs/data-access/src/index.ts
@sm/feature-*    → libs/feature-*/src/index.ts
```

### Module boundary rules (.eslintrc.json)
- `type:app` → can depend on everything
- `type:feature` → can depend on `data-access`, `ui`, `util`
- `type:data-access` → can depend on `util` only
- `type:ui` → can depend on `util` only
- `scope:api` → can only use `scope:api` and `scope:shared` libs
- `scope:web` → can only use `scope:web` and `scope:shared` libs

**Never import backend code into the frontend or vice versa.**

---

## Frontend (Angular 18)

### Key Conventions
- Component selector prefix: `sm-`
- All components belong to an NgModule (not standalone) for consistency
- Lazy-load every route (loadChildren)
- Never use BehaviorSubjects for global state — use NgRx exclusively
- Dispatch actions from components, never call services directly for data

### NgRx Store Shape
```typescript
{
  router: RouterReducerState,
  auth: AuthState,
  gallery: GalleryState,    // EntityAdapter<Photo>
  booking: BookingState,    // EntityAdapter<Booking>
  cart: CartState,          // CartLineItem[] + subtotal + active tier + drawer state
  ui: UiState,              // loading, modal, toast, theme
}
```

### Cart & Subscription Flow
- Cart supports services only. Subscriptions skip the cart and go directly to Stripe subscription checkout.
- Guests get an opaque `guest_sid` HttpOnly cookie (issued by `apps/api/src/common/middleware/guest-session.middleware.ts`). Authenticated users are keyed by `userId`. The server resolves identity on every cart request via `JwtOptionalAuthGuard`.
- On login/register/session restore, the frontend dispatches `CartActions.mergeGuestCart` which calls `POST /cart/merge` to move the guest cart onto the user's account.
- Guest cart also persists to `localStorage` (`sm_guest_cart_v1`) as a resilience layer; `localStorage` is cleared on successful auth.
- CSRF is double-submit cookie style (`csrf_token` cookie + `X-CSRF-Token` header). `apps/web/src/app/core/interceptors/credentials.interceptor.ts` injects `withCredentials: true` and the header on every API call. The `/checkout/webhook` route is CSRF-exempt.
- Prices are **always re-validated server-side** from `libs/shared/src/lib/catalog/service-catalog.ts`. Client prices are display-only. Stripe idempotency keys are derived from a sha256 of the cart payload.
- Webhooks are idempotent via `stripeEventId` unique sparse index on the `orders` collection.

### Effects use the API_SERVICE_TOKEN injection token
Effects import `API_SERVICE_TOKEN` from `@sm/data-access` and inject it as `IApiService`.
The concrete `ApiService` is provided in `CoreModule` and bound to the token via `{ provide: API_SERVICE_TOKEN, useExisting: ApiService }`.

### Three.js 3D Scene
- Entry: `apps/web/src/app/three/three-scene.service.ts`
- Component: `apps/web/src/app/three/gallery-scene.component.ts`
- Run the RAF loop **outside Angular zone** (`ngZone.runOutsideAngular`)
- Dispose all Three.js objects on destroy (geometries, materials, textures, renderer)
- Do NOT add Three.js dependencies to the NgRx store

### Styling Rules
- Use Tailwind utility classes in templates
- Custom tokens defined in `apps/web/tailwind.config.js`
- SCSS files only for `:host` block or complex selectors that Tailwind can't handle
- Dark theme only — `bg-obsidian-950` background, `text-gold-400` accent
- Font stack: `font-display` (Cormorant Garamond) for headings, `font-body` (Inter) for body
- All buttons use `.btn-primary` or `.btn-ghost` Tailwind component classes from `styles.scss`

---

## Backend (NestJS 10)

### Module Structure
```
src/
├── app.module.ts         Root — wires MongoDB, throttler, all feature modules
├── main.ts               Bootstrap — helmet, CORS, swagger, global pipes
├── common/
│   ├── filters/          AllExceptionsFilter
│   └── interceptors/     LoggingInterceptor
└── modules/
    ├── auth/             JWT + LocalStrategy, guards, decorators
    ├── users/            User CRUD, password hashing
    ├── gallery/          Photos CRUD with pagination (categorised by PhotoCategory)
    ├── booking/          Client project/session requests (keyed by SessionType)
    ├── upload/           Multer + Sharp image processing
    ├── cart/             Cart snapshot per user/guest (TTL-indexed, tier-aware)
    ├── checkout/         Stripe Checkout (services + subscriptions) + webhook + orders
    └── analytics/        Admin dashboard aggregations
```

### Conventions
- All controllers are versioned (`version: '1'`) → `/api/v1/`
- DTOs live in `libs/shared` — import from `@sm/shared`
- Schemas use `@Schema({ timestamps: true })` always
- Use `@Prop({ select: false })` for sensitive fields (passwords, tokens)
- Rate-limit sensitive endpoints with `@Throttle({ default: { limit: N, ttl: ms } })`
- Every admin endpoint is guarded with `[JwtAuthGuard, RolesGuard]` + `@Roles('admin')`
- Never use `any` in TypeScript — use proper types or `unknown`

### Adding a New API Module
1. Create `apps/api/src/modules/<name>/`
2. Add Schema → Service → Controller → Module files
3. Import the Module in `app.module.ts`
4. Add DTOs/interfaces to `libs/shared/src/lib/`
5. Export them from `libs/shared/src/index.ts`

---

## Database (MongoDB via Mongoose)

### Key Schemas
| Collection | Schema file |
|---|---|
| `users` | `modules/users/schemas/user.schema.ts` |
| `photos` | `modules/gallery/schemas/photo.schema.ts` |
| `bookings` | `modules/booking/schemas/booking.schema.ts` |
| `carts` | `modules/cart/schemas/cart.schema.ts` |
| `orders` | `modules/checkout/schemas/order.schema.ts` |

### Indexes
- Photos: full-text on `title + description + tags`, compound `category + published + sortOrder`
- Orders: `orderNumber` unique, `customerEmail`, `status + createdAt`, `stripeEventId` unique sparse (webhook idempotency)
- Bookings: `clientEmail`, `status + preferredDate`
- Carts: partial unique on `userId`, partial unique on `guestSid`, TTL on `expiresAt` (30 days)
- Users: `email` unique, `stripeCustomerId` unique sparse (for Stripe → user lookup during webhooks)

---

## Shared Library (`@sm/shared`)

Contains TypeScript that is compiled and consumed by **both** apps.

```
libs/shared/src/lib/
├── enums/index.ts          PhotoCategory, SessionType, ServiceCategory, PricingTier,
│                           BookingStatus, OrderStatus, SubscriptionStatus,
│                           CartItemType, UserRole
├── catalog/                Single source of truth for pricing + services
│   ├── service-catalog.ts  SERVICES, SERVICES_BY_ID, TIER_INCLUDED_SERVICES
│   └── plan-catalog.ts     PLANS, PLAN_FEATURES (Claude-style feature matrix)
├── interfaces/             TypeScript interfaces (not Mongoose schemas)
│   ├── photo.interface.ts
│   ├── user.interface.ts
│   ├── booking.interface.ts
│   └── cart.interface.ts   CartLineItem (discriminated union), Order, UserSubscription
└── dtos/                   class-validator DTOs (used by NestJS & Angular forms)
    ├── auth.dto.ts
    ├── gallery.dto.ts
    ├── booking.dto.ts
    └── cart.dto.ts         AddCartItemDto, CheckoutServicesDto, CheckoutSubscriptionDto
```

### Catalog (single source of truth)
- `SERVICES` in `service-catalog.ts` defines every à la carte service — **prices in cents**, `requiresScheduling` flag, category, and `maxQuantity` cap. Edit this file to change pricing; no migration needed.
- `TIER_INCLUDED_SERVICES` maps each `PricingTier` → the `ServiceId[]` that are covered by that plan. The server uses this to mark cart lines as `includedByTier` (zero-charge) at snapshot time.
- `PLANS` in `plan-catalog.ts` defines subscription tiers; `PLAN_FEATURES` drives the comparison table on the pricing page.
- Stripe price IDs for subscriptions come from env vars (`STRIPE_PRICE_LITE/PRO/BUSINESS`), not the catalog file.

### Enum source of truth

| Enum | Values |
| --- | --- |
| `SessionType` | `REAL_ESTATE`, `PRODUCT_BRAND`, `PORTRAIT`, `DRONE_AERIAL`, `VIRTUAL_TOUR`, `CINEMATIC_VIDEO`, `VERTICAL_REEL`, `EVENT_COVERAGE`, `CORPORATE_CAMPAIGN`, `OTHER` |
| `PhotoCategory` | `REAL_ESTATE`, `PRODUCT_BRAND`, `PORTRAIT`, `AERIAL`, `CINEMATIC`, `EVENTS`, `COMMERCIAL` |
| `ServiceCategory` | `CORE_VISUAL`, `ADVANCED_TOOLS`, `MARKETING_BRANDING`, `ADD_ON_PREMIUM` |
| `PricingTier` | `LITE`, `PRO`, `BUSINESS`, `CUSTOM` |

**Rules:**
- Enums are the single source of truth — use them in schemas, components, and NgRx state
- DTOs use class-validator decorators so NestJS can validate them with `ValidationPipe`
- Interfaces are plain TypeScript (no decorators) for use in Angular

---

## Environment Variables

Copy `.env.example` → `.env`. All variables are documented there.

Key variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — use long random strings in production
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — from Stripe dashboard
- `STORAGE_PROVIDER` — `local` (default) or `s3`

---

## DevOps

### Run locally (development)
```bash
# 1. Start MongoDB
docker-compose up mongo -d

# 2. Install dependencies
npm install

# 3. Copy and fill in environment
cp .env.example .env

# 4. Start API
npm run start:api

# 5. Start Angular (separate terminal)
npm run start:web
```

### Run with Docker Compose (production-like)
```bash
cp .env.example .env
# Edit .env with real secrets
docker-compose up --build
```

### Nx commands
```bash
nx serve web                # Serve Angular
nx serve api                # Serve NestJS
nx build web                # Build Angular
nx build api                # Build NestJS
nx test web                 # Run Angular tests
nx test api                 # Run NestJS tests
nx lint web                 # Lint Angular
nx graph                    # Visualize dependency graph
nx affected:test            # Test only affected projects
nx affected:build           # Build only affected projects
```

---

## Design System

- **Background:** `obsidian-950` (#111114)
- **Accent:** `gold-400` (#d4a843)
- **Font — Display:** Cormorant Garamond (headings, hero text, quotes)
- **Font — Body:** Inter (UI text, labels, navigation)
- **Heading style:** Light weight, wide tracking, mixed with italic gold accent
- **Labels:** `.section-label` — `text-xs tracking-[0.25em] uppercase`
- **Motion:** Smooth, cinematic — prefer `0.4–0.7s` transitions with easing

### Do not

- Add bright colors or busy backgrounds
- Use heavy font weights for headlines
- Add rounded corners to major UI elements (sharp = editorial)
- Use gradients except for overlays on images

---

## Making Changes — Checklist

### Adding a new page route

1. Create `apps/web/src/app/pages/<name>/<name>.module.ts` + components
2. Add the lazy route to `apps/web/src/app/app-routing.module.ts`
3. Add the link to `libs/ui/src/lib/components/nav/nav.component.html` (both desktop & mobile)

### Adding a new service offering or pricing plan

The catalog is the source of truth. In most cases, edit one file:

1. **For a new à la carte service**: add a `ServiceDefinition` entry to `SERVICES` in `libs/shared/src/lib/catalog/service-catalog.ts`. Add its `ServiceId` to `TIER_INCLUDED_SERVICES` for any tier that should cover it for free. Add a row to `PLAN_FEATURES` in `plan-catalog.ts` so it appears in the pricing comparison table. The services page (`apps/web/src/app/pages/services/services.component.ts`) reads from `SERVICES` automatically — only update `serviceImages` if you want a custom image.
2. **For a new subscription tier**: add the value to `PricingTier` in `libs/shared/src/lib/enums/index.ts`, add a `PlanDefinition` to `PLANS`, extend the `values` record on every `PLAN_FEATURES` row, and add a Stripe price env var (`STRIPE_PRICE_<TIER>`).
3. **For a new `SessionType` or `ServiceCategory`**: add to the enum. Schemas pick it up automatically via `Object.values(...)`.
4. If the new service requires a booking flow, make sure `requiresScheduling: true` is set — the services page will then route through `/booking` instead of `/cart`.

### Adding a new NgRx feature slice
1. Create `libs/data-access/src/lib/<name>/` with actions, reducer, selectors, effects
2. Export from `libs/data-access/src/index.ts`
3. Register reducer in `AppModule`'s `StoreModule.forRoot()`
4. Register effect in `EffectsModule.forRoot()`

### Adding a new API endpoint
1. Add DTO to `libs/shared`
2. Add method to the relevant Service
3. Add route to the Controller
4. No new module needed unless it's a new domain

### Extending the 3D scene
- Modify only `apps/web/src/app/three/three-scene.service.ts`
- Keep the RAF loop out of Angular zone
- Dispose everything in `dispose()`

---

## Testing

- API tests: `apps/api/**/*.spec.ts` — use `@nestjs/testing` `TestingModule`
- Web tests: `apps/web/**/*.spec.ts` — use `TestBed` with `provideMockStore`
- Shared tests: `libs/**/*.spec.ts`

Mock external services (Stripe, Mongoose) in unit tests.
Integration tests against a real MongoDB are run in CI only.

---

## Security Reminders

- JWT secrets must be 32+ random characters in production
- Never commit `.env` (it's in `.gitignore`)
- Stripe webhook endpoint validates signature — do not disable
- All file uploads are processed by Sharp before storage (strips EXIF by default)
- Rate limiting is configured via `ThrottlerModule` — tighten for production
- **Cart prices are re-validated server-side** from the catalog on every `/cart` and `/checkout` call. Client-supplied prices are ignored.
- Guest sessions use an HttpOnly `guest_sid` cookie; never echo it back in responses.
- CSRF is enforced via double-submit cookie — webhook endpoints are exempt and protected by signature validation instead.
- Stripe `Idempotency-Key` is a sha256 hash of the cart payload — prevents double-charges on retry.
- Webhook fulfillment is idempotent via `stripeEventId` unique sparse index on `orders`.
