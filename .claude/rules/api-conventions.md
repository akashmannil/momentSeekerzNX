# API Conventions

## Route Structure
- All routes prefixed: `/api/v1/<resource>`
- Controllers use `@Controller({ version: '1' })`.
- RESTful naming: plural nouns for collections (`/photos`, `/bookings`, `/orders`).

## Request Validation
- DTOs live in `libs/shared/src/lib/dtos/` — shared with the frontend.
- DTOs use `class-validator` decorators for validation.
- `ValidationPipe` is enabled globally in `main.ts` — no per-route setup needed.

## Response Shape
- Success: return the resource or array directly (NestJS serializes automatically).
- Pagination: return `{ data: T[], total: number, page: number, limit: number }`.
- Errors: handled by `AllExceptionsFilter` in `common/filters/`.

## Authentication & Authorization
- Public endpoints: no decorator needed.
- Authenticated endpoints: `@UseGuards(JwtAuthGuard)`.
- Admin-only endpoints: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`.
- Never expose user passwords or token hashes in responses.

## Rate Limiting
- Sensitive endpoints (login, register, booking create) use `@Throttle()`.
- Global throttler config in `app.module.ts` via `ThrottlerModule`.

## Adding a New Endpoint
1. Add/update DTO in `libs/shared/src/lib/dtos/`.
2. Export from `libs/shared/src/index.ts`.
3. Add method to the relevant Service.
4. Add route to the Controller.
5. Only create a new Module if it's an entirely new domain.

## Adding a New Module
1. Create `apps/api/src/modules/<name>/`.
2. Add Schema, Service, Controller, Module files.
3. Import the Module in `app.module.ts`.
4. Add interfaces to `libs/shared/src/lib/interfaces/`.
5. Export from `libs/shared/src/index.ts`.
