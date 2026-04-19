# Code Style Rules

## TypeScript (Both Apps)
- Never use `any` — use proper types or `unknown`.
- Shared types live in `@sm/shared` — never duplicate interfaces between apps.
- Enums from `@sm/shared` are the single source of truth: `SessionType`, `PhotoCategory`, `ServiceCategory`, `PricingTier`, `BookingStatus`, `OrderStatus`, `PrintSize`, `PrintFinish`, `UserRole`.
- Add new enum values in `libs/shared/src/lib/enums/index.ts`. Schemas (`Object.values(...)`) and DTOs (`@IsEnum`) pick them up automatically.
- Use path aliases (`@sm/shared`, `@sm/ui`, `@sm/data-access`) — never relative imports across lib boundaries.

## Angular (apps/web)
- Component selector prefix: `sm-`
- All components use NgModules (not standalone) for consistency.
- Lazy-load every route via `loadChildren`.
- Global state through NgRx only — no BehaviorSubjects for shared state.
- Components dispatch actions; never call services directly for data fetching.
- Three.js RAF loop runs outside Angular zone (`ngZone.runOutsideAngular`).
- Dispose all Three.js objects (geometries, materials, textures, renderer) on destroy.

## NestJS (apps/api)
- Controllers are versioned: `@Controller({ version: '1' })` → `/api/v1/`.
- Schemas always use `@Schema({ timestamps: true })`.
- Sensitive fields use `@Prop({ select: false })`.
- Admin endpoints guarded with `[JwtAuthGuard, RolesGuard]` + `@Roles('admin')`.

## Styling
- Tailwind utility classes in templates — SCSS only for `:host` or complex selectors.
- Dark theme only: `bg-obsidian-950` background, `text-gold-400` accent.
- Fonts: `font-display` (Cormorant Garamond) for headings, `font-body` (Inter) for body.
- No bright colors, no rounded corners on major UI elements, no gradients except image overlays.
- Buttons: `.btn-primary` or `.btn-ghost` component classes from `styles.scss`.
