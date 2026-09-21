FROM node:22-alpine AS app-builder

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN npm ci

COPY app/ ./
# Vite build only — tsc is enforced locally via `npm run build`
RUN npx vite build

FROM nginx:alpine

COPY deploy/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/proxy-api.conf /etc/nginx/snippets/proxy-api.conf
COPY --from=app-builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
