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
CREATE TYPE "PpdbStatus" AS ENUM ('PENDING', 'CONTACTED', 'APPROVED', 'REGISTERED', 'REJECTED');

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
    "majorFirst" TEXT NOT NULL,
    "majorSecond" TEXT NOT NULL,
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

-- ============================================================
-- Konten situs publik yang dikelola Admin Panel
--   jurusans : program keahlian (4 bawaan diinisialisasi dari server,
--              jurusan tambahan dikelola lewat Admin Panel)
--   beritas  : berita buatan admin (berita web tetap ditarik dari
--              WordPress, tidak disimpan di database)
-- ============================================================

-- CreateTable
CREATE TABLE "jurusans" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT NOT NULL,
    "tagline" TEXT,
    "deskripsi" TEXT NOT NULL,
    "tentang" TEXT NOT NULL DEFAULT '',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keunggulan" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "kompetensi" JSONB NOT NULL DEFAULT '[]',
    "karir" JSONB NOT NULL DEFAULT '[]',
    "ikon" TEXT NOT NULL DEFAULT 'GraduationCap',
    "warna" TEXT NOT NULL DEFAULT 'sky',
    "gambar" TEXT,
    "heroTeks" TEXT,
    "introKompetensi" TEXT NOT NULL DEFAULT '',
    "introKarir" TEXT NOT NULL DEFAULT '',
    "ctaJudul" TEXT NOT NULL DEFAULT '',
    "ctaTeks" TEXT NOT NULL DEFAULT '',
    "bawaan" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 100,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jurusans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beritas" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "konten" TEXT,
    "kategori" TEXT NOT NULL DEFAULT 'Berita',
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gambar" TEXT,
    "url" TEXT,
    "sourceUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beritas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jurusans_kode_key" ON "jurusans"("kode");
CREATE INDEX "jurusans_aktif_urutan_idx" ON "jurusans"("aktif", "urutan");
CREATE UNIQUE INDEX "beritas_slug_key" ON "beritas"("slug");
CREATE UNIQUE INDEX "beritas_sourceUrl_key" ON "beritas"("sourceUrl");
CREATE INDEX "beritas_published_tanggal_idx" ON "beritas"("published", "tanggal");

-- CreateTable: konten tiap bagian halaman publik yang bisa diedit admin.
CREATE TABLE "site_contents" (
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_contents_pkey" PRIMARY KEY ("key")
);

-- Kunci akses via Supabase Data API (Prisma tetap bisa akses penuh).
-- Tidak ada policy publik; pembacaan/penulisan tetap lewat server + requireAdmin.
ALTER TABLE "jurusans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "beritas" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_contents" ENABLE ROW LEVEL SECURITY;
