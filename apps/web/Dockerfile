# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci --frozen-lockfile

COPY apps/web ./apps/web
COPY libs ./libs

# Build Angular app for production
RUN npx nx build web --configuration=production

# ─── Stage 2: Nginx Production ───────────────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copy custom nginx config with API reverse-proxy
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app
COPY --from=builder /app/dist/apps/web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
