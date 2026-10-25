/**
 * Konten halaman publik yang bisa diedit dari Admin Panel (CMS ringan).
 *
 * Setiap bagian halaman punya satu "key" (`hero`, `statistik`, `profil`,
 * `fasilitas`, `ppdb-cta`, `guru`) yang disimpan sebagai satu baris Json di
 * tabel `site_contents`. Nilai DEFAULT di file ini adalah teks yang dulu
 * hardcode di komponen — dipakai kalau:
 *   1. baris belum pernah disimpan admin (belum ada perubahan), atau
 *   2. data di DB gagal dibaca / tidak lolos validasi.
 *
 * Karena itu halaman publik tidak pernah kosong/gagal render walau DB kosong.
 *
 * File ini murni data + utilitas (tanpa akses DB) sehingga aman diimpor dari
 * komponen client maupun server. Normalisasi menerima objek KASAR dari form
 * admin (boleh berupa textarea multi-baris) dan selalu menghasilkan bentuk
 * yang rapi & tervalidasi.
 */

import {
  Award,
  BookOpen,
  Building2,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  GraduationCap,
  PhoneCall,
  Trophy,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { SUPPORT_IG_URL } from "@/lib/support";
import { guruKaryawan as GURU_BAWAAN, type GuruKaryawan } from "@/lib/guru-karyawan";

/* ------------------------------------------------------------------ */
/* Tipe konten per bagian                                              */
/* ------------------------------------------------------------------ */

export type TombolKonten = { label: string; href: string };

/** Section hero homepage (badge, judul 2 baris, CTA, chip, kartu melayang). */
export type HeroKonten = {
  badge: string;
  /** Baris judul pertama (dibuat per-huruf untuk animasi). */
  judulAtas: string;
  /** Baris judul kedua — diberi warna gradien. */
  judulBawah: string;
  deskripsi: string;
  cta1: TombolKonten;
  cta2: TombolKonten;
  /** Chip kecil di bawah CTA, mis. ["A", "Akreditasi Sekolah"]. */
  chips: Array<{ nilai: string; label: string }>;
  /** Kartu statistik melayang di kolom gambar. */
  kartu: Array<{ nilai: string; label: string }>;
};

export type StatistikItem = {
  /** Kunci ikon lucide — daftarnya di IKON_STATISTIK. */
  ikon: string;
  /** Angka yang dihitung naik saat masuk viewport. */
  nilai: number;
  /** Suffix tampilan, mis. "+". */
  suffix: string;
  label: string;
};

export type StatistikKonten = { items: StatistikItem[] };

export type ProfilTestimoni = {
  teks: string;
  nama: string;
  peran: string;
  /** Path foto lokal ("/agil.jpg") atau URL https. */
  foto: string;
};

export type ProfilKonten = {
  badge: string;
  /** Judul sebelum bagian yang diberi warna gradien. */
  judulAwal: string;
  /** Bagian judul yang diberi warna gradien. */
  judulAccent: string;
  paragraf: string;
  /** Poin visi-misi (list bercentang). */
  poin: string[];
  testimoni: ProfilTestimoni;
};

export type FasilitasTab = {
  /** Kunci tab — dipertahankan supaya state tab yang aktif tidak hilang. */
  id: string;
  label: string;
  /** Kunci ikon lucide — daftarnya di IKON_FASILITAS. */
  ikon: string;
  judul: string;
  deskripsi: string;
  items: string[];
};

export type FasilitasItem = {
  /** Klip WebM di /public/animated/facility/. */
  src: string;
  /** Foto poster JPG (juga fallback kalau video gagal). */
  poster: string;
  label: string;
  alt: string;
  deskripsi: string;
  /** Patokan detik timeline untuk cursor kiri/tengah/kanan. */
  xmin: number;
  xmid: number;
  xmax: number;
};

export type FasilitasKonten = {
  badge: string;
  judul: string;
  tabs: FasilitasTab[];
  galeri: FasilitasItem[];
};

export type PpdbCtaKonten = {
  /** Teks kecil huruf besar di atas judul. */
  eyebrow: string;
  judul: string;
  deskripsi: string;
  cta1: TombolKonten;
  cta2: TombolKonten;
  /** Langkah PPDB — ikon tiap langkah mengikuti urutan (tidak bisa diubah). */
  langkah: Array<{ judul: string; deskripsi: string }>;
};

export type GuruKonten = {
  badge: string;
  judul: string;
  /** Pakai `{jumlah}` sebagai placeholder jumlah orang. */
  deskripsi: string;
  daftar: GuruKaryawan[];
};

export type PortalAgenda = { tanggal: string; bulan: string; judul: string; tempat: string };
export type PortalPengumuman = { judul: string; badge: string };
export type PortalSiswaKonten = {
  semester: string;
  deskripsiSapaan: string;
  agendaJudul: string;
  agendaDeskripsi: string;
  agendaBulan: string;
  agenda: PortalAgenda[];
  pengumumanJudul: string;
  pengumumanDeskripsi: string;
  pengumumanFooter: string;
  pengumuman: PortalPengumuman[];
};

export type SejarahMilestone = { period: string; title: string; desc: string };
export type SejarahGalleryItem = { src: string; alt: string };
export type SejarahKonten = {
  badge: string;
  judul: string;
  deskripsi: string;
  latarBelakang: string[];
  milestones: SejarahMilestone[];
  gallery: SejarahGalleryItem[];
};

export type PpdbInfoKonten = {
  alamat: string;
  telepon: string;
  langkah: string[];
  catatan: string[];
  kontakTambahan: string;
};

/** Bentuk lengkap semua bagian konten, dipakai sebagai map default. */
export type SiteContentMap = {
  hero: HeroKonten;
  statistik: StatistikKonten;
  profil: ProfilKonten;
  fasilitas: FasilitasKonten;
  "ppdb-cta": PpdbCtaKonten;
  guru: GuruKonten;
  "portal-siswa": PortalSiswaKonten;
  sejarah: SejarahKonten;
  "ppdb-info": PpdbInfoKonten;
};

export type SiteContentKey = keyof SiteContentMap;

export const SITE_CONTENT_KEYS: SiteContentKey[] = [
  "hero",
  "statistik",
  "profil",
  "fasilitas",
  "ppdb-cta",
  "guru",
  "portal-siswa",
  "sejarah",
  "ppdb-info",
];

/** Label admin + penjelasan singkat per bagian. */
export const SITE_CONTENT_SECTIONS: Array<{
  key: SiteContentKey;
  label: string;
  deskripsi: string;
}> = [
  {
    key: "hero",
    label: "Hero Beranda",
    deskripsi: "Badge PPDB, judul utama, deskripsi, tombol, dan chip statistik.",
  },
  {
    key: "statistik",
    label: "Statistik",
    deskripsi: "Angka siswa, guru, mitra industri, dan alumni.",
  },
  {
    key: "profil",
    label: "Profil & Visi Misi",
    deskripsi: "Ringkasan sekolah, poin visi-misi, dan testimoni alumni.",
  },
  {
    key: "fasilitas",
    label: "Fasilitas & Ekskul",
    deskripsi: "Judul section, isi tiap tab, dan galeri video fasilitas.",
  },
  {
    key: "ppdb-cta",
    label: "Ajakan PPDB",
    deskripsi: "Banner PPDB di beranda beserta langkah pendaftarannya.",
  },
  {
    key: "guru",
    label: "Guru & Karyawan",
    deskripsi: "Judul halaman dan daftar foto tenaga pendidik.",
  },
  {
    key: "portal-siswa",
    label: "Portal Siswa",
    deskripsi: "Agenda terdekat, pengumuman, label semester, dan teks informasi di dashboard siswa.",
  },
  {
    key: "sejarah",
    label: "Sejarah Sekolah",
    deskripsi: "Judul, pengantar, latar belakang, linimasa, dan foto dokumentasi sejarah.",
  },
  {
    key: "ppdb-info",
    label: "Informasi PPDB",
    deskripsi: "Alamat/telepon dan informasi alur pendaftaran pada halaman PPDB.",
  },
];

/* ------------------------------------------------------------------ */
/* Ikon yang bisa dipilih admin                                        */
/* ------------------------------------------------------------------ */

/** Ikon untuk kartu statistik beranda. */
export const IKON_STATISTIK: Record<string, LucideIcon> = {
  Users,
  GraduationCap,
  Building2,
  Award,
  BookOpen,
  Trophy,
  Wifi,
  ClipboardList,
};

export const IKON_STATISTIK_KEYS = Object.keys(IKON_STATISTIK);

/** Ikon tab fasilitas. */
export const IKON_FASILITAS: Record<string, LucideIcon> = {
  FlaskConical,
  Wifi,
  Trophy,
  BookOpen,
  Users,
  Building2,
  Award,
  GraduationCap,
};

export const IKON_FASILITAS_KEYS = Object.keys(IKON_FASILITAS);

/** Ikon langkah PPDB — mengikuti urutan array, tidak bisa dipilih admin. */
export const IKON_LANGKAH_PPDB = [ClipboardList, FileCheck2, PhoneCall];

/* ------------------------------------------------------------------ */
/* Nilai default — persis teks yang dulu ada di komponen               */
/* ------------------------------------------------------------------ */

const TABS_BAWAAN: FasilitasTab[] = [
  {
    id: "lab",
    label: "Lab & Praktik",
    ikon: "FlaskConical",
    judul: "Laboratorium praktik industri",
    deskripsi: "Belajar langsung dengan perangkat standar industri telekomunikasi.",
    items: [
      "Lab fiber optik & splicing",
      "Lab jaringan Cisco/Mikrotik",
      "Lab komputer & server",
      "Bengkel instalasi telekomunikasi",
      "Ruang praktik 5G & radio",
      "Lab elektronika dasar",
    ],
  },
  {
    id: "digital",
    label: "Fasilitas Digital",
    ikon: "Wifi",
    judul: "Kampus terkoneksi penuh",
    deskripsi: "Internet cepat dan sistem informasi akademik yang modern.",
    items: [
      "WiFi kampus 1 Gbps",
      "E-learning & kelas digital",
      "Perpustakaan digital",
      "Sistem informasi akademik online",
      "Ruang multimedia",
      "Area co-working siswa",
    ],
  },
  {
    id: "ekskul",
    label: "Ekstrakurikuler",
    ikon: "Trophy",
    judul: "Kembangkan bakat non-akademik",
    deskripsi: "Wadah minat, bakat, dan kepemimpinan siswa.",
    items: [
      "Robotik & IoT club",
      "E-sport & game development",
      "Pramuka & Paskibra",
      "Futsal & basket",
      "Rohis & paduan suara",
      "Jurnalistik & fotografi",
    ],
  },
  {
    id: "akademik",
    label: "Penunjang Akademik",
    ikon: "BookOpen",
    judul: "Pendukung prestasi",
    deskripsi: "Fasilitas yang menunjang kenyamanan belajar.",
    items: [
      "Perpustakaan & ruang baca",
      "Ruang bimbingan konseling",
      "Unit kesehatan sekolah",
      "Musholla & aula",
      "Kantin sehat",
      "Bursa kerja khusus (BKK)",
    ],
  },
];

const GALERI_BAWAAN: FasilitasItem[] = [
  {
    src: "/animated/facility/perpustakaan.webm",
    poster: "/images/fasilitas/perpustakaan.jpg",
    label: "Perpustakaan",
    alt: "Perpustakaan SMK Telekomunikasi Tunas Harapan",
    deskripsi:
      "Perpustakaan yang menyediakan berbagai jurnal,  dan fasilitas baca yang nyaman untuk mendukung kegiatan belajar siswa.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tefa.webm",
    poster: "/images/fasilitas/tefa.jpg",
    label: "Teaching Factory",
    alt: "Teaching Factory (TEFA)",
    deskripsi:
      "Teaching Factory sebagai tempat praktik kerja nyata yang mensimulasikan lingkungan industri telekomunikasi.",
    xmin: 2.9,
    xmid: 1.5,
    xmax: 0,
  },
  {
    src: "/animated/facility/gedung-tkj.webm",
    poster: "/images/fasilitas/gedung-tkj.jpg",
    label: "Gedung TKJ",
    alt: "Gedung Teknik Komputer dan Jaringan",
    deskripsi:
      "Gedung khusus untuk program keahlian Teknik Komputer dan Jaringan dengan peralatan modern.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkj-lab.webm",
    poster: "/images/fasilitas/tkj-lab.jpg",
    label: "Lab TKJ",
    alt: "Laboratorium Teknik Komputer dan Jaringan",
    deskripsi:
      "Laboratorium TKJ dilengkapi dengan perangkat jaringan Cisco, Mikrotik, dan server untuk praktik konfigurasi jaringan.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkro-1.webm",
    poster: "/images/fasilitas/tkro-1.jpg",
    label: "Bengkel TKRO 1",
    alt: "Bengkel Teknik Kendaraan Ringan Otomotif",
    deskripsi:
      "Bengkel TKRO dengan peralatan standar industri untuk praktik perbaikan kendaraan ringan.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkro-2.webm",
    poster: "/images/fasilitas/tkro-2.jpg",
    label: "Bengkel TKRO 2",
    alt: "Bengkel Teknik Kendaraan Ringan Otomotif",
    deskripsi:
      "Bengkel TKRO 2 sebagai pelengkap fasilitas praktik untuk menampung lebih banyak siswa.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/uks.webm",
    poster: "/images/fasilitas/uks.jpg",
    label: "UKS",
    alt: "Unit Kesehatan Sekolah",
    deskripsi:
      "Unit Kesehatan Sekolah yang siap melayani siswa untuk pertolongan pertama dan pemeriksaan kesehatan dasar.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/humas.webm",
    poster: "/images/fasilitas/humas.jpg",
    label: "Humas",
    alt: "Unit Humas Sekolah",
    deskripsi:
      "Unit Humas Sekolah yang bertugas dalam komunikasi dan promosi kegiatan sekolah.",
    xmin: 1.4,
    xmid: 0.9,
    xmax: 0,
  },
  {
    src: "/animated/facility/dak.webm",
    poster: "/images/fasilitas/dak.jpg",
    label: "DAK",
    alt: "Ruang DAK sekolah",
    deskripsi:
      "Ruang DAK yang difungsikan sebagai ruang belajar pada jurusan DKV atau Multi Media di lengkapi dengan fasilitas multimedia yang lengkap.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-2.webm",
    poster: "/images/fasilitas/dak-2.jpg",
    label: "DAK 2",
    alt: "Ruang DAK sekolah",
    deskripsi:
      "Ruang DAK 2 sebagai ruang belajar tambahan dengan desain modern untuk mendukung pembelajaran berbasis teknologi.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-3.webm",
    poster: "/images/fasilitas/dak-3.jpg",
    label: "DAK 3",
    alt: "Ruang DAK sekolah",
    deskripsi: "Ruang DAK 3  sebagai ruang belajar tambahan yang dilengkapi dengan AC dan proyektor.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-studio.webm",
    poster: "/images/fasilitas/dak-studio.jpg",
    label: "DAK Studio",
    alt: "Studio DAK sekolah",
    deskripsi:
      "Studio DAK yang difungsikan sebagai ruang produksi multimedia dan studio rekaman untuk kegiatan sekolah.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
];

/** Semua nilai default, disalin dari komponen masing-masing. */
export const SITE_CONTENT_DEFAULTS: SiteContentMap = {
  hero: {
    badge: "PPDB Tahun Ajaran 2026/2027 Telah Dibuka",
    judulAtas: "SMK Telekomunikasi ",
    judulBawah: "Tunas Harapan",
    deskripsi:
      "Sekolah vokasi modern di bidang telekomunikasi, jaringan komputer, dan teknologi digital — mencetak lulusan siap kerja, siap kuliah, dan siap berwirausaha.",
    cta1: { label: "Daftar PPDB", href: "#ppdb" },
    cta2: { label: "Jelajahi Jurusan", href: "#jurusan" },
    chips: [
      { nilai: "A", label: "Akreditasi Sekolah" },
      { nilai: "12+", label: "Mitra Industri" },
      { nilai: "100%", label: "Praktik & Magang" },
    ],
    kartu: [
      { nilai: "911+", label: "Siswa aktif" },
      { nilai: "96%", label: "Lulusan terserap" },
    ],
  },
  statistik: {
    items: [
      { ikon: "Users", nilai: 911, suffix: "+", label: "Siswa Aktif" },
      { ikon: "GraduationCap", nilai: 67, suffix: "", label: "Guru & Tendik" },
      { ikon: "Building2", nilai: 12, suffix: "+", label: "Mitra Industri" },
      { ikon: "Award", nilai: 4530, suffix: "+", label: "Alumni" },
    ],
  },
  profil: {
    badge: "Profil Sekolah",
    judulAwal: "Mencetak talenta digital yang",
    judulAccent: "kompeten & berkarakter",
    paragraf:
      "SMK Telekomunikasi Tunas Harapan adalah sekolah menengah kejuruan yang fokus pada bidang telekomunikasi, jaringan komputer, dan pengembangan perangkat lunak. Pembelajaran memadukan teori, praktik laboratorium, sertifikasi industri, dan magang di perusahaan mitra.",
    poin: [
      "Unggul dalam teknologi telekomunikasi dan informatika",
      "Berkarakter, disiplin, dan berakhlak mulia",
      "Siap kerja, siap kuliah, siap berwirausaha",
    ],
    testimoni: {
      teks:
        "“ Di SMK Telekomunikasi Tunas Harapan saya dibimbing menjadi yang terbaik di bidang Komputer Jaringan, dengan Guru yang berintegrasi tinggi dan sudah bersertifikasi Cisco saya dapat dengan mudah memahami apa yang di sampaikan, serta fasilitasnya pun mendukung selama pembelajaran. Oleh karena itu membuat saya siap dan percaya diri untuk bersaing dengan Lulusan SMK lain. Saat saya lulus saya langsung diterima di Perusahaan Hosting Terbesar di Jakarta. Dan saat ini saya bekerja sebagai IT Senior Network & Infrastruktur di Transcosmos Indonesia site Semarang ”",
      nama: "Visentius Agiola Stanlay",
      peran: "IT Senior Network & Infrastruktur",
      foto: "/agil.jpg",
    },
  },
  fasilitas: {
    badge: "Fasilitas & Ekskul",
    judul: "Sarana lengkap untuk belajar maksimal",
    tabs: TABS_BAWAAN,
    galeri: GALERI_BAWAAN,
  },
  "ppdb-cta": {
    eyebrow: "PPDB 2026/2027",
    judul: "Amankan kursimu di SMK Telekomunikasi Tunas Harapan",
    deskripsi:
      "Kuota terbatas 3 kelas per jurusan. Pendaftar gelombang pertama berkesempatan mendapat beasiswa dan gratis biaya pendaftaran.",
    cta1: { label: "Isi Formulir PPDB", href: "/ppdb" },
    cta2: { label: "Hubungi Panitia", href: SUPPORT_IG_URL },
    langkah: [
      { judul: "Isi formulir", deskripsi: "Online atau langsung ke sekretariat PPDB." },
      { judul: "Verifikasi berkas", deskripsi: "Rapor, KK, akta, dan pas foto." },
      { judul: "Wawancara & daftar ulang", deskripsi: "Tes minat bakat + konfirmasi." },
    ],
  },
  guru: {
    badge: "Tenaga Pendidik",
    judul: "Guru & Karyawan",
    deskripsi:
      "{jumlah} tenaga pendidik dan kependidikan SMK Telekomunikasi Tunas Harapan — mendampingi siswa di kelas, laboratorium, dan kegiatan sekolah.",
    daftar: GURU_BAWAAN,
  },
  "portal-siswa": {
    semester: "Semester ganjil 2026/2027",
    deskripsiSapaan:
      "Semua kebutuhan sekolah Anda dalam satu tempat — jadwal, pengumuman, hingga informasi PPDB. Silakan jelajahi menu di sisi kiri.",
    agendaJudul: "Agenda Terdekat",
    agendaDeskripsi: "Empat kegiatan terjadwal berikutnya.",
    agendaBulan: "Oktober",
    agenda: [
      { tanggal: "2 Okt", bulan: "2026", judul: "Ujian Tengah Semester (UTS)", tempat: "Seluruh ruang kelas" },
      { tanggal: "8 Okt", bulan: "2026", judul: "Job Fair & rekrutmen mitra industri", tempat: "Aula lantai 2" },
      { tanggal: "15 Okt", bulan: "2026", judul: "Pekan Literasi Digital", tempat: "Perpustakaan & lab komputer" },
      { tanggal: "24 Okt", bulan: "2026", judul: "Study tour ke Balai TELKOM", tempat: "Kelas XI semua jurusan" },
    ],
    pengumumanJudul: "Pengumuman",
    pengumumanDeskripsi: "Info penting pekan ini.",
    pengumumanFooter: "Diperbarui oleh bagian kesiswaan",
    pengumuman: [
      { judul: "Pengisian KIP Kuliah gelombang 2 dibuka s.d. 10 Okt", badge: "Akademik" },
      { judul: "Wajib lapor wali kelas untuk rencana magang semester depan", badge: "Magang" },
      { judul: "Jadwal piket lab fiber optik diperbarui — cek papan informasi", badge: "Fasilitas" },
    ],
  },
  sejarah: {
    badge: "Profil Sekolah",
    judul: "Sejarah Sekolah",
    deskripsi: "Berdiri sejak 27 Februari 2001 — berakar dari sejarah, beradaptasi dengan zaman, dan bergerak menuju masa depan.",
    latarBelakang: [
      "SMK Telekomunikasi Tunas Harapan Kabupaten Semarang lahir dari sebuah gagasan untuk menjawab tantangan perkembangan teknologi dan kebutuhan dunia industri terhadap sumber daya manusia yang terampil, adaptif, dan siap kerja. Gagasan tersebut diwujudkan oleh Yayasan Tunas Harapan Kabupaten Semarang dengan mendirikan SMK Telekomunikasi Tunas Harapan yang secara resmi berdiri pada 27 Februari 2001, berdasarkan SK Kepala Kantor Wilayah Departemen Pendidikan dan Kebudayaan Provinsi Jawa Tengah Nomor 1315/I03.08/MN/2001. Pada awal berdirinya, sekolah ini hanya memiliki satu Program Keahlian, yaitu Teknik Informatika, sebagai bentuk keberanian untuk memasuki era teknologi informasi yang saat itu sedang berkembang pesat.",
      "Seiring perjalanan waktu, kebutuhan dunia industri terus berubah dan berkembang. SMK Telekomunikasi Tunas Harapan pun memilih untuk terus beradaptasi. Berdasarkan perkembangan kebutuhan pasar industri dan kurikulum yang berlaku, sekolah membuka program keahlian baru, yaitu Teknik Elektronika Komunikasi dan Teknik Otomotif berdasarkan Kurikulum 1999.",
    ],
    milestones: [
      { period: "27 Februari 2001", title: "Berdiri resmi", desc: "Didirikan oleh Yayasan Tunas Harapan Kabupaten Semarang berdasarkan SK Kepala Kantor Wilayah Departemen Pendidikan dan Kebudayaan Provinsi Jawa Tengah Nomor 1315/I03.08/MN/2001 — dengan satu Program Keahlian: Teknik Informatika." },
      { period: "Perkembangan kurikulum", title: "Perluasan program keahlian", desc: "Mengikuti kebutuhan dunia industri, sekolah membuka Program Keahlian Teknik Elektronika Komunikasi dan Teknik Otomotif berdasarkan Kurikulum 1999." },
      { period: "Fase peningkatan mutu", title: "SSN & RSBI", desc: "Sekolah sempat menjadi bagian dari Sekolah Standar Nasional (SSN) dan Rintisan Sekolah Bertaraf Internasional (RSBI) — fondasi budaya mutu yang terus diwariskan sampai sekarang." },
      { period: "Hari ini", title: "Lebih dari dua dekade", desc: "Kini SMK Telekomunikasi Tunas Harapan menjalani empat Program Keahlian (PPLG, TJKT, DKV, TKRO) dengan tetap menjaga semangat yang sama: menyiapkan generasi yang mampu menghadapi masa depan." },
    ],
    gallery: [
      { src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_0981-1024x681.jpg", alt: "Dokumentasi kegiatan SMK Telekomunikasi Tunas Harapan" },
      { src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_0958-1024x651.jpg", alt: "Suasana pembelajaran di SMK Telekomunikasi Tunas Harapan" },
      { src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_1009-1-1024x681.jpg", alt: "Kegiatan siswa SMK Telekomunikasi Tunas Harapan" },
      { src: "https://www.tunasharapan.info/official/wp-content/uploads/2026/09/IMG_1010-1024x661.jpg", alt: "Dokumentasi arsip sekolah" },
    ],
  },
  "ppdb-info": {
    alamat: "Jl. Umbul Senjoyo I No. 3, Desa Bener, Kec. Tengaran, Kabupaten Semarang, Jawa Tengah",
    telepon: "(0298) 313040",
    langkah: [
      "Isi formulir online ini dan dapatkan nomor pendaftaran.",
      "Tunggu jadwal tes yang dikirim ke nomor WhatsApp Anda.",
      "Datang ke sekolah dengan berkas asli (rapor, KK, akta, pas foto).",
      "Lengkapi daftar ulang dan lunas biaya pendidikan.",
    ],
    catatan: [
      "Formulir online hanya bukti pendaftaran.",
      "Daftar lengkap wajib diisi saat datang ke sekolah.",
      "Informasi tes dikirim via WhatsApp, alternatif SMS.",
      "Jangan pernah membagikan kata sandi kepada siapa pun.",
    ],
    kontakTambahan: "Tanya asisten AI sekolah untuk informasi PPDB, jurusan, dan biaya pendidikan.",
  },
};

/* ------------------------------------------------------------------ */
/* Utilitas normalisasi                                                */
/* ------------------------------------------------------------------ */

function asObj(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown, fallback: string, max = 600): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

/** String opsional — "" kalau kosong (untuk kolom yang boleh dikosongkan). */
function strOpsional(value: unknown, max = 600): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function int(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Terima array string ATAU textarea multi-baris → daftar baris rapi. */
function baris(value: unknown, max = 40): string[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, max);
  }
  return [];
}

/** Terima array objek 2-kunci ATAU textarea "kunci | nilai" per baris. */
function pasangan(
  value: unknown,
  keyA: string,
  keyB: string,
  fallback: Array<Record<string, string>>,
  max = 30,
): Array<Record<string, string>> {
  if (typeof value === "string" || Array.isArray(value)) {
    if (typeof value === "string") {
      const rows = baris(value, max).map((line) => {
        const [first = "", ...rest] = line.split(/\s*[|\t]\s*|\s+-\s+/);
        return { [keyA]: first.trim(), [keyB]: rest.join(" — ").trim() };
      });
      const valid = rows.filter((r) => r[keyA]);
      return valid.length > 0 ? valid : fallback;
    }
    const rows = value
      .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
      .map((v) => ({
        [keyA]: str(v[keyA], "", 400),
        [keyB]: str(v[keyB], "", 400),
      }))
      .filter((r) => r[keyA]);
    return rows.slice(0, max);
  }
  return fallback;
}

function hrefAman(value: unknown, fallback: string): string {
  const href = str(value, fallback, 300);
  // Hindari javascript:, protokol relatif (//host), dan skema lain yang
  // tidak diperlukan. Tautan situs hanya path/anchor atau HTTPS.
  if (href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")) return href;
  if (href.startsWith("#")) return href;
  if (/^https:\/\/\S+$/i.test(href)) return href;
  if (/^(mailto|tel):[^\s]+$/i.test(href)) return href;
  return fallback;
}

function mediaAman(value: unknown, fallback = ""): string {
  const src = strOpsional(value, 300);
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  if (/^https:\/\/\S+$/i.test(src)) return src;
  return fallback;
}

function tombol(value: unknown, fallback: TombolKonten): TombolKonten {
  const o = asObj(value);
  return {
    label: str(o.label, fallback.label, 60),
    href: hrefAman(o.href, fallback.href),
  };
}

/** Angka/fraksi timeline video — nilai aneh dijatuhkan ke default. */
function detik(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 600) return fallback;
  return Math.round(n * 100) / 100;
}

/* ------------------------------------------------------------------ */
/* Normalisasi per key                                                 */
/* ------------------------------------------------------------------ */

function normalizeHero(raw: unknown): HeroKonten {
  const d = SITE_CONTENT_DEFAULTS.hero;
  const o = asObj(raw);
  return {
    badge: str(o.badge, d.badge, 140),
    judulAtas: str(o.judulAtas, d.judulAtas, 60),
    judulBawah: str(o.judulBawah, d.judulBawah, 60),
    deskripsi: str(o.deskripsi, d.deskripsi, 500),
    cta1: tombol(o.cta1, d.cta1),
    cta2: tombol(o.cta2, d.cta2),
    chips: (() => {
      const rows = pasangan(o.chips as unknown, "nilai", "label", [], 6).map((r) => ({
        nilai: r.nilai ?? "",
        label: r.label ?? "",
      }));
      return rows.length > 0 ? rows.slice(0, 6) : d.chips;
    })(),
    kartu: (() => {
      const rows = pasangan(o.kartu as unknown, "nilai", "label", [], 4).map((r) => ({
        nilai: r.nilai ?? "",
        label: r.label ?? "",
      }));
      return rows.length > 0 ? rows.slice(0, 4) : d.kartu;
    })(),
  };
}

function normalizeStatistik(raw: unknown): StatistikKonten {
  const d = SITE_CONTENT_DEFAULTS.statistik;
  const o = asObj(raw);
  const items = Array.isArray(o.items)
    ? o.items
        .map((item) => {
          const it = asObj(item);
          const ikon = str(it.ikon, "", 40);
          return {
            ikon: IKON_STATISTIK_KEYS.includes(ikon) ? ikon : "",
            nilai: int(it.nilai, 0, 0, 1_000_000),
            suffix: str(it.suffix, "", 4),
            label: str(it.label, "", 60),
          };
        })
        .filter((it) => it.label && it.ikon)
        .slice(0, 8)
    : [];
  return { items: items.length > 0 ? items : d.items };
}

function normalizeProfil(raw: unknown): ProfilKonten {
  const d = SITE_CONTENT_DEFAULTS.profil;
  const o = asObj(raw);
  const poin = baris(o.poin, 10);
  const t = asObj(o.testimoni);
  return {
    badge: str(o.badge, d.badge, 60),
    judulAwal: str(o.judulAwal, d.judulAwal, 120),
    judulAccent: str(o.judulAccent, d.judulAccent, 120),
    paragraf: str(o.paragraf, d.paragraf, 1200),
    poin: poin.length > 0 ? poin : d.poin,
    testimoni: {
      teks: str(t.teks, d.testimoni.teks, 2000),
      nama: str(t.nama, d.testimoni.nama, 80),
      peran: str(t.peran, d.testimoni.peran, 120),
      foto: mediaAman(t.foto, d.testimoni.foto),
    },
  };
}

function normalizeFasilitas(raw: unknown): FasilitasKonten {
  const d = SITE_CONTENT_DEFAULTS.fasilitas;
  const o = asObj(raw);

  // Tab selalu memakai id & ikon default per id (state tab aktif & ikon
  // tidak bisa diubah admin), hanya teks & item yang bisa diedit.
  let tabs = d.tabs;
  if (Array.isArray(o.tabs)) {
    const edited = o.tabs.map((item) => {
      const t = asObj(item);
      const id = str(t.id, "", 30);
      const base = d.tabs.find((x) => x.id === id) ?? d.tabs[0];
      if (!base) return null;
      const items = baris(t.items, 24);
      return {
        id: base.id,
        ikon: base.ikon,
        label: str(t.label, base.label, 40),
        judul: str(t.judul, base.judul, 120),
        deskripsi: str(t.deskripsi, base.deskripsi, 300),
        items: items.length > 0 ? items : base.items,
      } satisfies FasilitasTab;
    });
    const valid = edited.filter((t): t is FasilitasTab => t !== null);
    if (valid.length === d.tabs.length) tabs = valid;
  }

  let galeri = d.galeri;
  if (Array.isArray(o.galeri)) {
    const edited = o.galeri
      .map((item) => {
        const g = asObj(item);
        const src = mediaAman(g.src);
        const base = d.galeri.find((x) => x.src === src);
        return {
          src,
          poster: mediaAman(g.poster, base?.poster ?? ""),
          label: str(g.label, base?.label ?? "", 80),
          alt: str(g.alt, base?.alt ?? "", 160),
          deskripsi: str(g.deskripsi, base?.deskripsi ?? "", 600),
          xmin: detik(g.xmin, base?.xmin ?? 0),
          xmid: detik(g.xmid, base?.xmid ?? 1.5),
          xmax: detik(g.xmax, base?.xmax ?? 2.9),
        } satisfies FasilitasItem;
      })
      .filter((g) => g.src && g.label)
      .slice(0, 40);
    if (edited.length > 0) galeri = edited;
  }

  return {
    badge: str(o.badge, d.badge, 60),
    judul: str(o.judul, d.judul, 140),
    tabs,
    galeri,
  };
}

function normalizePpdbCta(raw: unknown): PpdbCtaKonten {
  const d = SITE_CONTENT_DEFAULTS["ppdb-cta"];
  const o = asObj(raw);
  const langkah = pasangan(o.langkah as unknown, "judul", "deskripsi", [], 6).map((r) => ({
    judul: r.judul ?? "",
    deskripsi: r.deskripsi ?? "",
  }));
  return {
    eyebrow: str(o.eyebrow, d.eyebrow, 60),
    judul: str(o.judul, d.judul, 160),
    deskripsi: str(o.deskripsi, d.deskripsi, 500),
    cta1: tombol(o.cta1, d.cta1),
    cta2: tombol(o.cta2, d.cta2),
    langkah:
      langkah.length > 0
        ? langkah
        : d.langkah,
  };
}

function normalizeGuru(raw: unknown): GuruKonten {
  const d = SITE_CONTENT_DEFAULTS.guru;
  const o = asObj(raw);
  const daftar: GuruKaryawan[] = [];

  if (Array.isArray(o.daftar)) {
    for (const item of o.daftar) {
      const g = asObj(item);
      const src = str(g.src, "", 300);
      if (!src.startsWith("/") || src.startsWith("//")) continue;
      daftar.push({ src, nama: strOpsional(g.nama, 80) });
      if (daftar.length >= 300) break;
    }
  } else if (typeof o.daftar === "string") {
    // Format baris: "Nama | /guru-karyawan/foto.jpg"
    for (const line of baris(o.daftar, 300)) {
      const [nama = "", ...rest] = line.split(/\s*[|\t]\s*/);
      const src = rest.join("|").trim();
      if (!src.startsWith("/") || src.startsWith("//")) continue;
      daftar.push({ src, nama: nama.trim() });
    }
  }

  return {
    badge: str(o.badge, d.badge, 60),
    judul: str(o.judul, d.judul, 80),
    deskripsi: str(o.deskripsi, d.deskripsi, 400),
    daftar: daftar.length > 0 ? daftar : d.daftar,
  };
}

/**
 * Validasi & rapikan data kasar dari admin untuk satu bagian.
 * Selalu mengembalikan bentuk lengkap (field yang hilang diisi default).
 */
function normalizePortalSiswa(raw: unknown): PortalSiswaKonten {
  const d = SITE_CONTENT_DEFAULTS["portal-siswa"];
  const o = asObj(raw);
  const agenda = Array.isArray(o.agenda)
    ? o.agenda
        .map((item) => {
          const a = asObj(item);
          return {
            tanggal: str(a.tanggal, "", 24),
            bulan: str(a.bulan, "", 24),
            judul: str(a.judul, "", 180),
            tempat: str(a.tempat, "", 180),
          };
        })
        .filter((item) => item.judul)
        .slice(0, 40)
    : d.agenda;
  const pengumuman = Array.isArray(o.pengumuman)
    ? o.pengumuman
        .map((item) => {
          const a = asObj(item);
          return {
            judul: str(a.judul, "", 240),
            badge: str(a.badge, "Info", 40),
          };
        })
        .filter((item) => item.judul)
        .slice(0, 40)
    : d.pengumuman;
  return {
    semester: str(o.semester, d.semester, 100),
    deskripsiSapaan: str(o.deskripsiSapaan, d.deskripsiSapaan, 500),
    agendaJudul: str(o.agendaJudul, d.agendaJudul, 80),
    agendaDeskripsi: str(o.agendaDeskripsi, d.agendaDeskripsi, 240),
    agendaBulan: str(o.agendaBulan, d.agendaBulan, 40),
    agenda,
    pengumumanJudul: str(o.pengumumanJudul, d.pengumumanJudul, 80),
    pengumumanDeskripsi: str(o.pengumumanDeskripsi, d.pengumumanDeskripsi, 240),
    pengumumanFooter: str(o.pengumumanFooter, d.pengumumanFooter, 160),
    pengumuman,
  };
}

function normalizeSejarah(raw: unknown): SejarahKonten {
  const d = SITE_CONTENT_DEFAULTS.sejarah;
  const o = asObj(raw);
  const latar = baris(o.latarBelakang, 20).map((item) => item.slice(0, 2400));
  const milestones = Array.isArray(o.milestones)
    ? o.milestones
        .map((item) => {
          const m = asObj(item);
          return {
            period: str(m.period, "", 100),
            title: str(m.title, "", 140),
            desc: str(m.desc, "", 1200),
          };
        })
        .filter((item) => item.title && item.desc)
        .slice(0, 30)
    : d.milestones;
  const gallery = Array.isArray(o.gallery)
    ? o.gallery
        .map((item) => {
          const g = asObj(item);
          return {
            src: mediaAman(g.src),
            alt: str(g.alt, "Dokumentasi sekolah", 200),
          };
        })
        .filter((item) => item.src)
        .slice(0, 30)
    : d.gallery;
  return {
    badge: str(o.badge, d.badge, 80),
    judul: str(o.judul, d.judul, 140),
    deskripsi: str(o.deskripsi, d.deskripsi, 500),
    latarBelakang: latar.length ? latar : d.latarBelakang,
    milestones,
    gallery,
  };
}

function normalizePpdbInfo(raw: unknown): PpdbInfoKonten {
  const d = SITE_CONTENT_DEFAULTS["ppdb-info"];
  const o = asObj(raw);
  const langkah = baris(o.langkah, 12).map((item) => item.slice(0, 400));
  const catatan = baris(o.catatan, 16).map((item) => item.slice(0, 400));
  return {
    alamat: str(o.alamat, d.alamat, 260),
    telepon: str(o.telepon, d.telepon, 60),
    langkah: langkah.length ? langkah : d.langkah,
    catatan: catatan.length ? catatan : d.catatan,
    kontakTambahan: str(o.kontakTambahan, d.kontakTambahan, 500),
  };
}

export function normalizeSiteContent<K extends SiteContentKey>(
  key: K,
  raw: unknown,
): SiteContentMap[K] {
  switch (key) {
    case "hero":
      return normalizeHero(raw) as SiteContentMap[K];
    case "statistik":
      return normalizeStatistik(raw) as SiteContentMap[K];
    case "profil":
      return normalizeProfil(raw) as SiteContentMap[K];
    case "fasilitas":
      return normalizeFasilitas(raw) as SiteContentMap[K];
    case "ppdb-cta":
      return normalizePpdbCta(raw) as SiteContentMap[K];
    case "guru":
      return normalizeGuru(raw) as SiteContentMap[K];
    case "portal-siswa":
      return normalizePortalSiswa(raw) as SiteContentMap[K];
    case "sejarah":
      return normalizeSejarah(raw) as SiteContentMap[K];
    case "ppdb-info":
      return normalizePpdbInfo(raw) as SiteContentMap[K];
    default:
      return SITE_CONTENT_DEFAULTS[key];
  }
}

/** true bila `key` adalah bagian konten yang dikenal. */
export function isSiteContentKey(key: unknown): key is SiteContentKey {
  return typeof key === "string" && (SITE_CONTENT_KEYS as string[]).includes(key);
}
