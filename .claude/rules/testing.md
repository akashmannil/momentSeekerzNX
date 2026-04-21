# Testing Rules

## General
- Every new feature must have corresponding tests.
- Mock external services (Stripe, Mongoose) in unit tests — never call real APIs.
- Integration tests against real MongoDB run in CI only.

## Angular Tests (apps/web)
- Use `TestBed` with `provideMockStore` for component tests.
- Test files: `*.spec.ts` co-located with the component/service.
- Provide mock NgRx store with initial state matching `AppState` shape.
- Test that components dispatch correct actions on user interaction.
- Test selectors as pure functions with known state inputs.

## NestJS Tests (apps/api)
- Use `@nestjs/testing` `TestingModule` for service and controller tests.
- Test files: `*.spec.ts` co-located with the module.
- Mock Mongoose models with `getModelToken()`.
- Test guards (JwtAuthGuard, RolesGuard) independently.
- Test DTOs by validating against class-validator constraints.

## Shared Library Tests (libs/)
- Test enums for expected values.
- Test DTOs with class-validator `validate()`.

## Running Tests
```bash
nx test web          # Angular unit tests
nx test api          # NestJS unit tests
nx affected:test     # Only test what changed
```
