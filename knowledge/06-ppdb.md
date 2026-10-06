---
topic: ppdb
keywords: ppdb, spmb, pendaftaran, daftar, gelombang, syarat, berkas, rapor, kk, akta, pas foto, tes, wawancara, daftar ulang, nomor pendaftaran, biaya, beasiswa, kuota, login, formulir
updated: 2026-10-06
source:
  - src/lib/ppdb.ts
  - src/app/ppdb/page.tsx
  - src/components/CtaPpdb.tsx
---

# PPDB

## Fakta resmi

- Tahun ajaran: **2026/2027**, fase: **Gelombang 1**.
- Kuota: **3 kelas per jurusan** (klaim situs). Pendaftar gelombang pertama berkesempatan **beasiswa + gratis biaya pendaftaran**.
- Beasiswa terdata: **SPP 1 tahun untuk 20 pendaftar gelombang pertama** berprestasi akademik/non-akademik (lihat `08-berita.md`). Jangan janjikan nominal lain.
- Wajib **login akun dulu** (`/auth/login?callbackUrl=/ppdb`), lalu isi formulir di `/ppdb`.
- Wajib pilih **2 jurusan berbeda** (pilihan 1 prioritas, pilihan 2 cadangan).
- Nomor pendaftaran otomatis dari server, format `PPDB-YYYY-NNNN` (mis. PPDB-2026-0007).
- Notifikasi & jadwal tes dikirim via **WhatsApp** ke nomor pendaftar (alternatif SMS).

## Alur (4 langkah)

1. Isi formulir online → dapat nomor pendaftaran.
2. Tunggu jadwal tes yang dikirim ke WhatsApp.
3. Datang ke sekolah bawa berkas asli.
4. Lengkapi daftar ulang dan biaya pendidikan.

## Syarat berkas

- Rapor, Kartu Keluarga (KK), akta kelahiran, pas foto.
- Isi sesuai akta kelahiran; usia umum SMK 15–18 tahun, validasi sistem 12–25 tahun.
- Formulir online hanya **bukti pendaftaran sementara** — daftar lengkap wajib diisi saat datang langsung.

## Aturan validasi penting

- Nama minimal 3 karakter, alamat minimal 10 karakter, email valid, No. WA minimal 9 digit.
- Jurusan kedua tidak boleh sama dengan pertama.

## Jangan jawab / jangan karang

- **Jangan karang** tanggal tes, biaya exact, tanggal penutupan gelombang, atau nomor pendaftaran contoh sebagai milik user.
- Jika ditanya hal yang tidak ada di atas, arahkan ke halaman `/ppdb` atau WhatsApp admin via `07-kontak.md`.
- Jangan pernah minta / bagikan kata sandi.
