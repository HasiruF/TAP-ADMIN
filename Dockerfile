# syntax=docker/dockerfile:1

# =============================================================================
# TAP Admin — production image (Next.js 15 standalone output)
#
# Multi-stage build:
#   deps    -> install node_modules from lockfile (cached unless deps change)
#   builder -> compile the Next.js app into .next/standalone
#   runner  -> minimal runtime: just the standalone server + static assets
#
# NOTE on env vars: NEXT_PUBLIC_* values are INLINED into the client bundle at
# BUILD time, so they are passed as --build-arg (see ARG/ENV in the builder
# stage). Server-only vars (BACKEND_API_URL, PORT, ...) are read at RUNTIME and
# must be supplied to the running container (ECS task definition / compose).
# =============================================================================

# ---- deps: install dependencies -------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat keeps some native npm deps happy on Alpine.
RUN apk add --no-cache libc6-compat

# Disable Husky's git-hook install: the `prepare` lifecycle script runs
# `husky install`, which has no place in an image (no .git, dev-only tooling)
# and would fail the build. Husky v9 honors HUSKY=0 as a clean no-op.
ENV HUSKY=0

# Copy only manifests first so this layer is cached until the lockfile changes.
COPY package.json package-lock.json* ./
RUN npm ci

# ---- builder: build the Next.js app ----------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public config (inlined into the browser bundle). Provide these via
# --build-arg / GitHub Actions build-args so the client points at the right API.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PLATFORM_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_PLATFORM_URL=${NEXT_PUBLIC_PLATFORM_URL}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ---- runner: minimal production image --------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Standalone server binds to this host/port; ECS/ALB target the same port.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Public assets and the self-contained server produced by `output: 'standalone'`.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Container-level health check (compose / EC2 launch type honor this; on ALB the
# target group health check hits the same path).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# server.js is emitted by Next.js standalone output.
CMD ["node", "server.js"]
