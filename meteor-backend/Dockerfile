FROM node:24-alpine AS base

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

FROM base AS development
RUN npm ci
COPY . .
RUN npm run prisma:generate
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

FROM base AS build
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/.env ./
RUN npm run prisma:generate
EXPOSE 4000
CMD ["node", "dist/main"]