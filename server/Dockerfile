FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

# Lighter than `nest build` on small VPS (no .d.ts / source maps; less RAM).
ENV CI=1
ENV NODE_OPTIONS=--max-old-space-size=1024

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx tsc -p tsconfig.docker.json

FROM public.ecr.aws/docker/library/node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/main.js"]
