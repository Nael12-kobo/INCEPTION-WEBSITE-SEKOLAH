# Tasks: Perombakan Total Dashboard & Admin Panel

Diturunkan dari `spec.md` di folder yang sama. Urut berdasarkan prioritas dan dependency.

## Status Legend
- `pending` — belum dikerjakan
- `in_progress` — sedang dikerjakan
- `blocked` — tertahan (wajib isi `Blocked By` dan `Unblock Condition`)
- `completed` — semua TR lulus self-verification + ada `Completion Evidence`
- `cancelled` — persetujuan user tertulis

---

## Phase 1: Foundation & Design System

### Task 1: Upgrade Design System (globals.css + UI tokens)
**Priority**: high  
**Dependencies**: —  
**Maps to AC**: AC-01, AC-10, AC-13, NFR-02, NFR-05, NFR-07  
**Scope**:
- Perluas CSS variables di `src/app/globals.css` untuk:
  - Elevation/shadow scale (0-4)
  - Extended color palette (slate 50-900, emerald 50-900, amber 50-900, rose 50-900, violet 50-900)
  - Typography scale (font-size, line-height, letter-spacing untuk display/heading/body/caption/overline)
  - Spacing utilities jika belum coverage penuh
- Tambahkan `prefers-reduced-motion` guard pada semua animasi CSS
- Pastikan dark mode token placeholder ada (walau toggle belum)

**Test Requirements (TR)**:
- **TR-1.1 (rule)**: Semua 5 elevation level (0-4) tersedia sebagai CSS class / token dan terlihat berbeda di preview.
- **TR-1.2 (rule)**: Color contrast body text (slate-700/800/900 on white/slate-50) mencapai AA (4.5:1) — verifikasi via DevTools color picker.
- **TR-1.3 (rule)**: `prefers-reduced-motion: reduce` menonaktifkan CSS transitions & anime.js reveals tanpa memecah layout.
- **TR-1.4 (rubric)**: Konsistensi tokens. Skala 0-2, threshold ≥ 1. 0=masih banyak magic number, 1=coverage 70%+, 2=100% desain pakai tokens.
Evidence: Inspect DOM di 3 halaman berbeda (dashboard overview, admin users, admin ppdb).

**Status**: pending  
**Completion Evidence**: —

---

### Task 2: Build Shared UI Components Library Extensions
**Priority**: high  
**Dependencies**: Task 1  
**Maps to AC**: AC-01, AC-04, AC-06, FR-04, FR-06  
**Scope**:  
Buat komponen baru di `src/components/ui/` (jika belum ada):
1. **DataTable** — tabel generik dengan: column def, sortable header, pagination (10/25/50/page), empty state, loading skeleton
2. **FilterBar** — search input + status chips + clear-all button
3. **ExportButton** — dropdown menu: Export CSV, Export JSON. Client-side Blob + UTF-8 BOM untuk Excel
4. **StatCard** — card dengan icon, value counter animasi, label, sublabel, trend indikator (up/down arrow optional)
5. **Charts**:
   - `DonutChart.tsx` — SVG donut dengan segments, legend, center label
   - `BarChart.tsx` — SVG bar chart mini (max 12 data points), axis Y optional, hover tooltip
6. **Toast / NotificationProvider** — React Context + portal untuk toast success/error/info/warning
7. **Badge** variants extend (tambahan: `status` variant dengan dot indicator untuk PENDING/CONTACTED/REGISTERED/REJECTED)
8. **UserDropdown** — avatar click → dropdown: Profile, Settings, Logout

Gunakan pattern existing (`cn()` util, CVA jika sesuai, Radix primitives bila tersedia). Jangan tambah dependency luar.

**Test Requirements (TR)**:
- **TR-2.1 (rule)**: DataTable menampilkan 50 row dummy, pagination ganti halaman berfungsi, sort asc/desc berbalik saat header di-click 2x.
- **TR-2.2 (rule)**: ExportButton menghasilkan CSV dengan `;"` separator (Excel-compatible) dan JSON valid saat di-parse kembali.
- **TR-2.3 (rule)**: DonutChart menampilkan 3-5 segments dengan total = 100% dan legend sesuai.
- **TR-2.4 (rule)**: NotificationProvider menampilkan toast success 3 detik lalu auto-dismiss, toast error bertahan sampai ditutup user.
- **TR-2.5 (rubric)**: API components intuitive & reusable. Skala 0-2, threshold ≥ 1. 0=sulit dipakai tanpa baca source, 1=good enough, 2=excellent props interface + dokumentasi inline.
Evidence: Sample usage di file test sederhana (bisa di comment out / inline preview).

**Status**: pending  
**Completion Evidence**: —

---

## Phase 2: Dashboard Shell Redesign

### Task 3: Dashboard Shell v2 — Sidebar Grouping, Header Search, Notification Bell, User Dropdown
**Priority**: high  
**Dependencies**: Task 1, Task 2  
**Maps to AC**: AC-02, AC-05, FR-02, FR-05  
**Scope**:  
Refactor `src/components/dashboard/dashboard-shell.tsx`:
1. **Sidebar**:
   - Group nav items menjadi sections:
     - `Dashboard` (Ringkasan, Statistik)
     - `Akademik` (Agenda, Jurusan, Berita, PPDB)
     - `Akun` (Akun Saya, Keamanan)
   - Section header dengan label uppercase kecil
   - Admin link ("Admin Panel") pindah ke section khusus `Administrasi` (hanya tampil untuk admin)
2. **Header**:
   - Kiri: Menu toggle mobile, Breadcrumb: `Dashboard / {current page}`
   - Tengah/Kanan (flex order):
     - Quick search input (placeholder "Cari menu, pengumuman...") — untuk sekarang non-functional (focus state visual only) + future-ready
     - NotificationBell dengan badge unread count → click buka dropdown panel 10 notifikasi terbaru (data dummy seed awal: 3 notifikasi)
     - UserDropdown (avatar → dropdown: Lihat Profil, Pengaturan Keamanan, Keluar)
3. **Content area**: max-width disesuaikan, spacing 24-32px padding, section gap 32-40px
4. **Mobile sheet**: Sama grouping dengan sidebar desktop

Perbarui `DashboardUser` type jika perlu (tambah field untuk avatar 2FA enabled badge).

**Test Requirements (TR)**:
- **TR-3.1 (rule)**: Sidebar menampilkan 3 section grouping di desktop dan sheet di mobile.
- **TR-3.2 (rule)**: NotificationBell dengan badge "3" → click buka panel list 3 notifikasi dummy.
- **TR-3.3 (rule)**: UserDropdown expandable dengan 3 menu dan logout bekerja (signOut seperti existing).
- **TR-3.4 (rule)**: Breakpoint mobile (360px width Chrome DevTools) — tidak ada horizontal overflow, sheet terbuka/tertutup smooth.
Evidence: Screenshot 4 breakpoint + interaction recording (bisa deskriptif tertulis).

**Status**: pending  
**Completion Evidence**: —

---

### Task 4: Dashboard Overview — Stat Cards + Charts + Timeline
**Priority**: high  
**Dependencies**: Task 2, Task 3  
**Maps to AC**: AC-04, FR-04  
**Scope**:  
Refactor `src/app/dashboard/page.tsx` dan `dashboard-stats.tsx` / buat komponen baru:
1. **Stat Cards (4 cards)**:
   - Total Users (real DB count)
   - Total PPDB Registrations (real DB count)
   - PPDB Pending (real)
   - Siswa Aktif (statik 850+ atau real jika tersedia)
   - Pakai `StatCard` component dengan counter animation dan icon
2. **Charts area (2 kolom)**:
   - **Kiri (60%)**: BarChart mini "Pendaftaran PPDB 7 Hari Terakhir" — aggregate `ppdb_registrations.createdAt` by date, 7 hari ke belakang. Jika data < 7 hari, isi sisa dengan 0.
   - **Kanan (40%)**: DonutChart "Distribusi Jurusan PPDB" — hitung PpdbRegistration dikelompokkan `majorFirst` (DKV, PPLG, TJKT, TKR)
3. **Timeline / Recent Activity**:
   - Untuk user role biasa: "Progress Akademik" (statik, kartu)
   - Untuk admin: "Aktivitas Terbaru" (5 row terakhir dari audit log — jika Task 9 sudah, kalau belum pakai dummy data dengan structure sama)

Pastikan server components fetch data aggregate efisien (Prisma `groupBy` / `count`).

**Test Requirements (TR)**:
- **TR-4.1 (rule)**: 4 StatCards menampilkan angka real dari DB (dibandingkan direct query ke prisma CLI).
- **TR-4.2 (rule)**: BarChart 7 bars dengan sum total ≥ total PPDB count (karena ≥ 7 hari mungkin lebih).
- **TR-4.3 (rule)**: DonutChart segments sum = total PPDB count, legend 4 jurusan sesuai enum PpdbJurusan.
- **TR-4.4 (rubric)**: Layout ringkasan visual hierarchy. Skala 0-2, threshold ≥ 1. 0=berantakan, 1=jelas, 2=prioritas informasi sempurna (stat > charts > timeline).

**Status**: pending  
**Completion Evidence**: —

---

## Phase 3: Admin Panel Modular

### Task 5: Admin Shell — Sidebar + Routing Multi-Page + Breadcrumb
**Priority**: high  
**Dependencies**: Task 1, Task 2  
**Maps to AC**: AC-03, FR-03, FR-07  
**Scope**:  
Ubah struktur `/app/admin/` dari single-page menjadi multi-section Next.js App Router:
```
app/admin/
  layout.tsx          ← AdminShell (sidebar + header + content area)
  page.tsx            ← redirect ke /admin/overview ATAU render Overview inline
  overview/page.tsx   ← Admin Overview Dashboard (Task 6)
  users/page.tsx      ← Users Management (Task 7)
  ppdb/page.tsx       ← PPDB Management (Task 8)
  roles/page.tsx      ← Roles & Permissions (SUPER_ADMIN only) (Task 10)
  audit/page.tsx      ← Audit Log (SUPER_ADMIN only) (Task 9)
  settings/page.tsx   ← Security Settings (2FA) (Task 11)
```

**AdminShell (`layout.tsx`)**:
- Sidebar kiri permanent (desktop) / sheet (mobile):
  - Section: Overview (Dashboard Admin), Users, PPDB Registrations
  - Section: System (Roles & Permissions [locked ADMIN], Audit Log [locked ADMIN], Settings)
  - Locked items: grayscale + badge "Super Admin" di kanan
- Header: Logo + breadcrumb (Admin / {section}) + notification bell (shared dengan dashboard) + user dropdown
- Route guard: setiap child page `requireAdmin()` di server; `roles` dan `audit` tambahan `requireSuperAdmin()`

Perbarui `admin-client.tsx` (pecah menjadi per-page component) atau hapus jika sudah tidak perlu.

**Test Requirements (TR)**:
- **TR-5.1 (rule)**: 6 route admin dapat diakses dengan role sesuai: overview/users/ppdb (ADMIN) + roles/audit (SUPER_ADMIN) + settings (SEMUA ADMIN).
- **TR-5.2 (rule)**: USER role (bukan admin) mengakses /admin → redirect ke /auth/login (existing behavior tetap).
- **TR-5.3 (rule)**: ADMIN mengakses /admin/roles → guard block dengan 403 Forbidden page atau redirect ke /admin/overview dengan toast warning.
- **TR-5.4 (rule)**: Sidebar active state (route saat ini) punya styling highlight berbeda.
Evidence: Screenshot 403 page + navigation flow.

**Status**: pending  
**Completion Evidence**: —

---

### Task 6: Admin Overview Dashboard
**Priority**: medium  
**Dependencies**: Task 5, Task 2, Task 4  
**Maps to AC**: AC-03, AC-04, FR-07  
**Scope**:  
Halaman `/admin/overview` — dashboard untuk ADMIN/SUPER_ADMIN:
1. **Stat Grid (6 cards)**:
   - Total Users (real)
   - Total Admin (real, role=ADMIN)
   - Total PPDB (real)
   - PPDB Pending (real)
   - PPDB Registered (real)
   - PPDB Rejected (real)
2. **Charts Row**:
   - BarChart "PPDB per Jurusan" (aggregate majorFirst)
   - LineChart (gunakan BarChart dengan style berbeda, atau buat LineChart simple) "Tren Pendaftaran 30 Hari"
3. **Quick Actions**:
   - 3 shortcut cards: "Kelola Users", "Kelola PPDB", "Lihat Audit Log"
4. **Recent Registrations table mini (5 rows)**:
   - 5 PPDB terbaru dengan status badge dan link "Lihat semua PPDB"

**Test Requirements (TR)**:
- **TR-6.1 (rule)**: 6 stat cards menampilkan angka real (verify dengan prisma query).
- **TR-6.2 (rule)**: Quick action cards link ke route yang tepat.
- **TR-6.3 (rule)**: Mini table 5 latest PPDB dengan sort createdAt desc.
- **TR-6.4 (rubric)**: Utility halaman overview untuk admin. Skala 0-2, threshold ≥ 1. 0=hanya hiasan, 1=berguna, 2=informasi penting sekaligus tersedia.

**Status**: pending  
**Completion Evidence**: —

---

### Task 7: Admin Users Management with DataTable
**Priority**: high  
**Dependencies**: Task 5, Task 2  
**Maps to AC**: AC-06, AC-14, FR-08, FR-10  
**Scope**:  
Halaman `/admin/users` dengan DataTable lengkap:
1. **FilterBar**:
   - Search input: cari name/email (server-side atau client-side, sesuai jumlah data — client-side ok untuk <1000 user)
   - Role filter chips: Semua, SUPER_ADMIN, ADMIN, USER
   - Verified filter: Semua, Verified, Unverified
2. **DataTable columns**:
   - Avatar + Name + Email (1 kolom gabungan)
   - Role (Badge dengan warna sesuai)
   - Email Verified (centang/silang + teks)
   - Created At (format id-ID, tanggal + jam opsional)
   - Actions: Edit (dialog) / Delete (confirmation) — sesuaikan dengan canEditUser/canDeleteUser existing rules
3. **Pagination** (default 25/page) + Sortable semua kolom teks
4. **ExportButton**: Export CSV & JSON semua user (semua filter diterapkan = export hasil difilter)
5. **Bulk Actions** (stretch, tapi TR-7.5 rubric):
   - Checkbox per row + select all
   - Bulk actions dropdown: Ubah Role (hanya SUPER_ADMIN), Hapus (dengan konfirmasi modal, hanya SUPER_ADMIN)
6. **Edit Dialog**: Pakai existing `UserEditDialog` di `user-edit-dialog.tsx` — pastikan tetap compatible, atau upgrade agar field lebih rapi.

Pastikan API routes `/api/admin/users` & `/api/admin/users/[id]` existing tetap support (PATCH untuk update, DELETE untuk hapus, GET untuk list).

**Test Requirements (TR)**:
- **TR-7.1 (rule)**: Search user dengan keyword 3 karakter memfilter baris secara debounced (<500ms, tanpa flickering).
- **TR-7.2 (rule)**: Role filter chip "ADMIN" hanya menampilkan user role ADMIN.
- **TR-7.3 (rule)**: Export CSV buka di Excel (atau Google Sheets) dengan kolom sesuai: ID, Name, Email, Role, Email Verified, Created At.
- **TR-7.4 (rule)**: ADMIN mengakses users page — tombol Hapus untuk target role=ADMIN hilang / disabled (canDeleteUser = false). SUPER_ADMIN bisa hapus ADMIN & USER, tapi tidak bisa hapus SUPER_ADMIN lain.
- **TR-7.5 (rubric)**: Efisiensi workflow CRUD user. Skala 0-2, threshold ≥ 1. 0=lebih buruk dari sebelumnya, 1=equal atau sedikit lebih baik, 2=signifikan lebih cepat.

**Status**: pending  
**Completion Evidence**: —

---

### Task 8: Admin PPDB Management with DataTable & Status Workflow
**Priority**: high  
**Dependencies**: Task 5, Task 2  
**Maps to AC**: AC-06, FR-10, FR-11  
**Scope**:  
Halaman `/admin/ppdb` menggantikan tabel PPDB di old admin-client:
1. **FilterBar**:
   - Search input: No. Pendaftaran / Nama / Email
   - Status filter chips: Semua, PENDING, CONTACTED, REGISTERED, REJECTED
   - Jurusan filter: Semua, DKV, PPLG, TJKT, TKR
2. **DataTable columns**:
   - Registration No (monospace font)
   - Full Name + Email
   - Major First / Major Second
   - Status (Badge dengan dot indikator, variant color berbeda per status)
   - Created At
   - Actions:
     - Ubah Status (inline select / dropdown dengan confirmation dialog + catatan internal optional → saved ke `notes` field PpdbRegistration atau field baru `adminNotes` jika cocok)
     - Lihat Detail (modal dengan semua data PPDB, full form readonly view)
     - Hapus (confirmation)
3. **Pagination** + Sortable columns + **ExportButton** (CSV & JSON)
4. **Detail Modal**: tampilkan semua field PpdbRegistration: data pribadi, sekolah asal, data ortu, jurusan pilihan, status, waSentAt, admin notes (jika ada)

Perluas API `/api/admin/ppdb/[id]` route.ts:
- PATCH bisa menerima `notes` atau field admin baru (jika ditambahkan: `statusNote` string? di schema).
- Tambahkan audit log capture di sini (Task 9: `lib/audit.ts` helper).

**Test Requirements (TR)**:
- **TR-8.1 (rule)**: 4 jenis filter (search, status, jurusan, combined) dapat dipakai bersama-sama dan hasilnya akurat.
- **TR-8.2 (rule)**: Ubah status PENDING → CONTACTED di UI tercermin di DB (prisma query verify) dan audit log tercatat.
- **TR-8.3 (rule)**: Detail Modal menampilkan semua field PpdbRegistration (minimal 10 field) untuk record test.
- **TR-8.4 (rule)**: Export CSV hasil filter = total row terlihat di pagination info.
- **TR-8.5 (rubric)**: Kejelasan status workflow. Skala 0-2, threshold ≥ 1. 0=status sulit dibedakan, 1=clear, 2=excel dengan color & tooltip konfirmasi.

**Status**: pending  
**Completion Evidence**: —

---

## Phase 4: Security & Audit

### Task 9: Prisma Schema — AuditLog Model + DB Migration + Audit Helper + Audit Log Page
**Priority**: high  
**Dependencies**: Task 5  
**Maps to AC**: AC-07, FR-09  
**Scope**:
1. **Schema Prisma** — Tambahkan model `AuditLog`:
   ```
   model AuditLog {
     id          String   @id @default(cuid())
     actorId     String
     actor       User     @relation("AuditActor", fields: [actorId], references: [id], onDelete: Restrict)
     action      String   // e.g. "USER_UPDATED", "PPDB_STATUS_CHANGED", "ROLE_CHANGED", "USER_DELETED"
     entityType  String   // "USER" | "PPDB_REGISTRATION" | "ROLE"
     entityId    String?
     oldValue    Json?
     newValue    Json?
     metadata    Json?    // IP, UserAgent, dll
     createdAt   DateTime @default(now())
     @@index([actorId, createdAt])
     @@index([entityType, entityId])
     @@index([action, createdAt])
   }
   ```
   Tambahkan juga ke model User: `auditLogs AuditLog[] @relation("AuditActor")`

2. **Prisma Migration**: `npx prisma migrate dev --name add_audit_log` — jalankan dan commit file migration (jika tidak bisa connect DB real, setidaknya file .sql di `prisma/migrations/` tergenerate).

3. **Helper `lib/audit.ts`**: Function `logAudit(action, entityType, entityId, oldValue?, newValue?, session?)` yang:
   - Membutuhkan server-side session (ambil user agent & IP dari request headers Next.js)
   - Membuat row AuditLog di DB
   - Error di log audit tidak throw (gunakan catch + console.error) — audit failure tidak memblokir operation

4. **Instrument API Routes** — Tambahkan `logAudit()` call di:
   - `/api/admin/users/[id]` (PATCH & DELETE)
   - `/api/admin/ppdb/[id]` (PATCH & DELETE)
   - `/api/admin/users` (POST, jika ada create user)

5. **Audit Log Page `/admin/audit`** (SUPER_ADMIN only):
   - DataTable dengan kolom: Timestamp, Actor (name+email), Action, Entity Type, Entity ID, Summary (diff old→new secara ringkas)
   - Filter: Action chips, Actor search, Date range picker (minimal 2 date input: From & To)
   - Row expandable / detail modal: lihat full JSON oldValue & newValue dengan syntax highlight sederhana.
   - **Immutable**: Tidak ada tombol Edit/Delete di halaman ini.

**Test Requirements (TR)**:
- **TR-9.1 (rule)**: Schema AuditLog berhasil di generate dan Prisma Client include model ini (TypeScript autocomplete).
- **TR-9.2 (rule)**: Update 1 user via API → 1 row AuditLog baru di DB dengan action=`USER_UPDATED`, oldValue & newValue JSON berbeda.
- **TR-9.3 (rule)**: Ubah status PPDB via admin panel → audit log dengan action=`PPDB_STATUS_CHANGED` tercatat.
- **TR-9.4 (rule)**: Halaman /admin/audit menampilkan log terurut createdAt desc, filter action "USER_UPDATED" hanya tampilkan action itu saja.
- **TR-9.5 (rule)**: ADMIN (bukan SUPER_ADMIN) akses /admin/audit → ditolak (403 / redirect dengan toast "Akses Super Admin dibutuhkan").
- **TR-9.6 (rubric)**: Kualitas informasi audit log. Skala 0-2, threshold ≥ 1. 0=tidak berguna, 1=basic够用, 2=detail & mudah ditelusuri (diff jelas).

**Status**: pending  
**Completion Evidence**: —

---

### Task 10: Roles & Permissions Management Page (SUPER_ADMIN only)
**Priority**: medium  
**Dependencies**: Task 5, Task 2  
**Maps to AC**: AC-08, FR-08  
**Scope**:  
Halaman `/admin/roles`:
1. **Summary Cards (3 cards)**:
   - Jumlah SUPER_ADMIN (count)
   - Jumlah ADMIN (count)
   - Jumlah USER (count)
2. **Permission Matrix Table**:
   - Rows: Daftar aksi (mis. 8-10 actions: "View User List", "Edit User Profile", "Delete User", "Change Role", "View PPDB", "Edit PPDB Status", "Delete PPDB", "View Audit Log", "Manage Roles")
   - Columns: 3 role headers (USER, ADMIN, SUPER_ADMIN)
   - Cell: Check ✓ (hijau) / Cross ✗ (abu-abu) sesuai rules di `lib/roles.ts`
   - Ini adalah READ-ONLY view (tampilan untuk memahami permission). Tidak ada edit di matrix karena rules ditentukan di kode untuk keamanan.
3. **Quick Role Change Mini Table** (below matrix / tab kedua):
   - Daftar 10 user terbaru dengan role select dropdown — SUPER_ADMIN bisa assign role USER / ADMIN / SUPER_ADMIN ke user yang bukan SUPER_ADMIN lain.
   - Panggil API PATCH `/api/admin/users/[id]` yang sudah support update role.

**Test Requirements (TR)**:
- **TR-10.1 (rule)**: Summary 3 cards count = Prisma query count per role.
- **TR-10.2 (rule)**: Permission matrix sesuai dengan function di `lib/roles.ts`. Contoh: canDeleteUser(ADMIN, USER) = false → matrix ADMIN column, Delete User row = ✗. SUPER_ADMIN column = ✓.
- **TR-10.3 (rule)**: Role change via dropdown untuk user "test-user@example.com" dari USER → ADMIN tersimpan di DB dan tercermin di matrix summary card.
- **TR-10.4 (rule)**: Ubah role SUPER_ADMIN lain → dropdown disable / error (cannot touch other SUPER_ADMIN).

**Status**: pending  
**Completion Evidence**: —

---

### Task 11: 2FA Authentication Flow (UI + Backend Scaffold)
**Priority**: medium  
**Dependencies**: Task 5  
**Maps to AC**: AC-09, FR-12  
**Scope**:
1. **Prisma Schema Extension** — Tambahkan 2 field ke model `User`:
   - `twoFactorSecret String?` — encrypted/hashed TOTP secret
   - `twoFactorEnabled Boolean @default(false)`
   - `twoFactorRecoveryCodes Json?` — array bcrypt-hashed recovery codes (min 8)
   - Generate migration: `npx prisma migrate dev --name add_2fa_fields`

2. **Server utility `lib/twofa.ts`**:
   - `generateSecret()` → { secret: string, otpauthUrl: string, qrDataUrl: string } (TOTP: 6 digit, 30 detik, SHA1, issuer="Portal SMK Tunas Harapan")
     - Implementasi HMAC-SHA1 OTP: referensi RFC 6238. Jika terlalu kompleks, generate dummy value yang valid structure-nya untuk UI.
   - `verifyToken(secret: string, token: string): boolean`
   - `generateRecoveryCodes(): string[]` → 8 kode acak (format: XXXX-XXXX)
   - `hashRecoveryCodes(codes: string[]): string[]`
   - `verifyRecoveryCode(hashedList: string[], codeInput: string): boolean`

3. **Page `/admin/settings`** (tab 2FA):
   - Jika 2FA belum aktif:
     - Card "Aktifkan Autentikasi Dua Faktor"
     - Langkah 1: Scan QR Code (tampilkan image dari `qrDataUrl`) + kode secret teks untuk input manual
     - Langkah 2: Input 6-digit OTP dari Authenticator App untuk verifikasi
     - Langkah 3: Jika valid → tampilkan 8 recovery codes dengan warning "Simpan ini, tidak akan ditampilkan lagi" → checkbox "Saya sudah menyimpan kode" → tombol "Selesaikan" sets `twoFactorEnabled=true`
   - Jika 2FA sudah aktif:
     - Card "Autentikasi Dua Faktor Aktif" dengan badge hijau
     - Tombol "Matikan 2FA" (butuh konfirmasi password)
     - Tombol "Lihat Recovery Codes" (butuh konfirmasi) — tampilkan yang tersimpan atau regenerate baru
   - Note: Login flow NextAuth integration tidak wajib di scope ini (future task), cukup UI + backend helper + DB storage sudah memenuhi AC-09.

4. **Page `/dashboard/keamanan`** (optional: buat stub route `/dashboard/settings` yang sama untuk user biasa, fitur 2FA sama).

**Test Requirements (TR)**:
- **TR-11.1 (rule)**: Field 2FA di model User ada, Prisma Client typings include.
- **TR-11.2 (rule)**: Setup 2FA flow: generate secret → tampil QR → input OTP valid → `twoFactorEnabled=true` di DB.
- **TR-11.3 (rule)**: Recovery codes generate 8 kode, format `XXXX-XXXX`, huruf kapital, hanya tampil SEKALI saat setup (refresh page hilang dari UI, tersimpan hashed di DB).
- **TR-11.4 (rule)**: 2FA yang sudah aktif → tombol "Matikan 2FA" tersedia, click dengan confirmation → `twoFactorEnabled=false`.
- **TR-11.5 (rubric)**: Kejelasan 2FA setup UX. Skala 0-2, threshold ≥ 1. 0=bingung user, 1=clear steps, 2=delightful dengan copywriting edukasi security.

**Status**: pending  
**Completion Evidence**: —

---

## Phase 5: Integration, Polish & Validation

### Task 12: Toast Notification Integration + Bell Notification Panel
**Priority**: medium  
**Dependencies**: Task 2, Task 3, Task 5  
**Maps to AC**: AC-05, FR-05, NFR-04  
**Scope**:
1. **NotificationProvider**:
   - Wrap `app/layout.tsx` (atau dashboard/admin layout saja) dengan provider
   - Toast API: `toast.success(message)`, `toast.error(message)`, `toast.info(message)`, `toast.warning(message)`
   - Position: bottom-right (desktop) / bottom (mobile)
   - Auto dismiss: success/info 3s, warning/error sticky

2. **Instrument CRUD Operations**:
   - Semua PATCH/DELETE di users page → toast success (e.g. "User berhasil diperbarui", "User berhasil dihapus") dan toast error jika gagal
   - Semua PATCH/DELETE di PPDB page → same pattern
   - Role change, 2FA operations → toast

3. **Bell Notification Panel**:
   - NotificationBell di header (dashboard & admin shell)
   - Panel 10 notifikasi terbaru:
     - Seed initial: 3 static notifikasi (mis. "Pengumuman UTS", "Pendaftaran PPDB baru", "Sistem maintenance")
     - Dynamic: setiap audit log action sukses → tambah 1 notifikasi untuk SUPER_ADMIN (stretch goal untuk scope ini)
   - "Tandai semua sudah dibaca" (clear badge)
   - "Lihat semua notifikasi" → link

**Test Requirements (TR)**:
- **TR-12.1 (rule)**: Update user name → toast success muncul, auto-dismiss dalam 3-5 detik.
- **TR-12.2 (rule)**: Delete user dengan invalid ID (test) → toast error muncul, tetap sampai ditutup.
- **TR-12.3 (rule)**: Bell badge awal "3", klik "Tandai semua dibaca" → badge menjadi 0.
- **TR-12.4 (rubric)**: Kualitas notifikasi system. Skala 0-2, threshold ≥ 1. 0=ganggu, 1=helpful, 2=excel timing & position.

**Status**: pending  
**Completion Evidence**: —

---

### Task 13: Responsive Fixes & Animation Polish
**Priority**: medium  
**Dependencies**: Semua task UI (3,4,5,6,7,8,10,11,12)  
**Maps to AC**: AC-10, AC-01, AC-13, NFR-06, NFR-07  
**Scope**:
1. Test 4 breakpoint manual (Chrome DevTools device emulator):
   - 360×640 (Mobile S)
   - 768×1024 (Tablet)
   - 1280×800 (Laptop)
   - 1920×1080 (Desktop HD)
2. Perbaiki semua horizontal overflow, text wrapping, dan elemen tumpang tindih.
3. Pastikan sidebar mobile sheet behavior sempurna (swipe gesture optional, close on backdrop click wajib).
4. Animasi micro-interactions:
   - Hover lift untuk cards (translateY -1px, shadow increase)
   - Skeleton loading untuk DataTable saat fetch data
   - Smooth fade-in untuk halaman baru (Router transition)
   - Accordion / expand row smooth
5. `prefers-reduced-motion` integration: disable semua anime.js dan CSS transitions jika user set-nya.

**Test Requirements (TR)**:
- **TR-13.1 (rule)**: Keempat breakpoint — visual inspection, screenshot masing-masing: TIDAK ADA horizontal overflow (tidak ada scrollbar horizontal).
- **TR-13.2 (rule)**: Text panjang di user name (≥ 40 karakter) wrap dengan benar tanpa merusak layout table.
- **TR-13.3 (rule)**: `prefers-reduced-motion` ON di OS settings → semua animasi hilang, layout tetap normal.
- **TR-13.4 (rubric)**: Animasi keseluruhan feel. Skala 0-2, threshold ≥ 1. 0=janky, 1=smooth, 2=polished & delightful.

**Status**: pending  
**Completion Evidence**: —

---

### Task 14: Build & Lint Pass, TypeScript Strict, Final QA Checklist
**Priority**: high  
**Dependencies**: Semua task sebelumnya  
**Maps to AC**: AC-11, AC-12, AC-14, AC-15, NFR-03, FR-13  
**Scope**:
1. Jalankan `npm run lint` — fix semua error / warning (setidaknya ERROR harus 0).
2. Jalankan `npm run build` — fix semua TypeScript error, pastikan build sukses.
3. QA Checklist manual (isi laporan sebagai Completion Evidence):
   - **Responsiveness**: 4 breakpoint (TR-13.1).
   - **CRUD Users**: Create/Edit/Delete.
   - **CRUD PPDB**: Edit status, delete registration.
   - **Role Boundary Test Matrix**:
     - USER → /admin (expect redirect)
     - USER → /admin/users (expect 403/redirect)
     - ADMIN → /admin/roles (expect 403/redirect)
     - ADMIN → Delete user ADMIN (expect disabled / error)
     - SUPER_ADMIN → Delete SUPER_ADMIN lain (expect disabled / error)
     - SUPER_ADMIN → Change role ADMIN → USER (expect berhasil)
   - **Export Test**:
     - 0 records export CSV → header only.
     - 5 records export → 5 data rows.
     - JSON import valid (JSON.parse tidak throw).
   - **Audit Log Capture**: 3 actions (update user, change status PPDB, delete PPDB) → 3 audit rows.
   - **Notification Test**: 5+ different toasts muncul sesuai action.
   - **2FA Setup Flow**: Enable → verify OTP → confirm enabled → disable.
   - **Accessibility Basic Check**: Tab order nav (header → sidebar → main → footer), Enter submit forms, Esc close dialogs.
4. Performa: Lighthouse di dashboard admin (desktop mode) — FCP, LCP catat.

**Test Requirements (TR)**:
- **TR-14.1 (rule)**: `npm run lint` exit code 0, 0 error.
- **TR-14.2 (rule)**: `npm run build` exit code 0, build output folder `.next/` tergenerate.
- **TR-14.3 (rule)**: Role boundary test matrix — 6/6 test case PASS sesuai expected behavior.
- **TR-14.4 (rule)**: Audit log capture 3 actions → 3 distinct rows di AuditLog table.
- **TR-14.5 (rule)**: Lighthouse desktop ≥ 80 Performance score (catat score), ≥ 90 Accessibility score.
- **TR-14.6 (rubric)**: Production readiness overall. Skala 0-3, threshold ≥ 2. 0=banyak bug, 1=usable tapi ada minor, 2=production quality, 3=shippable tanpa catatan.
Evidence: Screenshot lint + build output, QA checklist table tertulis, Lighthouse score screenshot.

**Status**: pending  
**Completion Evidence**: —

---

## Total Task Summary

| ID | Task Name | Priority | Maps ke AC utama |
|---|---|---|---|
| 1 | Design System Upgrade | high | AC-01, AC-10, AC-13 |
| 2 | Shared UI Components (DataTable, Charts, Toast, Export, StatCard) | high | AC-04, AC-06 |
| 3 | Dashboard Shell v2 | high | AC-02, AC-05 |
| 4 | Dashboard Overview + Charts | high | AC-04 |
| 5 | Admin Shell + Multi-page Routing | high | AC-03 |
| 6 | Admin Overview Dashboard | medium | AC-03, AC-04 |
| 7 | Admin Users Management | high | AC-06, AC-14 |
| 8 | Admin PPDB Management | high | AC-06 |
| 9 | Audit Log (Schema + Helper + Page) | high | AC-07 |
| 10 | Roles & Permissions Page | medium | AC-08 |
| 11 | 2FA Auth UI + Backend Scaffold | medium | AC-09 |
| 12 | Toast Integration + Bell Panel | medium | AC-05 |
| 13 | Responsive Fixes & Animation Polish | medium | AC-10, AC-13 |
| 14 | Build/Lint Pass + Final QA Checklist | high | AC-11, AC-12, AC-14, AC-15 |
