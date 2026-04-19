# /project:deploy — Build & Deploy Checklist

Run through the pre-deployment checklist for the Savage Media monorepo.

## Steps

1. **Lint both apps**
   - `nx lint web`
   - `nx lint api`
   - Fix any lint errors before proceeding.

2. **Run tests**
   - `nx test web`
   - `nx test api`
   - All tests must pass.

3. **Production build**
   - `nx build web --configuration=production`
   - `nx build api --configuration=production`
   - Confirm both build successfully with no errors.

4. **Environment check**
   - Verify `.env` has all required variables from `.env.example`.
   - Confirm `JWT_SECRET` and `JWT_REFRESH_SECRET` are 32+ characters.
   - Confirm `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are set (if store is enabled).

5. **Docker build** (if deploying via Docker)
   - `docker-compose build`
   - Confirm images build without errors.

6. **Report** — Summarize pass/fail status for each step. Do NOT push or deploy automatically.
