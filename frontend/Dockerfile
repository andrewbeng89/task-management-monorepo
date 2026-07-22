# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite app to static assets ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# VITE_* vars are inlined at build time. Defaults to same-origin "/api", which
# nginx proxies to the backend (see nginx.conf).
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- Runtime stage: serve static files with nginx on port 80 ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
