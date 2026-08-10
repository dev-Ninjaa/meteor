FROM oven/bun:1.3.5-alpine AS base
WORKDIR /usr/src/app
COPY meteor-backend/package.json ./package.json
COPY bun.lock ./

# Development: allow lockfile updates for velocity
FROM base AS development
COPY meteor-backend/ .
RUN bun install
RUN bunx prisma@6.19.3 generate
EXPOSE 4000
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start:dev"]

# Production build: enforce exact lockfile versions
FROM base AS build
COPY meteor-backend/ .
RUN bun install --frozen-lockfile
RUN bunx prisma@6.19.3 generate
RUN bun run build

FROM oven/bun:1.3.5-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 4000
CMD ["sh", "-c", "bunx prisma migrate deploy && bun run dist/main"]