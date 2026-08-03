FROM node:24-alpine AS base
WORKDIR /usr/src/app
COPY package.json package-lock.json ./

FROM base AS deps
RUN npm ci

FROM deps AS development
COPY . .
RUN npx prisma@6.19.3 generate
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

FROM deps AS build
COPY . .
RUN npx prisma@6.19.3 generate
RUN npm run build

FROM node:24-alpine AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main"]