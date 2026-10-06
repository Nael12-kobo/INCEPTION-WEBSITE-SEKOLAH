FROM node:22.20-bookworm-slim AS base
WORKDIR /app

# ---- System dependencies -----------------------------------------------------
# Prisma Engine (libquery) membutuhkan OpenSSL + ca-certificates pada image
# Debian slim. Tanpa ini: warning "failed to detect the libssl/openssl version"
# dan runtime Prisma bisa crash saat koneksi DB / generate.
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    libssl-dev \
    libc6 \
  && rm -rf /var/lib/apt/lists/*

# ---- Prisma schema + postinstall script -----------------------------------
# HARUS dicopy SEBELUM `npm ci`, karena `postinstall` membutuhkan:
#   1. prisma/schema.prisma  → `prisma generate` butuh ini
#   2. scripts/postinstall.js → postinstall di package.json menjalankan ini
# Tanpa keduanya, `npm ci` langsung gagal (error deployment kamu).
COPY prisma ./prisma/
COPY scripts ./scripts/
COPY package*.json ./
RUN npm ci

# =============================================================================
# Stage Builder — build Next.js .next output
# =============================================================================
FROM base AS builder
WORKDIR /app

# Args supaya build bisa inject env (Auth, Supabase, dsb) via build-arg Coolify.
# Di Next.js 16, build-time env perlu dideklarasikan sebagai ARG, lalu disalin ke
# ENV agar next build melihatnya. Hanya yang NEXT_PUBLIC_* di-bundle ke client.
ARG AUTH_SECRET
ARG AUTH_TRUST_HOST
ARG AUTH_GOOGLE_ID
ARG AUTH_GOOGLE_SECRET
ARG AUTH_GITHUB_ID
ARG AUTH_GITHUB_SECRET
ARG DATABASE_URL
ARG DIRECT_URL
ARG RESEND_API_KEY
ARG RESEND_FROM
ARG GEMINI_API_KEY
ARG GEMINI_MODEL
ARG GEMINI_FALLBACK_API_KEY
ARG GEMINI_FALLBACK_MODEL
ARG FISH_AUDIO_API_KEY
ARG FISH_AUDIO_MODEL
ARG FISH_AUDIO_REFERENCE_ID
ARG WHATSAPP_PHONE_ID
ARG WHATSAPP_TOKEN
ARG PPDB_WA_NUMBER
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_VRM_URL
ARG NEXT_PUBLIC_VRM_VERSION

ENV AUTH_SECRET=${AUTH_SECRET} \
    AUTH_TRUST_HOST=${AUTH_TRUST_HOST} \
    AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID} \
    AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET} \
    AUTH_GITHUB_ID=${AUTH_GITHUB_ID} \
    AUTH_GITHUB_SECRET=${AUTH_GITHUB_SECRET} \
    DATABASE_URL=${DATABASE_URL} \
    DIRECT_URL=${DIRECT_URL} \
    RESEND_API_KEY=${RESEND_API_KEY} \
    RESEND_FROM=${RESEND_FROM} \
    GEMINI_API_KEY=${GEMINI_API_KEY} \
    GEMINI_MODEL=${GEMINI_MODEL} \
    GEMINI_FALLBACK_API_KEY=${GEMINI_FALLBACK_API_KEY} \
    GEMINI_FALLBACK_MODEL=${GEMINI_FALLBACK_MODEL} \
    FISH_AUDIO_API_KEY=${FISH_AUDIO_API_KEY} \
    FISH_AUDIO_MODEL=${FISH_AUDIO_MODEL} \
    FISH_AUDIO_REFERENCE_ID=${FISH_AUDIO_REFERENCE_ID} \
    WHATSAPP_PHONE_ID=${WHATSAPP_PHONE_ID} \
    WHATSAPP_TOKEN=${WHATSAPP_TOKEN} \
    PPDB_WA_NUMBER=${PPDB_WA_NUMBER} \
    NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL} \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY} \
    NEXT_PUBLIC_VRM_URL=${NEXT_PUBLIC_VRM_URL} \
    NEXT_PUBLIC_VRM_VERSION=${NEXT_PUBLIC_VRM_VERSION}

# Copy sisa source (base stage sudah menyediakan node_modules + prisma).
COPY . .

# Pastikan Prisma client fresh (redundan karena postinstall sudah generate,
# tapi aman untuk memastikan engine sesuai dengan OpenSSL container ini).
RUN npx prisma generate
RUN npm run build

# =============================================================================
# Stage Runner — image produksi minimal
# =============================================================================
FROM node:22.20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

# User non-root.
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# OpenSSL + ca-certificates juga dibutuhkan di stage RUNNER untuk koneksi Prisma
# (TLS ke Postgres / Supabase) dan fetch HTTPS (Resend, Gemini, Fish Audio, WA).
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Salin artifact dari builder.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
