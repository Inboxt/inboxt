# ---- Build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY libs/common/package.json ./libs/common/

# Install dependencies (api + common + web)
RUN npm ci \
  --workspace=apps/api \
  --workspace=libs/common \
  --workspace=apps/web \
  --include-workspace-root

# Copy source code
COPY apps ./apps
COPY libs ./libs
COPY tsconfig*.json ./

# Generate Prisma client
RUN cd apps/api && npm run prisma:generate

# Build
RUN npm run build --workspace=libs/common
RUN npm run build --workspace=apps/web
RUN npm run build --workspace=apps/api

# Database migrations
RUN cd apps/api && npx tsc -p tsconfig.migrations.json


# ---- Runtime stage ----
FROM node:24-alpine

RUN apk add --no-cache dumb-init wget netcat-openbsd

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV TZ=UTC

# Copy dependencies from builder
COPY --from=builder /app/package.json ../../package.json
COPY --from=builder /app/node_modules ../../node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/dist-migrations ./migrations
COPY --from=builder /app/apps/api/entrypoint.sh ./entrypoint.sh

# Copy API's own public folder
COPY --from=builder /app/apps/api/public ./public

# 🔥 Merge built web into same public directory
COPY --from=builder /app/apps/web/dist/ ./public/

# Copy shared libs (runtime)
COPY --from=builder /app/libs/common/dist ../../libs/common/dist
COPY --from=builder /app/libs/common/package.json ../../libs/common/package.json

EXPOSE 7000

ENTRYPOINT ["dumb-init", "--", "./entrypoint.sh"]