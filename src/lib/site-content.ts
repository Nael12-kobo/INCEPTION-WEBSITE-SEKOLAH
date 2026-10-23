/**
 * Sumber kebenaran konten statis portal sekolah: agenda terdekat, pengumuman
 * pekan ini, dan berita (juga dipakai sebagai fallback homepage bila API
 * berita tidak terjangkau). Satu modul supaya data tidak duplikat/basi di
 * banyak komponen (welcome-section, dashboard-overview, programs-section,
 * Berita).
 */

export type SiteAgenda = {
  tanggal: string;
  bulan: string;
  judul: string;
  tempat: string;
};

export const agenda: SiteAgenda[] = [
  {
    tanggal: "2 Okt",
    bulan: "2026",
    judul: "Ujian Tengah Semester (UTS)",
    tempat: "Seluruh ruang kelas",
  },
  {
    tanggal: "8 Okt",
    bulan: "2026",
    judul: "Job Fair & rekrutmen mitra industri",
    tempat: "Aula lantai 2",
  },
  {
    tanggal: "15 Okt",
    bulan: "2026",
    judul: "Pekan Literasi Digital",
    tempat: "Perpustakaan & lab komputer",
  },
  {
    tanggal: "24 Okt",
    bulan: "2026",
    judul: "Study tour ke Balai TELKOM",
    tempat: "Kelas XI semua jurusan",
  },
];

export type SitePengumuman = {
  judul: string;
  badge: string;
};

export const pengumuman: SitePengumuman[] = [
  {
    judul: "Pengisian KIP Kuliah gelombang 2 dibuka s.d. 10 Okt",
    badge: "Akademik",
  },
  {
    judul: "Wajib lapor wali kelas untuk rencana magang semester depan",
    badge: "Magang",
  },
  {
    judul: "Jadwal piket lab fiber optik diperbarui — cek papan informasi",
    badge: "Fasilitas",
  },
];

export type SiteBerita = {
  kategori: string;
  tanggal: string;
  judul: string;
  desc: string;
};

export const berita: SiteBerita[] = [
  {
    kategori: "Prestasi",
    tanggal: "12 Sep 2026",
    judul: "Siswa TJKT juara 1 lomba jaringan tingkat provinsi",
    desc: "Tim network school mengalahkan 24 sekolah dalam kompetisi konfigurasi jaringan dan keamanan server.",
  },
  {
    kategori: "Kegiatan",
    tanggal: "28 Agu 2026",
    judul: "Penandatanganan MoU magang dengan 3 perusahaan telekomunikasi",
    desc: "Kerja sama pemagangan dan rekrutmen langsung untuk siswa kelas XI dan XII semua jurusan.",
  },
  {
    kategori: "PPDB",
    tanggal: "10 Agu 2026",
    judul: "Beasiswa penuh bagi 20 pendaftar gelombang pertama",
    desc: "Beasiswa SPP satu tahun untuk calon siswa berprestasi akademik dan non-akademik.",
  },
];
