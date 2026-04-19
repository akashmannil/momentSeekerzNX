# Deploy Skill

Automatically invoked when the user asks to deploy, build for production, or prepare a release.

## Trigger

TRIGGER when: user mentions "deploy", "release", "production build", "ship it", or "go live".

## Pre-Deploy Pipeline

### 1. Lint
```bash
nx lint web
nx lint api
```
Fail fast if either has errors.

### 2. Test
```bash
nx test web
nx test api
```
All tests must pass. Do not proceed with failures.

### 3. Production Build
```bash
nx build web --configuration=production
nx build api --configuration=production
```
Verify both complete without errors.

### 4. Environment Validation
- Check `.env` exists and contains all keys from `.env.example`.
- Verify `MONGODB_URI` is set and not pointing to localhost (for production).
- Verify `JWT_SECRET` is 32+ characters.
- Verify Stripe keys are set if store module is enabled.

### 5. Docker (if applicable)
```bash
docker-compose build
```
Verify images build cleanly.

## Output
Produce a go/no-go summary table. Never push or deploy automatically — report status and wait for user confirmation.
