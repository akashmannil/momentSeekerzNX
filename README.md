# Savage Media

> Full-service visual production studio — photo, video, aerial, and 3D. Migration of [savagemedia.online](https://www.savagemedia.online/), built as a full-stack Nx monorepo.

---

## Overview

A high-end, immersive web experience for a multi-discipline visual production studio featuring:

- **Services catalogue** across 4 categories — Core Visual, Advanced Visual Tools, Marketing & Branding, Add-On & Premium
- **Subscription pricing** — Lite (CA$99), Pro (CA$249), Business (CA$499) monthly content plans + à la carte one-offs
- **Interactive 3D gallery scene** powered by Three.js — mouse- and scroll-driven camera fly-through
- **Photo & video portfolio** with category filtering (real estate, product/brand, cinematic, aerial, events, commercial)
- **Fine-art print store** with Stripe checkout
- **Project booking** for real estate shoots, drone coverage, cinematic promos, virtual tours, and campaign production
- **Secure admin panel** for content, bookings, and orders
- **JWT authentication** with access/refresh token rotation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Nx 19 |
| Frontend | Angular 18, NgRx 18, Three.js 0.163, Tailwind CSS 3 |
| Backend | NestJS 10, Passport JWT, Mongoose |
| Database | MongoDB 7 |
| Payments | Stripe Checkout |
| Image Processing | Sharp (server-side WebP/JPEG generation) |
| Deployment | Docker + docker-compose, Nginx |
| CI/CD | GitHub Actions |

---

## Project Structure

```
savageMedia/
├── apps/
│   ├── web/               Angular SPA
│   │   ├── src/app/
│   │   │   ├── three/     Three.js scene service & component
│   │   │   ├── pages/     home, services, pricing, gallery, store, booking, about, contact, admin
│   │   │   └── core/      services, interceptors, guards
│   │   └── tailwind.config.js
│   └── api/               NestJS REST API
│       └── src/modules/   auth, users, gallery, booking, upload, store, analytics
├── libs/
│   ├── shared/            Interfaces, DTOs, enums (used by both apps)
│   ├── data-access/       NgRx: actions, reducers, selectors, effects
│   └── ui/                Shared Angular components (nav, footer, toast, overlay)
├── docker/                MongoDB init script
├── .github/workflows/     GitHub Actions CI
├── docker-compose.yml
├── CLAUDE.md              AI development guide
└── README.md
```

---

## Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose (for MongoDB and full-stack run)

---

## Quick Start (Local Development)

### 1. Clone & install

```bash
git clone https://github.com/your-org/savage-media.git
cd savage-media
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values. Minimum required for local dev:

```env
MONGODB_URI=mongodb://localhost:27017/savage-media
JWT_SECRET=dev-secret-change-me-in-prod
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Start MongoDB

```bash
docker-compose up mongo -d
```

### 4. Start the API

```bash
npm run start:api
# API runs at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### 5. Start the Angular app

```bash
npm run start:web
# App runs at http://localhost:4200
```

---

## Full Stack with Docker Compose

```bash
cp .env.example .env
# Fill in all production values

docker-compose up --build
# Web → http://localhost:80
# API → http://localhost:3000
```

---

## Default Admin Account

When MongoDB initializes with the init script, an admin user is created:

```
Email:    admin@savagemedia.online
Password: Admin@1234
```

**Change this immediately in production.**

Access the admin panel at `/login`, then navigate to `/admin`.

---

## API Reference

Base URL: `http://localhost:3000/api/v1`
Full Swagger docs: `http://localhost:3000/api/docs` (dev only)

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in, receive JWT tokens |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/auth/me` | Get current user |

### Gallery (public read, admin write)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/gallery` | List photos (paginated, filterable) |
| GET | `/gallery/featured` | Featured photos for 3D scene |
| GET | `/gallery/categories` | Category list with counts |
| GET | `/gallery/:id` | Single photo |
| POST | `/gallery` | Create photo (admin) |
| PATCH | `/gallery/:id` | Update photo (admin) |
| PATCH | `/gallery/reorder` | Bulk sort order update (admin) |
| DELETE | `/gallery/:id` | Delete photo (admin) |

### Booking
| Method | Endpoint | Description |
|---|---|---|
| POST | `/booking` | Submit booking request (public) |
| GET | `/booking` | List bookings (admin) |
| PATCH | `/booking/:id` | Update status/notes (admin) |
| DELETE | `/booking/:id` | Delete booking (admin) |

### Store
| Method | Endpoint | Description |
|---|---|---|
| GET | `/store/products` | List published products |
| GET | `/store/products/:id` | Product detail |
| POST | `/store/checkout` | Create Stripe checkout session |
| POST | `/store/webhook` | Stripe webhook (raw body) |
| GET | `/store/orders` | List orders (admin) |
| PATCH | `/store/orders/:id/status` | Update order status (admin) |

### Upload (admin)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload/photo` | Upload & process image (multipart) |
| DELETE | `/upload/photo/:filename` | Delete photo + derivatives |

### Analytics (admin)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/analytics/dashboard` | KPIs, top photos, booking stats |
| GET | `/analytics/revenue` | Monthly revenue breakdown |

---

## Key Architecture Decisions

### Why NgRx Entity for gallery?
Photos are loaded once and referenced from multiple views (gallery grid, photo detail, 3D scene).
Entity adapter gives O(1) lookup by `_id`, prevents duplicate fetches, and makes optimistic updates easy.

### Why the API_SERVICE_TOKEN injection token?
Effects in `libs/data-access` need HTTP access but cannot import `HttpClient` directly (that would couple the lib to Angular's http module and break the `scope:web` boundary). The token decouples effects from the concrete implementation — the `ApiService` is provided in `CoreModule`.

### Why Sharp for image processing?
Uploading raw camera files can be 50MB+. Sharp converts them server-side to:
- Max 2400px JPEG (storage-efficient original)
- 400px JPEG thumbnail (grid views)
- 1600px WebP (modern browsers)
This means the Angular app always loads optimized images regardless of what was uploaded.

### Why Stripe Checkout (not Elements)?
Checkout handles PCI compliance, address collection, and international payment methods out of the box.
The order is created via webhook (`checkout.session.completed`) so it's reliable even if the customer closes the tab.

### Three.js outside Angular zone
The animation loop runs inside `ngZone.runOutsideAngular()` — this prevents Angular from triggering change detection on every `requestAnimationFrame` call (60 times/second), which would tank performance.

---

## Nx Commands

```bash
# Serve
nx serve web                # Angular dev server (port 4200)
nx serve api                # NestJS dev server (port 3000)

# Build
nx build web --configuration=production
nx build api --configuration=production

# Test
nx test web
nx test api
nx run-many --target=test --all

# Lint
nx lint web
nx lint api

# Graph — visualise lib dependencies
nx graph

# Affected (CI optimisation)
nx affected:test
nx affected:build
nx affected:lint
```

---

## Environment Variables Reference

See [.env.example](.env.example) for the full list with descriptions.

---

## Deployment Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` (32+ chars)
- [ ] Set live Stripe keys (`sk_live_...`, `pk_live_...`)
- [ ] Configure `MONGODB_URI` pointing to Atlas or managed cluster
- [ ] Set `ALLOWED_ORIGINS` to your production domain
- [ ] Change default admin password via the API
- [ ] Configure `STORAGE_PROVIDER=s3` + AWS credentials for cloud uploads
- [ ] Set up MongoDB Atlas backups
- [ ] Point `STRIPE_WEBHOOK_SECRET` to the production webhook endpoint

---

## Contributing

See [CLAUDE.md](CLAUDE.md) for architecture guidelines and conventions.

---

## License

MIT
