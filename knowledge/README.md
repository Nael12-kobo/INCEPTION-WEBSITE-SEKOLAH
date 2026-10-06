# Knowledge — dataset jawaban AI

Folder ini adalah **sumber kebenaran** chatbot (`src/lib/gemini.ts` + `src/lib/knowledge.ts`).
AI hanya boleh menjawab dari file-file ini. Jika tidak ada di sini → katakan tidak tahu dan arahkan ke `/ppdb` atau kontak.

## File

| File                   | Topik           |
| ---------------------- | --------------- |
| `01-profil-sekolah.md` | Profil Sekolah  |
| `02-jurusan.md`        | Jurusan         |
| `03-fasilitas.md`      | Fasilitas       |
| `04-prestasi.md`       | Prestasi (rujukan ke berita) |
| `05-kegiatan.md`       | Kegiatan (rujukan ke berita) |
| `06-ppdb.md`           | PPDB            |
| `07-kontak.md`         | Kontak          |
| `08-berita.md`         | Berita          |

## Cara update

1. Edit file `.md` yang relevan, jangan edit jawaban AI di kode.
2. Perbarui tanggal `updated:` di frontmatter.
3. Cantumkan sumber kode di `source:` (mis. komponen yang diubah).
4. Fakta angka/tanggal/nama harus sama persis dengan UI situs.
5. Hal yang belum pasti tulis sebagai `Belum diumumkan — hubungi sekretariat`, jangan karang.

## Aturan anti-halusinasi

- Nomor pendaftaran, biaya exact, tanggal tes/penutupan: **jangan karang**.
- Alamat/telp kanonis hanya dari `07-kontak.md`.
- Jurusan otomotif selalu tulis **TKRO** (`TKR` hanya alias lama di database).
- Prestasi/kegiatan di luar `08-berita.md` = tidak terdata.
