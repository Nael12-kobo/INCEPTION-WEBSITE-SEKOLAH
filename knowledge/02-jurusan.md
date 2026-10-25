---
topic: jurusan
keywords: jurusan, program keahlian, kompetensi keahlian, dkv, pplg, tjkt, tkr, tkro, otomotif, desain, jaringan, software, gim, game, rpl, tkj, multimedia
updated: 2026-10-25
source:
  - src/lib/ppdb.ts
  - src/components/Jurusan.tsx
  - src/app/jurusan/page.tsx
---

# Jurusan

Sekolah memiliki **4 jurusan**. Nama kanonis memakai singkatan **TKRO** untuk otomotif.
Alias basis data lama **TKR = TKRO**, jangan anggap sebagai dua jurusan berbeda.

## 1. PPLG — Pengembangan Perangkat Lunak dan Gim

- Kode PPDB: `PPLG/RPL`.
- Fokus: pengembangan web, aplikasi mobile, basis data, integrasi layanan digital modern, pemrograman gim, UI/UX, cloud computing.
- Skill: Web & Mobile, Database, UI/UX.

## 2. TJKT — Teknik Jaringan Komputer dan Telekomunikasi

- Kode PPDB: `TJKT/TKJ`.
- Fokus: instalasi jaringan LAN/WAN, administrasi server, keamanan siber, cloud computing, fiber optik, Cisco/Mikrotik, Linux Server.
- Skill: Cisco & Mikrotik, Linux Server, Cyber Security.

## 3. DKV — Desain Komunikasi Visual

- Kode PPDB: `DKV/MM`.
- Fokus: teori warna, tipografi, software desain, ilustrasi digital, fotografi, videografi, motion graphics, branding, broadcasting.
- Skill: Fotografi, Videografi, Broadcasting, Ilustrasi Digital.

## 4. TKRO — Teknik Kendaraan Ringan Otomotif

- Kode PPDB: `TO/TKR` (kode lama memakai TKR, artinya sama dengan TKRO).
- Nama lengkap kanonis: **Teknik Kendaraan Ringan Otomotif** (varian "Teknik Otomotif Kendaraan Ringan" di lib PPDB artinya sama).
- Fokus: perawatan dan perbaikan kendaraan bermotor, sistem elektrik/kelistrikan, mekanik/mesin, diagnostik, teknologi EV.
- Skill: Perawatan, Perbaikan, Sistem Elektrik.

## Aturan PPDB terkait jurusan

- Setiap pendaftar wajib memilih **2 jurusan berbeda** (pilihan 1 = prioritas, pilihan 2 = cadangan).
- Kuota: **3 kelas per jurusan** (klaim situs di CTA PPDB).

## Panduan rekomendasi jurusan

Saat user bingung memilih, gunakan alur ini: **tanyakan minat dulu → cocokkan → rekomendasikan maksimal 2 jurusan + alasan singkat.**

| Minat / kebiasaan user | Jurusan yang cocok | Alasan singkat |
|---|---|---|
| Suka coding, bikin aplikasi/website, logika | **PPLG** | Fokus pemrograman web, mobile, database, gim |
| Suka utak-atik jaringan, Wi-Fi, server, komputer | **TJKT** | Fokus jaringan, server, keamanan siber, fiber optik |
| Suka menggambar, desain, foto/video, konten kreatif | **DKV** | Fokus desain grafis, ilustrasi, fotografi, video |
| Suka mobil/motor, bongkar-pasang mesin | **TKRO** | Fokus perawatan kendaraan, kelistrikan, diagnostik |

- Jika minat user ambigu atau dua bidang cocok → tawarkan **2 jurusan terdekat saja** dan bandingkan singkat (bukan keempatnya sekaligus).
- User boleh memilih 2 jurusan berbeda di PPDB (pilihan 1 prioritas, pilihan 2 cadangan) — sarankan kombinasi minat 1 + minat 2.
- Arahkan ke halaman `/jurusan` untuk detail tiap jurusan, atau `/ppdb` bila sudah ingin mendaftar.

## Jurusan tambahan (dikelola admin)

Selain 4 jurusan di atas, sekolah bisa menambah jurusan baru lewat Admin Panel → Program Keahlian (tersimpan di database, tampil di `/jurusan` dan homepage). Daftar paling lengkap selalu ada di halaman `/jurusan`. Kalau user menanyakan jurusan yang tidak tercantum di file ini, arahkan ke `/jurusan` — jangan mengarang nama, fokus, maupun prospek jurusan yang tidak ada datanya.

## Jangan jawab / jangan karang

- Jangan karang daya tampung angka pasti per kelas, biaya per jurusan, atau prospek gaji.
- Rekomendasi harus berdasar minat yang user sendiri sampaikan — jangan memaksakan jurusan tertentu.
