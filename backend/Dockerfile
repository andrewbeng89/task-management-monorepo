# syntax=docker/dockerfile:1

# ---- Build stage: install deps, generate Prisma client, compile TS ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# `prisma generate` loads prisma.config.ts, which resolves DATABASE_URL at load
# time. Generation never connects, so a placeholder is enough for the build.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm run prisma:generate && npm run build

# ---- Runtime stage: only what's needed to run the compiled server ----
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 6000
# Runs `prisma migrate deploy`, then starts the server.
ENTRYPOINT ["./docker-entrypoint.sh"]
