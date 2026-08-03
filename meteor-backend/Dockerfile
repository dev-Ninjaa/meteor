# Multi-stage Dockerfile using Bun
FROM oven/bun:1.1-alpine AS base

WORKDIR /usr/src/app

# Install dependencies only when needed
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Development stage with hot reload
FROM base AS development
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run prisma:generate
EXPOSE 4000
CMD ["bun", "run", "start:dev"]

# Build stage
FROM base AS build
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run prisma:generate
RUN bun run build

# Production stage - minimal image
FROM oven/bun:1.1-alpine AS production
WORKDIR /usr/src/app

# Copy only production artifacts
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma

# Generate Prisma client in production
RUN bun run prisma:generate

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

USER nestjs

EXPOSE 4000
ENV NODE_ENV=production
CMD ["bun", "run", "dist/main.js"]