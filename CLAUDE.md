# CLAUDE.md — Savage Media

This file is the authoritative guide for AI-assisted development on this project.
**Read this before making any changes.**

---

## Project Identity

**Savage Media** is a full-service visual production studio — photography, cinematic video, aerial/drone, 360° virtual tours, 3D visualization, and creative direction. Migration target of [savagemedia.online](https://www.savagemedia.online/).

Revenue streams:

- **Monthly subscription plans** — Lite (CA$99), Pro (CA$249), Business (CA$499) — recurring photo + video content
- **À la carte services** — one-off shoots, edits, and deliverables across 4 service categories
- **Fine-art print store** — curated editorial prints
- **Client booking** — custom projects scoped via a consultation flow

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
│   ├── feature-admin/     (extend here)
│   └── feature-store/     (extend here)
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
  store: StoreState,        // EntityAdapter<Product> + cart
  ui: UiState,              // loading, modal, toast, theme
}
```

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
    ├── store/            Products, Stripe checkout, orders (subscription plans + prints)
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
| `products` | `modules/store/schemas/product.schema.ts` |
| `orders` | `modules/store/schemas/order.schema.ts` |

### Indexes
- Photos: full-text on `title + description + tags`, compound `category + published + sortOrder`
- Orders: `orderNumber` unique, `customerEmail`, `status + createdAt`
- Bookings: `clientEmail`, `status + preferredDate`

---

## Shared Library (`@sm/shared`)

Contains TypeScript that is compiled and consumed by **both** apps.

```
libs/shared/src/lib/
├── enums/index.ts          PhotoCategory, SessionType, ServiceCategory, PricingTier,
│                           BookingStatus, PrintSize, PrintFinish, OrderStatus, UserRole
├── interfaces/             TypeScript interfaces (not Mongoose schemas)
│   ├── photo.interface.ts
│   ├── user.interface.ts
│   ├── booking.interface.ts
│   ├── store.interface.ts
│   └── pricing.interface.ts     PricingPlan, ServiceOffering
└── dtos/                   class-validator DTOs (used by NestJS & Angular forms)
    ├── auth.dto.ts
    ├── gallery.dto.ts
    ├── booking.dto.ts
    └── store.dto.ts
```

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

1. Add any new enum value to `SessionType`, `ServiceCategory`, or `PricingTier` in `libs/shared/src/lib/enums/index.ts`
2. Add it to the `packages` array in `apps/web/src/app/pages/booking/booking.component.ts` (keep `sessionLabels` in sync)
3. Add it to the `categories[*].services` array in `apps/web/src/app/pages/services/services.component.ts`
4. Add it to the `alaCarte` or `plans` array in `apps/web/src/app/pages/pricing/pricing.component.ts`
5. Enum values propagate to the backend automatically (schemas use `Object.values(...)`), so no migration is needed for new values

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
