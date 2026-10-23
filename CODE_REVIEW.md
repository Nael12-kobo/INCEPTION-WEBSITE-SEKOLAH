# Code Review — 22 Okt 2026

Status: `tsc --noEmit` **clean** · `eslint` **6 errors, 17 warnings** · 198 file src.

Legenda severity: 🔴 CRITICAL · 🟠 HIGH · 🟡 MEDIUM · ⚪ LOW

---

## 0. Build / Lint errors (harus hijau)

| # | Severity | Lokasi | Masalah |
|---|---|---|---|
| L1 | 🟠 | `scripts/postinstall.js:1-2` | `require()` dilarang eslint (`no-require-imports`) — 2 error |
| L2 | 🟡 | `src/components/admin/admin-ppdb-client.tsx:183` | `setState` sinkron di dalam `useEffect` |
| L3 | 🟡 | `src/components/pplg-hero-decorations.tsx:78` | `setState` sinkron di dalam `useEffect` |
| L4 | 🟡 | `src/components/pplg-hero-decorations-buatmobile.tsx:78` | `setState` sinkron di dalam `useEffect` |
| L5 | 🟡 | `src/components/theme/theme-provider.tsx:63` | `setState` sinkron di dalam `useEffect` (baca `localStorage` saat mount) |
| L6 | ⚪ | 17 warnings | `window.location.assign()` (4×), unused vars (4×), `<img>` (1×), exhaustive-deps (1×) |

---

## 1. Desktop & Mobile — Responsiveness / Layout

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| 1 | 🟠 | `Navbar.tsx:34-35` | Copy mega-menu DKV & TKRO salah copy-paste: keduanya `"Fotografi, Videografi, "` (TKRO = otomotif, bukan fotografi) + koma menggantung |
| 2 | 🟠 | `Navbar.tsx:123,133,145` | Link hash telanjang `#fasilitas` / `#berita` / `#profil` **mati di semua halaman non-home** (`SiteChrome` me-render Navbar di `/jurusan/*`, `/sejarah`, `/guru-karyawan`, legal). Harusnya `/#fasilitas` |
| 3 | 🟡 | `dkv-hero-decorations.tsx:56-114,166` | ~20 elemen dekoratif **tidak di-gate breakpoint** — semua tayang di mobile 360px (PPLG/TJKT/TKRO sudah pakai `hidden md:block`) |
| 4 | 🟡 | `tjkt-hero-decorations.tsx:230-245` | Connection lines, network nodes, data packets tayang di mobile — hanya `SignalWave` & binary stream yang di-gate |
| 5 | 🟡 | `Footer.tsx:32-34` | Semua ikon sosial menuju `#beranda` dengan `aria-label` identik; `Footer` hanya ada di halaman home |
| 6 | ⚪ | `dkv-hero-decorations.tsx:89-98` | `transform: rotate(45deg)` inline ditimpa CSS animation `dkv-spin` yang menganimasikan `transform` — rotasi tidak pernah terpakai |
| 7 | ⚪ | `user-profile-client.tsx:273` | Baris tombol tanpa `flex-wrap` → overflow di 360px (pola di `account-section.tsx:107` sudah dokument risiko ini) |
| 8 | ⚪ | `tkro-hero-decorations-buatmobile.tsx:24-59,144-275` | Dead code: array `pistons`/`bolts`/`tachometerArcs` dikosongkan komentar, komponennya masih didefinisikan |

---

## 2. React correctness (hydration & state)

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| 9 | 🟠 | `dashboard/dashboard-shell.tsx:408-410` | `useState` initializer baca `window.location.hash` → **hydration mismatch** saat user masuk `/dashboard#...`. Init `""`, isi di effect `hashchange` yang sudah ada |
| 10 | 🟠 | `pplg-hero-decorations.tsx:95` (+ varian mobile) | `Math.random()` di `useState` init jalan saat SSR → mismatch pada label bahasa snippet. PRNG seeded `mulberry32(42)` sudah ditulis di baris 6-16 tapi **tidak pernah dipakai** (dead code) |
| 11 | 🟠 | `pplg-hero-decorations.tsx:137` + mobile:137 · `tkro-hero-decorations.tsx:289` + mobile:279 | Desktop & mobile variant **di-mount bersamaan** tapi menyuntik `<style>` dengan **id sama**; guard "pembuat pertama" + cleanup "siapa yang unmount menghapus" = race → style hilang (HMR/StrictMode) |
| 12 | 🟡 | `tjkt-hero-decorations.tsx:29-37` | Nama keyframe derived dari duration → dua packet `duration: 3` menghasilkan `@keyframes tjkt-packet-3` dobel, last-write-wins, satu packet jadi jalan di jalur yang salah |
| 13 | 🟡 | `admin/admin-client.tsx:160-228` | Edit PPDB = rantai 7× `window.prompt`/`alert` blocking; `res.json()` dipanggil tanpa cek body kosong → `Unexpected end of JSON input` |
| 14 | 🟡 | `admin/user-create-dialog.tsx:57-67` | `catch` menimpa field errors yang baru saja diset — closure `errors` stale (selalu snapshot `{}`), pesan per-field tidak pernah sampai UI |
| 15 | 🟡 | `chat/ChatBubblePanel.tsx` | Dead code — tidak pernah di-import di mana pun |
| 16 | 🟡 | `user-settings-client.tsx` / `admin-settings-client.tsx` | Dua file ~350 baris nyaris identik; prop `role` + import `formatRoleLabel` tak terpakai; setiap perbaikan harus dobel |
| 17 | 🟡 | `auth/register-form.tsx:136,154,171,187` · `reset-password-form.tsx:163,179` | Pesan error di-map keras ke satu key tanpa lihat error asli: password kosong → "minimal 8 karakter", email salah format → "wajib diisi". Ini juga yang dibacakan `aria-describedby` |
| 18 | 🟡 | `admin/academic-admin-client.tsx:484-494` | `handleDelete` tanpa try/catch & tanpa loading state → network error = unhandled rejection, baris diam |
| 19 | 🟡 | `chat/VrmViewer.tsx:128-143` | `setLoadingFrame` dipanggil tiap frame (~60 setState/detik → 60 re-render/detik saat model 17.5 MB load). Tulis hanya saat index berubah |
| 20 | ⚪ | `admin/admin-ppdb-client.tsx:589-598` | `filtered` dihitung ulang tiap render tanpa `useMemo` (padahal `admin-audit`/`admin-chat` sudah benar) |
| 21 | ⚪ | `dashboard/welcome-section.tsx:25-65`, `programs-section.tsx:47-66` | Agenda/pengumuman/berita hardcoded → bakal basi ("2 Okt 2026") & duplikat data home |
| 22 | ⚪ | `admin/admin-ppdb-client.tsx:649-744` | Optimistic update rollback pakai snapshot `prev` — dua mutasi overlap saling menimpa; gagal ditampilkan via `alert()` |
| 23 | ⚪ | `user/profile-shell.tsx:79-110` | `useMemo` bergantung `handleLogout` yang sudah tak terpakai (logout dikomentari) |
| 24 | ⚪ | `photo-upload.tsx:139`, `berkas-checklist.tsx:342`, `admin-ppdb-client.tsx:390`, `admin-users-client.tsx` | `<img>` mentah untuk foto ber-cookie sesi (terdokumentasi, tapi tanpa `loading="lazy"`) |

---

## 3. Accessibility

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| 25 | 🟠 | `ImageModal.tsx:33-84` | Modal custom ada `role="dialog"` + ESC tapi **tanpa focus trap, tanpa initial focus, tanpa restore fokus** ke pemicu saat tutup |
| 26 | 🟠 | `FasilitasVideoCard.tsx:375-382` | Overlay "klik untuk perbesar" = `<div onClick>` — tidak bisa difokus keyboard, tanpa role/nama aksesibel |
| 27 | 🟡 | `Footer.tsx:32-34` | Beberapa link punya `aria-label` identik → screen reader umumkan N link tak terbedakan |
| 28 | 🟡 | `admin-client.tsx:160-207`, `admin-ppdb-client.tsx:677-740`, `dashboard-shell.tsx:445`, `academic-admin-client.tsx:485` | Core workflow admin pakai `prompt`/`confirm`/`alert` blocking — tak bisa diterjemahkan, tak bisa distyle, bermasalah di webview mobile padahal `Dialog`+`toast` sudah tersedia |
| 29 | 🟡 | `admin/admin-ppdb-client.tsx:883-894` | `<select>` status tanpa `<label>`/`aria-label` — screen reader umumkan combo box tanpa nama per baris |
| 30 | 🟡 | `ui/sheet.tsx:53-56` | Tombol close: `focus:outline-none` tanpa `focus-visible` ring → fokus keyboard tak terlihat; teks sr-only "Close" (Inggris) di UI Indonesia |
| 31 | ⚪ | `ui/toast.tsx:222-230` | Region `aria-live` hanya dipasang saat toast pertama muncul (banyak SR tidak umumkan mutasi region baru) + dobel `role="status"` |
| 32 | ⚪ | `admin/user-edit-dialog.tsx:79-119` | id generik `name`/`email`/`role` (risiko duplikat), label Inggris ("Name"/"Cancel"/"Save Changes") di UI Indonesia, select role tampilkan enum mentah |
| 33 | ⚪ | `admin/academic-admin-client.tsx:652-714` | Form control custom tanpa `aria-invalid`/`aria-describedby` (padahal `auth/form-controls.tsx` sudah benar) |
| 34 | ⚪ | `chat/VrmViewer.tsx:880-884,888-906` | `<img>` bawa `alt` + `aria-label` (konflik); panel error menampilkan URL aset internal + pesan mentah ke user |
| 35 | ⚪ | `auth-brand-panel.tsx:87`, `profile-shell.tsx:302` | `new Date().getFullYear()` saat render client → tahun basi di HTML prerender + potensi mismatch |

---

## 4. Performance

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| 36 | 🟡 | `ImageModal.tsx:109-117` | Gambar modal pakai `priority` + `quality={100}` — eager fetch padahal overlay on-demand; `quality=100` hampir ganda byte vs default 75 |
| 37 | 🟡 | `FasilitasVideoCard.tsx` (video card) | `preload="auto"` pada 4 kartu → full scrub video ikut terunduh saat hydrate; pakai `preload="metadata"` + isi saat `pointerenter` |
| 38 | 🟡 | `chat/VrmViewer.tsx:55-58,878-887` | Spinner loading = sekuens **90 file PNG** diganti per-frame; pakai sprite `steps()` atau satu video loop |
| 39 | ⚪ | `student/student-academic.tsx` | Fetch seluruh schedule lalu filter client-side (tabel `min-w-[...]` di `overflow-x-auto` sudah benar — no issue) |

---

## 5. Security & API

Temuan positif: tidak ada SQL injection (Prisma semua, tanpa `$queryRaw`), endpoint data user konsisten di-scope `session.user.id` (IDOR klasik aman), reset token di-hash, upload di-sniff magic number, `forgot-password` tahan host-header poisoning, `.env` tidak bocor ke git.

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| S1 | 🟠 | `api/tts/route.ts:7-31` | **TTS tanpa auth & tanpa rate limit** — `/api/chat` dapat 20/menit, TTS nihil. Script anonim bisa habiskan kuota Fish Audio berbayar (5000 char/request) |
| S2 | 🟠 | `lib/auth.ts:32,48` | `allowDangerousEmailAccountLinking: true` di Google **dan GitHub** — email GitHub bisa tak terverifikasi → attacker dapat session akun sekolah korban tanpa password |
| S3 | 🟡 | `lib/rate-limit.ts:77-90` | Key rate-limit dibangun dari header spoofable; fallback `x-forwarded-host` bukan IP — kirim header unik per request = bypass limit login brute-force, register, forgot-password, chat |
| S4 | 🟡 | `api/ppdb/route.ts:67-90,187-197` | `/api/ppdb` tanpa rate limit; branch re-submit kirim ulang email ke alamat user-controlled → email/WA bombing; WhatsApp dikirim ke `draft.phone` apa pun |
| S5 | 🟡 | `api/account/route.ts:57-71` | Ganti email tanpa password untuk user OAuth (password-less) — sesi curian bisa alihkan email akun diam-diam |
| S6 | 🟡 | `api/reset-password/route.ts:60-66` · `lib/reset-token.ts:55-62` | Reset tidak mencabut token lain & tidak mematikan sesi lama — link reset curian tetap hidup 1 jam setelah ganti password; tidak ada audit |
| S7 | 🟡 | `api/register/route.ts:93-102` | 409 "Email sudah terdaftar" = enumeration, bertentangan dengan `forgot-password` yang sengaja generic 200 |
| S8 | 🟡 | `api/account/documents/route.ts:131-146`, `api/account/photo/route.ts:65-122` | Upload tanpa rate limit & tanpa kuota byte per user (12 × 5 MB × 4 jenis) → bloat DB `bytea` |
| S9 | 🟡 | `api/admin/users/[id]/route.ts:49-51` | PATCH terima `name`/`email` tanpa validasi & tanpa lowercase — admin bisa set `SOME@Example.COM` sehingga user tak bisa login/reset selamanya |
| S10 | ⚪ | `api/account/route.ts:145-153` | Tebak `currentPassword` tanpa batas (bcrypt-12 per request) — tanpa rate limit |
| S11 | ⚪ | `api/chat/feedback/route.ts:67` | IP guest disimpan permanen; dedup `@@unique([messageId, ip])` bisa di-bypass banyak IP |
| S12 | ⚪ | `lib/impersonation.ts:47-54` | Token impersonasi tanpa klaim `name`/`email` → audit & UI header terdegradasi diam-diam |
| S13 | ⚪ | `lib/auth.ts:19` | `trustHost: true` mutlak — perlu untuk Vercel, matikan validasi host saat self-host |
| S14 | ⚪ | `lib/auth.ts:206-210` | Sesi JWT user terhapus tetap hidup — kontradiksi komentar `impersonation.ts:10-11`; endpoint yang percaya hanya `session.user.id` tetap dilayani (write akhirnya 500) |
| S15 | ⚪ | `prisma/schema.prisma:16` | `User.email` nullable + unique case-sensitive → akun OAuth `Foo@x.com` tak bisa ditemukan flow email (semua lookup di-lowercase) |

---

## 6. Correctness API

| # | Sev | Lokasi | Masalah |
|---|---|---|---|
| C1 | 🟡 | `api/ppdb/route.ts:121-167` · `lib/ppdb.ts:257-259` | `registrationNo` dari `count()` — setelah admin hapus pendaftaran, nomor dipakai ulang; >5 tabrakan = kuota retry habis → **500 padahal form valid** |
| C2 | 🟡 | `api/ppdb/route.ts:154-166` | Double-submit user sama: P2002 `userId` tak dibedakan dari tabrakan `registrationNo` → retry 5× percuma lalu 500, seharusnya 200 `alreadyRegistered` |
| C3 | 🟡 | `api/ppdb/route.ts:199-204` | Update `waSentAt` pasca-create di luar try/catch — DB hiccup sesaat → client 500 padahal pendaftaran tersimpan |
| C4 | 🟡 | `api/account/documents/route.ts:131-146` | Race count-then-create → user bisa lewati `PPDB_DOC_MAX_PER_KIND` (schema tanpa constraint) |
| C5 | ⚪ | `api/chat/route.ts:128-143` | Merge percakapan = read-modify-write → update paralel saling hilang (lost update) |
| C6 | ⚪ | `lib/academic-server.ts:283-306` | `deleteAcademic` catch telanjang → semua error (koneksi/FK) dilaporkan 404, audit dilewati |
| C7 | ⚪ | `api/admin/users/[id]/route.ts:90-93` | Email duplikat → 500 (harus 409); update dipanggil walau `updateData` `{}` |
| C8 | ⚪ | `api/admin/users/route.ts:167-171` | Destructuring body tanpa guard → body `null` jadi 500, bukan 400 |
| C9 | ⚪ | `api/reset-password/route.ts:60-73` | Akun sudah hilang → P2025 muncul sebagai 500, token tak pernah terkonsumsi |
| C10 | ⚪ | `api/admin/ppdb/route.ts:9-11` (+2 sejenis) | Role gagal selalu 401, beda dengan `admin/users` yang benar 401/403 — klien tak bisa beda "belum login" vs "kurang hak" |
| C11 | ⚪ | `api/admin/users/[id]/photo/route.ts:40-48`, `api/admin/ppdb/documents/[id]/route.ts:41-49` | Handler download tanpa try/catch → 500 framework tanpa JSON terstruktur |
| C12 | ⚪ | `api/admin/ppdb/[id]/route.ts:121,160-173` | Email tak dinormalisasi + update registration & user tanpa transaksi → crash di tengah = REGISTERED dengan `emailVerified` null |
| C13 | ⚪ | lint lintas endpoint | Validasi tak konsisten: nama min 2 (register) vs 3 (admin/account); password max 72 ada di register/account tapi **tidak di reset-password**; 3 kebijakan `emailVerified` berbeda |
| C14 | ⚪ | beberapa route | Gap audit: hapus dokumen siswa, DELETE reviews, reset password — tidak dicatat; list admin tanpa pagination (`findMany` tanpa `take`) |
| C15 | ⚪ | `lib/impersonation.ts:17-31` | Nama cookie & flag bergantung `NODE_ENV` saat request — bisa divergen dari yang dibaca Auth.js |
| C16 | ⚪ | `api/chat/route.ts:193-201` | `role` diambil dari client → user bisa menanam pesan "assistant" palsu di histori & konteks model |
| C17 | ⚪ | lint lintas endpoint | Envelope error tak seragam: `{ message }` (register/account/ppdb/chat) vs `{ error }` (semua admin) |

---

## Catatan positif

- `SiteChrome.tsx:10-13` — `dynamic(ChatBubble, { ssr: false })` dokument TTI optimization yang benar.
- `HomeBackdrop.tsx:18-29` — orb `blur-3xl` GPU-heavy dimatikan di layar kecil (`max-sm:[animation:none]`).
- Hooks `useIsDesktop`/`usePresence`/`useAnimeReveal` aman hydration; animasi hormati `prefers-reduced-motion` & cleanup `IntersectionObserver`.
- `auth/form-controls.tsx` — `aria-invalid`/`aria-describedby` + `text-base` 16px anti-zoom iOS (jadi acuan untuk form admin).
- Tabel student pakai `min-w-[...]` dalam `overflow-x-auto` — pola responsif yang benar.
- Rate limit login/register/forgot/chat ada; reset token di-hash; upload sniff magic number.
