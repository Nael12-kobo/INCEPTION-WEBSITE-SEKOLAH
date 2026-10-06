---
topic: kontak
keywords: kontak, alamat, telepon, telp, hp, whatsapp, wa, email, lokasi, maps, sekretariat, panitia, hubungi
updated: 2026-10-06
source:
  - src/app/ppdb/page.tsx
  - src/lib/ppdb.ts
  - src/components/Footer.tsx
---

# Kontak

## Fakta resmi (kanonis = versi halaman PPDB)

- Alamat: **Jl. Umbul Senjoyo I No. 3, Desa Bener, Kec. Tengaran, Kabupaten Semarang, Jawa Tengah**.
- Telepon: **(0298) 313040** (`tel:+62298313040`).
- WhatsApp admin PPDB: via tombol **"Chat WhatsApp PPDB" / "Tanya PPDB"** di halaman `/ppdb` (nomor dari env `PPDB_WA_NUMBER`, jangan karang nomornya — arahkan user klik tombol di situs).
- Email: **info@smktunasharapan.sch.id**.
- Halaman terkait: `/ppdb` (formulir + tombol WA), footer situs (info umum).

## Deprecated (jangan dipakai sebagai jawaban utama)

- `Jl. Telekomunikasi No. 1, Tunas Harapan` dan `(021) 555-0126` muncul di `Footer.tsx` / `Hero.tsx` sebagai teks dummy lama. Jangan jadikan jawaban kecuali user explicitly menanyakan teks itu.

## Jangan jawab / jangan karang

- Jangan karang nomor WA berupa angka, jam buka, atau akun media sosial spesifik (ikon medsos di footer hanya link `#beranda`, bukan akun resmi).
- Untuk pertanyaan di luar info di atas, arahkan datang langsung ke alamat kanonis atau klik tombol WA di `/ppdb`.
