FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@12.23.0 --activate
WORKDIR /app

FROM base AS builder
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json prisma.config.ts ./
COPY packages ./packages
COPY prisma ./prisma
COPY apps/worker ./apps/worker
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @opspilot/shared run build
RUN pnpm --filter @opspilot/api-contracts run build
RUN pnpm exec prisma generate --schema=prisma/schema.prisma
RUN pnpm --filter @opspilot/worker run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]
