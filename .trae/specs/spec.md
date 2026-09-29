# Spesifikasi: Perombakan Total Dashboard & Admin Panel

## 1. Problem Statement

Dashboard dan admin panel saat ini berfungsi dengan baik untuk operasional dasar, namun:
- Tampilan belum cukup profesional untuk skala enterprise (kurang depth, hierarchy visual lemah)
- Belum ada widget statistik interaktif dengan grafik/diagram
- Navigasi admin belum modular (semua ditumpuk dalam satu halaman)
- Belum ada audit log untuk melacak aktivitas admin
- Belum ada fitur notifikasi sistem terintegrasi
- Belum ada fitur filter, pencarian, dan export data
- Sistem RBAC berjalan tetapi tidak memiliki UI manajemen peran yang terpusat
- Belum ada autentikasi dua faktor (2FA)
- Performa dan UX pada data besar belum teruji

## 2. Pengguna (Users)

| Peran | Kebutuhan Utama |
|---|---|
| **USER (Siswa)** | Melihat ringkasan, statistik sekolah, status PPDB, agenda, pengumuman |
| **ADMIN** | Mengelola data user (USER role), mengelola pendaftaran PPDB, melihat statistik real-time, export data |
| **SUPER_ADMIN** | Semua akses ADMIN + manajemen role ADMIN, audit log, pengaturan sistem, 2FA enforcement |

## 3. Tujuan (Goals)

1. Menghasilkan antarmuka dashboard & admin yang **100% lebih profesional** secara visual (depth, hierarchy, consistency, spacing)
2. Menyediakan **widget statistik interaktif** dengan grafik/diagram untuk metrik bisnis kunci
3. Membangun **navigasi admin modular** dengan sidebar khusus + tabs per modul
4. Mengimplementasikan **audit log** untuk semua aktivitas admin (CRUD user, perubahan PPDB, perubahan role)
5. Menambahkan **filter, pencarian, dan export** (CSV/JSON) pada tabel data
6. Menyediakan **notifikasi sistem** (toast + bell) untuk update penting
7. Menambahkan **halaman manajemen role & izin** terpusat
8. Menerapkan **2FA (Authenticator App / OTP via email)** untuk admin
9. Memastikan **responsif sempurna** di mobile, tablet, desktop

## 4. Non-Goals

- Tidak merombak halaman publik (landing page, auth pages) — fokus hanya pada `/dashboard/*` dan `/admin/*`
- Tidak mengubah struktur database inti User/PpdbRegistration (hanya menambah tabel baru: AuditLog, Notification, TwoFactor)
- Tidak mengganti library auth (NextAuth v5 tetap digunakan)
- Tidak menambahkan payment gateway atau fitur di luar scope admin/dashboard
- Tidak menulis test otomatis (unit/integration/e2e) — pengujian dilakukan secara manual + laporan pengujian

## 5. Persyaratan Fungsional

### 5.1 UI/UX Design System

**FR-01** — Menerapkan design system yang konsisten:
- Spacing scale (4px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 px
- Typography hierarchy: Display / Heading 1-4 / Body Large / Body / Caption / Overline
- Elevation scale: 0 (flat), 1 (subtle), 2 (card), 3 (dropdown), 4 (modal)
- Color palette professional: sky/blue primary, slate neutral, emerald success, amber warning, rose destructive, violet accent

**FR-02** — Dashboard shell baru dengan sidebar yang lebih kaya:
- Sidebar dengan section grouping (Dashboard, Akademik, Akun)
- Header dengan search bar quick access, notification bell, user dropdown
- Content area dengan maximum width container yang tepat
- Footer minimal

**FR-03** — Admin shell khusus (berbeda visual dari dashboard siswa):
- Sidebar dengan icon + label, collapsed state optional
- Multi-section: Overview, Users, PPDB, Roles & Permissions, Audit Log, Settings
- Breadcrumb navigation
- Dark mode toggle (opsional, tapi design system harus siap)

### 5.2 Dashboard Fungsionalitas (untuk semua role login)

**FR-04** — Halaman ringkasan dashboard dengan widget statistik real-time:
- 4 stat cards dengan micro-interaction (hover lift, counter animation)
- 1 line/bar chart mini (tren pendaftaran PPDB 7 hari terakhir) — data dummy dengan kecenderungan realistis
- 1 donut/pie chart mini (distribusi jurusan PPDB)
- Recent activity timeline (untuk admin) / progress akademik (untuk user)

**FR-05** — Sistem notifikasi terintegrasi:
- Bell icon di header dengan badge jumlah unread
- Dropdown panel notifikasi (max 10 item terbaru)
- Toast notification (success/error/info) untuk aksi CRUD
- State di-manage via React Context atau local state sederhana

**FR-06** — Komponen search & filter global:
- Search box di header untuk quick jump ke menu
- Per-tabel: text filter + status filter + date range filter + clear all
- Debounced search (300ms)

### 5.3 Admin Module

**FR-07** — Modular admin panel navigation:
- Overview page (admin dashboard) — berbeda dari user dashboard
- Users page — tabel user terpisah dengan role filter
- PPDB page — tabel pendaftaran dengan status & jurusan filter
- Roles & Permissions page — SUPER_ADMIN only
- Audit Log page — SUPER_ADMIN only
- Settings page (akun admin sendiri + 2FA setup)

**FR-08** — Sistem manajemen pengguna, peran, dan izin (RBAC UI):
- Page "Roles & Permissions" dengan matrix permission (role × action)
- Super Admin dapat:
  - Melihat ringkasan jumlah user per role
  - Mengubah role user (USER ↔ ADMIN)
  - Melihat permission matrix (read-only view, rules ditentukan di kode)
- Page Users dengan multi-select & bulk actions (bulk change role, bulk delete confirmation)

**FR-09** — Audit log untuk melacak aktivitas admin:
- Tabel `AuditLog` baru di Prisma schema: id, actorId, action, entityType, entityId, oldValue (JSON), newValue (JSON), timestamp, ipAddress
- Server actions / API mencatat:
  - User created / updated / deleted
  - Role changed
  - PPDB status updated / registration deleted
- Audit Log page menampilkan tabel dengan filter: actor, action, date range, entity type
- Data audit log immutable (tidak bisa diedit/dihapus dari UI)

**FR-10** — Fitur filter, pencarian, export data handal:
- Setiap tabel admin (Users, PPDB, Audit Log) punya:
  - Text search (nama/email/nomor pendaftaran)
  - Status filter chip
  - Sortable columns (click header untuk asc/desc)
  - Pagination (10 / 25 / 50 per page)
  - Export button: CSV (Excel compatible) + JSON
- Export di-generate client-side dengan format yang tepat (UTF-8 BOM untuk Excel)

**FR-11** — Alur manajemen konten & transaksi lebih efisien:
- PPDB status change dengan confirmation dialog + reason optional (catatan internal)
- User edit dialog dengan preview perubahan sebelum submit
- Row-level action buttons dengan icon + tooltip

**FR-12** — Keamanan tambahan: 2FA autentikasi:
- Page "Security Settings" di dashboard / admin settings
- Setup 2FA via Authenticator App (TOTP):
  - Generate secret key + QR code
  - Verifikasi 6-digit OTP
  - Simpan secret (terenkripsi) + recovery codes
- Login flow: setelah password benar, jika 2FA aktif → minta OTP
- Recovery code access (SUPER_ADMIN only, untuk reset 2FA user yang terkunci)
- **Catatan implementasi**: 2FA pada tahap ini berbasis client-side verification + DB storage; integration penuh ke NextAuth auth callback adalah stretch goal. Implementasi minimal: UI lengkap + flow simulasi yang siap di-integrasikan nanti.

### 5.4 Pengujian & Validasi

**FR-13** — Checklist pengujian manual terdokumentasi:
- Test UI responsiveness (mobile 360px, tablet 768px, desktop 1280px, desktop 1920px)
- Test semua CRUD operations (Users, PPDB)
- Test role boundary: USER tidak bisa akses /admin, ADMIN tidak bisa hapus SUPER_ADMIN, dll.
- Test export CSV/JSON untuk 0 record, 1 record, 50+ record
- Test notification flow
- Test audit log capture accuracy
- Test filter, search, sort, pagination
- Lighthouse performance: FCP < 2s, LCP < 2.5s pada dashboard
- Accessibility: semua tombol punya label, warna contrast AA, keyboard navigable (Tab/Enter/Esc)

## 6. Persyaratan Non-Fungsional

**NFR-01-Performa**: First Contentful Paint < 2s pada dashboard admin dengan 500 record data simulasi.

**NFR-02-Konsistensi**: Semua komponen menggunakan tokens design system (bukan magic number inline).

**NFR-03-Type Safety**: Semua props, state, dan API response di-annotasi TypeScript dengan strict mode (no `any` kecuali eksplisit justified).

**NFR-04-Error Handling**: Semua async operation (fetch, form submit) punya loading + error state yang user-friendly.

**NFR-05-Aksesibilitas**: Kontras warna minimum 4.5:1 untuk teks body; semua interaktif element bisa diakses via keyboard; landmark semantic (header, nav, main, aside, footer).

**NFR-06-Responsif**: Breakpoint mobile (< 640px), tablet (640-1024px), desktop (> 1024px) — semua layout tidak ada horizontal overflow.

**NFR-07-Animasi Smooth**: Transisi sesuai preferensi user (motion-safe: `prefers-reduced-motion` dihormati); durasi 150-300ms; easing cubic-bezier standar.

## 7. Constraints & Dependencies

### Technology Stack (tidak berubah):
- **Framework**: Next.js 16 (App Router, Server Components)
- **Bahasa**: TypeScript strict
- **Styling**: Tailwind CSS v4
- **UI Primitives**: Radix UI (existing pattern dipertahankan)
- **Auth**: NextAuth v5 (Auth.js) + @auth/prisma-adapter
- **ORM**: Prisma 7 dengan PostgreSQL
- **Ikon**: lucide-react
- **Animasi**: animejs (existing), CSS transitions (tambahan)

### Library baru yang diizinkan (tanpa tambahan eksterna jika bisa):
- **Chart**: Gunakan SVG + CSS custom (tidak menambah dependency) — minimal donut chart + bar chart components built from scratch
- **Export CSV/JSON**: Built-in `Blob` + `URL.createObjectURL` (tanpa library)
- **2FA TOTP**: Jika membutuhkan, implementasi manual HMAC-SHA1 OTP di server (jika terlalu kompleks, fallback ke UI simulasi dengan dokumentasi integration note)

### Constraints:
- Semua route `/admin/*` wajib server-side auth guard (role ADMIN minimum)
- Semua mutation API wajib rate-limit friendly (validasi CSRF via NextAuth built-in)
- Enkripsi field sensitif (2FA secret, recovery code hash) di DB — bcrypt/sha256 cukup jika native crypto API available di server
- Tidak ada inline `<script>` atau `dangerouslySetInnerHTML` tanpa sanitasi eksplisit

## 8. Assumptions & Open Questions

**Assumptions**:
1. Data dummy charts (statistik trend PPDB, distribusi jurusan) di-generate dari data PPDB nyata yang ada + fallback ke data sintetis jika record < 7 hari.
2. 2FA implementation adalah UI-first + backend scaffold (tidak perlu production-ready auth callback integration pada scope ini).
3. Audit log mencatat action dari API route saja — client-side optimistic update tidak audit sampai server confirm.
4. Notification system saat ini adalah client-side (in-app toast + bell panel) — belum push notification / email notification.

**Open Questions**:
- **[CLOSED by Assumption]** Apakah SUPER_ADMIN boleh menghapus ADMIN lain? → Ya (sudah di `canDeleteUser` rules).
- **[CLOSED by Assumption]** Format export CSV: apakah perlu header Bahasa Indonesia? → Ya, sesuai target pengguna lokal.
- **[CLOSED by Assumption]** Dark mode: harus ada atau cukup design tokens siap? → Cukup design tokens siap (CSS variables), toggle UI optional.

## 9. Acceptance Criteria

| ID | Tipe | Pernyataan Penerimaan |
|---|---|---|
| **AC-01** | rubric | Kualitas visual dashboard & admin: profesional, modern, dengan depth visual. Skala 0-5, threshold ≥ 4. Anchor: 0=flat & tidak konsisten, 2=memenuhi standar dasar tapi tidak memorable, 4=hierarchy jelas, spacing konsisten, elevation tepat, 5=delightful, premium feel. |
| **AC-02** | rule | Navigasi dashboard memiliki sidebar dengan section grouping, header dengan search + notification bell + user dropdown, dan berfungsi mobile via drawer sheet. |
| **AC-03** | rule | Navigasi admin panel modular dengan minimal 5 section: Overview, Users, PPDB, Audit Log, Settings. |
| **AC-04** | rule | Dashboard ringkasan menampilkan ≥ 4 stat cards interaktif + ≥ 1 chart (bar/line) + ≥ 1 donut chart distribusi. |
| **AC-05** | rule | Sistem notifikasi: bell badge unread count, dropdown panel notifikasi, dan toast untuk CRUD actions. |
| **AC-06** | rule | Semua tabel admin memiliki: text search, status filter, column sort, pagination, export CSV + JSON. |
| **AC-07** | rule | Audit Log tercatat di DB dan ditampilkan di UI dengan filter actor + action + date range. |
| **AC-08** | rule | Roles & Permissions page menampilkan matrix role × permission dan role count summary. |
| **AC-09** | rule | 2FA setup UI tersedia (QR/secret, OTP verify, recovery codes display) dengan state persistence di DB. |
| **AC-10** | rule | Responsif: 4 breakpoint (360/768/1280/1920px) — visual inspection tanpa horizontal overflow. |
| **AC-11** | rule | ESLint (`npm run lint`) lulus 0 error. |
| **AC-12** | rule | Build production (`npm run build`) berhasil tanpa error TypeScript. |
| **AC-13** | rubric | Animasi smooth & optimized. Skala 0-2, threshold ≥ 1. Anchor: 0=janky/tidak ada, 1=mulser & konsisten tapi tidak semua interaksi punya, 2=semua micro-interaction ada & motion-safe. |
| **AC-14** | rule | Role boundary enforcement: USER tidak bisa akses /admin, ADMIN tidak bisa ubah role, SUPER_ADMIN memiliki semua akses. |
| **AC-15** | rubric | Kualitas kode: type safety, separation of concerns, komentar minimal tapi jelas. Skala 0-3, threshold ≥ 2. Anchor: 0=chaotic, 1=berfungsi tapi berantakan, 2=clean pattern, 3=excellent, production-ready. |
