-- ============================================================
-- Init schema auth (Auth.js/NextAuth v5 + Prisma) untuk Supabase
--
-- Cara pakai:
--   1. Buka Supabase Dashboard → SQL Editor → New query
--   2. Paste seluruh isi file ini → Run
--   3. Selesai. Tabel ini identik dengan prisma/schema.prisma,
--      jadi `npx prisma db push` nanti hanya akan bilang
--      "already in sync".
--
-- Catatan RLS: tabel-tabel ini HANYA diakses via Prisma (koneksi
-- postgres langsung, role superuser → melewati RLS). RLS tetap
-- diaktifkan tanpa policy supaya tidak bisa diakses lewat
-- Supabase Data API (PostgREST) dari luar.
-- ============================================================

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- PPDB 2026/2027
-- ============================================================

-- CreateEnum
CREATE TYPE "PpdbJurusan" AS ENUM ('DKV', 'PPLG', 'TJKT', 'TKR');

-- CreateEnum
CREATE TYPE "PpdbStatus" AS ENUM ('PENDING', 'CONTACTED', 'REGISTERED', 'REJECTED');

-- CreateTable
CREATE TABLE "ppdb_registrations" (
    "id" TEXT NOT NULL,
    "registrationNo" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "previousSchool" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "majorFirst" "PpdbJurusan" NOT NULL,
    "majorSecond" "PpdbJurusan" NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "notes" TEXT,
    "status" "PpdbStatus" NOT NULL DEFAULT 'PENDING',
    "waSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ppdb_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ppdb_registrations_registrationNo_key" ON "ppdb_registrations"("registrationNo");

-- CreateIndex
CREATE UNIQUE INDEX "ppdb_registrations_userId_key" ON "ppdb_registrations"("userId");

-- CreateIndex
CREATE INDEX "ppdb_registrations_status_idx" ON "ppdb_registrations"("status");

-- CreateIndex
CREATE INDEX "ppdb_registrations_createdAt_idx" ON "ppdb_registrations"("createdAt");

-- AddForeignKey
ALTER TABLE "ppdb_registrations" ADD CONSTRAINT "ppdb_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Kunci akses via Supabase Data API (Prisma tetap bisa akses penuh)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ppdb_registrations" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Histori chat AI (satu baris = satu conversation, messages = JSON)
-- Guest tidak disimpan; hanya user login.
-- ============================================================
CREATE TABLE "chat_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Percakapan baru',
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "chat_conversations_userId_updatedAt_idx" ON "chat_conversations"("userId", "updatedAt");

ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_conversations" ENABLE ROW LEVEL SECURITY;
