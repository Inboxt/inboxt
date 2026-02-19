# ---- Build stage ----
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY libs/common/package.json ./libs/common/

# Install dependencies for all workspaces
RUN npm ci

# Copy source code
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY libs ./libs
COPY tsconfig*.json ./

# Generate Prisma client
RUN cd apps/api && npm run prisma:generate

# Build
RUN npm run build --workspace=libs/common
RUN npm run build --workspace=apps/web
RUN npm run build --workspace=apps/api

# ---- Runtime stage ----
FROM node:24-alpine
RUN apk add --no-cache dumb-init wget

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=UTC

# Copy ALL node_modules from builder to ensure symlinks and workspace deps are correct
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common/package.json ./libs/common/package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/migrations ./migrations
COPY --from=builder /app/apps/api/entrypoint.sh ./entrypoint.sh

# Copy web assets
COPY --from=builder /app/apps/web/dist ./public

# Copy shared libs (runtime)
COPY --from=builder /app/libs/common/dist ./libs/common/dist

EXPOSE 7000

ENTRYPOINT ["dumb-init", "--", "./entrypoint.sh"]