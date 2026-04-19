# Security Review Skill

Automatically invoked when changes touch authentication, authorization, file uploads, payment processing, or environment configuration.

## Trigger

TRIGGER when: changes touch files matching `**/auth/**`, `**/upload/**`, `**/store/**` (payment flows), `.env*`, `**/guards/**`, or any file importing `JwtAuthGuard`, `RolesGuard`, `Stripe`, or `Sharp`.

## Checks

### Authentication & Authorization
- JWT secrets must be 32+ random characters in production config.
- `@UseGuards(JwtAuthGuard)` on all protected routes.
- Admin routes additionally use `RolesGuard` + `@Roles('admin')`.
- Passwords hashed before storage — never stored in plain text.
- `refreshTokenHash` and `passwordHash` use `@Prop({ select: false })`.
- `toJSON` transform strips sensitive fields.

### File Uploads
- All uploads processed by Sharp before storage (strips EXIF by default).
- File type validation on upload (only allow image MIME types).
- File size limits enforced via Multer config.
- Uploaded filenames sanitized — no path traversal.

### Payment (Stripe)
- Stripe webhook endpoint validates signature — never disable.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` not hardcoded.
- Order amounts calculated server-side — never trust client-provided prices.

### Environment & Secrets
- `.env` is in `.gitignore` — verify it's never committed.
- No secrets in source code, templates, or committed config files.
- API keys and tokens loaded via `ConfigService`, not `process.env` directly.

### Rate Limiting
- Login, register, and booking endpoints use `@Throttle()`.
- Global throttler configured in `app.module.ts`.

## Output
Report findings as: PASS, WARN, or FAIL with file paths and line numbers.
