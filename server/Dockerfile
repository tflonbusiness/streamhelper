# syntax=docker/dockerfile:1.4

FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

# Lighter than `nest build` on small VPS (no .d.ts / source maps; less RAM).
ENV CI=1
ENV NODE_OPTIONS=--max-old-space-size=1024

COPY package.json package-lock.json ./
# bcrypt may compile on Alpine; npm cache mount speeds up repeat builds on the VPS.
RUN --mount=type=cache,target=/root/.npm \
  apk add --no-cache python3 make g++ \
  && npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npx tsc -p tsconfig.build.json --declaration false --sourceMap false --incremental false
RUN npm prune --omit=dev

FROM public.ecr.aws/docker/library/node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/main.js"]
