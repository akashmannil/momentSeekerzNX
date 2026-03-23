# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci --frozen-lockfile

# Copy source
COPY apps/api ./apps/api
COPY libs ./libs

# Build only the api app
RUN npx nx build api --configuration=production

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy only production deps
COPY package*.json ./
RUN npm ci --omit=dev --frozen-lockfile && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist/apps/api ./dist

# Create upload directory
RUN mkdir -p ./uploads && chown -R node:node ./uploads

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
