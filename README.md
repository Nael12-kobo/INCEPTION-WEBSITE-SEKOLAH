# 🎓 Website SMK Telekomunikasi Tunas Harapan

Website resmi **SMK Telekomunikasi Tunas Harapan** — situs profil sekolah
untuk publik (calon siswa & orang tua & Masyarakat) plus portal akademik bagi siswa, guru,
dan administrator. Dibangun dengan Next.js (App Router), TypeScript, dan
Tailwind CSS.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Petunjuk Instalasi](#petunjuk-instalasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Variabel Lingkungan](#variabel-lingkungan)
- [Struktur Halaman](#struktur-halaman)
- [Deployment](#deployment)

## Fitur

### Situs publik

- **Landing page profil sekolah** — hero, statistik, profil, 4 program
  keahlian, fasilitas, berita, dan CTA PPDB dengan animasi reveal/tilt dan
  desain glassmorphism (anime.js), responsif untuk HP 360–430px.
- **Berita otomatis** — ditarik dari blog WordPress sekolah
  (`tunasharapan.info/official/blog`) lewat REST API, cache 1 jam, kartu
  menampilkan foto, kategori, tanggal, dan link ke artikel asli.
- **Galeri fasilitas** (13 foto dokumentasi) dan halaman **Guru & Karyawan**
  (50 foto tenaga pendidik).
- **Halaman jurusan** PPLG, TJKT, DKV, TKRO; halaman **PPDB**; kebijakan
  privasi & syarat layanan.

### Portal & administrasi

- **Autentikasi**: login Google, GitHub, atau email + kata sandi (bcrypt) —
  Auth.js / NextAuth v5 + Prisma Adapter, dengan peran `USER`/`ADMIN`.
- **Portal siswa**: dashboard, akademik, profil, pengaturan.
- **Panel admin** (`/admin`): overview, pengguna, peran, PPDB, log audit,
  dan pengaturan situs.

### AI & integrasi

- **Chatbot AI** (Google Gemini) dengan **karakter 3D VRM** (three.js) dan
  **suara TTS** (Fish Audio) di halaman `/chat`.
- **Email otomatis** (Resend): reset kata sandi dan notifikasi PPDB.
- **Notifikasi WhatsApp Cloud API** untuk pendaftar PPDB.
- Rate limiting, audit trail, dan penyajian gambar ter-optimasi
  (`next/image`).

## Teknologi

| Kategori    | Stack                                                            |
| ----------- | ---------------------------------------------------------------- |
| Framework   | Next.js 16 (App Router), React 19, TypeScript                    |
| Styling     | Tailwind CSS v4, shadcn/ui + Radix UI, anime.js                  |
| 3D & Media  | three.js, @pixiv/three-vrm, `next/image`                         |
| Database    | PostgreSQL (Supabase), Prisma ORM 7                              |
| Autentikasi | Auth.js (NextAuth v5), bcryptjs                                  |
| AI & Suara  | Google GenAI (Gemini), Fish Audio                                |
| Layanan     | Resend (email), WhatsApp Cloud API                               |
| Tooling     | ESLint, Prisma CLI, Vercel                                        |

## Prasyarat

- **Node.js ≥ 20.9** (dikembangkan dengan Node 26) dan **npm ≥ 10**
- **PostgreSQL** — Supabase direkomendasikan, tapi DB postgres lain juga bisa
- API key opsional untuk chat AI, email, dan TTS (lihat
  [Variabel Lingkungan](#variabel-lingkungan)) — website tetap jalan tanpa
  mereka, hanya fitur terkait yang nonaktif

## Petunjuk Instalasi

```bash
# 1. Ambil kode dari repository
git clone https://github.com/Nael12-kobo/INCEPTION-WEBSITE-SEKOLAH.git
cd INCEPTION-WEBSITE-SEKOLAH

# 2. Install dependensi (postinstall otomatis menjalankan `prisma generate`)
npm install

# 3. Siapkan environment
cp .env.example .env
#    lalu isi minimal DATABASE_URL, DIRECT_URL, dan AUTH_SECRET
#    (buat secret: openssl rand -base64 32)

# 4. Siapkan database — pilih salah satu:
#    a) Supabase: Dashboard → SQL Editor → New query →
#       tempel seluruh isi prisma/supabase-init.sql → Run
#    b) PostgreSQL lain / lokal:
npx prisma db push

# 5. Selesai — jalankan mode pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Cara Menjalankan

| Perintah          | Fungsi                                                  |
| ----------------- | ------------------------------------------------------- |
| `npm run dev`     | Server pengembangan (hot reload) di `localhost:3000`    |
| `npm run build`   | Build produksi (`prisma generate` + `next build`)       |
| `npm start`       | Jalankan hasil build produksi                           |
| `npm run lint`    | Periksa kode dengan ESLint                              |

Mode produksi:

```bash
npm run build
npm start
```

## Variabel Lingkungan

Salin `.env.example` ke `.env`. Lengkap ada di template — ringkasannya:

| Variabel                                             | Wajib | Kegunaan                                   |
| ---------------------------------------------------- | ----- | ------------------------------------------ |
| `DATABASE_URL`, `DIRECT_URL`                         | ✅    | Koneksi PostgreSQL untuk Prisma            |
| `AUTH_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`         | ✅    | Sesi login Auth.js                         |
| `AUTH_GOOGLE_ID/SECRET`, `AUTH_GITHUB_ID/SECRET`     | —     | Login OAuth (tanpa ini, email+sandi jalan) |
| `GEMINI_API_KEY`, `GEMINI_MODEL`                     | —     | Chat AI di `/chat`                         |
| `FISH_AUDIO_API_KEY`, `FISH_AUDIO_MODEL`, `...REFERENCE_ID` | — | Suara karakter (TTS)                  |
| `RESEND_API_KEY`, `RESEND_FROM`                      | —     | Email reset & notifikasi PPDB              |
| `WHATSAPP_PHONE_ID`, `WHATSAPP_TOKEN`, `PPDB_WA_NUMBER` | —   | Notifikasi WhatsApp PPDB                   |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_VRM_URL`, `NEXT_PUBLIC_VRM_VERSION` | — | URL situs & model karakter 3D  |

## Struktur Halaman

| Rute                                   | Untuk        | Isi                                     |
| -------------------------------------- | ------------ | --------------------------------------- |
| `/`                                    | Publik       | Landing page (profil, jurusan, berita)   |
| `/jurusan/[kode]`                      | Publik       | Detail PPLG, TJKT, DKV, TKRO            |
| `/guru-karyawan`                       | Publik       | Galeri foto guru & karyawan               |
| `/ppdb`                                | Publik       | Pendaftaran siswa baru                  |
| `/chat`                                | Publik       | Chatbot AI + karakter 3D                 |
| `/auth/*`                              | Publik       | Login, daftar, lupa/reset kata sandi     |
| `/dashboard`, `/academic`, `/profile`, `/settings` | Siswa | Portal akademik pribadi           |
| `/admin/*`                             | Admin        | Users, roles, PPDB, audit, settings      |

Navbar situs hanya tampil di route publik; route portal memakai header
sendiri (lihat `src/components/SiteChrome.tsx`).

## Deployment

Direkomendasikan lewat [Vercel](https://vercel.com/new):

1. Import repository ini ke Vercel.
2. Tambahkan semua variabel wajib (+ opsional yang diinginkan) di
   **Project Settings → Environment Variables**.
3. Deploy — build otomatis memakai `npm run build`.

Catatan:

- **Berita** ditarik dari WordPress sekolah saat build lalu di-cache 1 jam;
  kalau situs sumber sedang down, homepage tetap tampil (fallback statis).
- Foto guru ada di `public/guru-karyawan/` dan terdaftar di
  `src/lib/guru-karyawan.ts` (tambah foto = tambah entri di sana).
- Skema database diatur lewat `prisma/schema.prisma` (tidak ada folder
  `migrations` — pakai `prisma db push`).
