/**
 * Konten detail halaman statis 4 jurusan bawaan (PPLG, TJKT, DKV, TKRO).
 *
 * File ini adalah SUMBER CADANGAN (fallback) sekaligus bahan awal untuk tabel
 * `jurusans`:
 * - Setelah baris bawaan ada di DB, halaman statis membaca data dari sana
 *   lewat `getJurusanDetailBawaan()` — admin bisa mengubahnya dari Admin Panel >
 *   Program Keahlian.
 * - Selama baris belum ada / DB tidak terbaca, tampilan tetap persis seperti
 *   sebelumnya karena memakai nilai di sini.
 *
 * Murni data tanpa akses DB — aman diimpor dari komponen server maupun
 * script seeding.
 */

import {
  JURUSAN_BAWAAN,
  type KompetensiItem,
  type KarirItem,
} from "@/lib/jurusan";

/** Teks lengkap satu jurusan bawaan untuk halaman detailnya. */
export type JurusanDetail = {
  /** Singkatan di judul hero, mis. "PPLG". */
  singkatan: string;
  /** Subjudul hero di bawah singkatan. */
  tagline: string;
  /** Paragraf intro ketiga di hero. */
  heroTeks: string;
  /** Path logo jurusan di /public (mis. "/jurusan/PPLG.png"). */
  gambar: string;
  /** Narasi "Tentang <jurusan>" — paragraf dipisahkan baris kosong. */
  tentang: string;
  /** Daftar poin keunggulan jurusan. */
  keunggulan: string[];
  /** Materi yang dipelajari. */
  kompetensi: KompetensiItem[];
  /** Prospek karir lulusan. */
  karir: KarirItem[];
  /** Subjudul seksi "Kompetensi yang Dipelajari". */
  introKompetensi: string;
  /** Subjudul seksi "Prospek Karir". */
  introKarir: string;
  /** Judul kartu CTA di bawah halaman. */
  ctaJudul: string;
  /** Teks penjelas kartu CTA. */
  ctaTeks: string;
};

/** Bikin entri detail dengan singkatan/tagline diambil dari JURUSAN_BAWAAN. */
function detail(
  kode: string,
  data: Omit<JurusanDetail, "singkatan" | "tagline">,
): JurusanDetail {
  const bawaan = JURUSAN_BAWAAN.find((j) => j.kode === kode);
  return {
    singkatan: bawaan?.singkatan ?? kode,
    tagline: bawaan?.tagline ?? bawaan?.nama ?? "",
    ...data,
  };
}

export const DETAIL_BAWAAN: Record<string, JurusanDetail> = {
  PPLG: detail("PPLG", {
    heroTeks:
      "Membentuk developer handal yang mampu menciptakan aplikasi web, mobile, dan gim berkualitas dunia.",
    gambar: "/jurusan/PPLG.png",
    tentang: [
      "PPLG (Pemrograman Perangkat Lunak & Gim) adalah program keahlian yang mempelajari seluk-beluk pengembangan perangkat lunak mulai dari aplikasi web, mobile, hingga gim. Siswa akan diajarkan berbagai bahasa pemrograman modern dan framework terkini yang banyak digunakan di industri.",
      "Jurusan ini dirancang untuk menghasilkan lulusan yang siap kerja di bidang teknologi informasi dengan kemampuan coding yang solid, pemahaman alur kerja pengembangan perangkat lunak (software development lifecycle), serta keterampilan problem solving yang tinggi.",
      "Dengan perkembangan industri teknologi yang sangat pesat, lulusan PPLG memiliki prospek kerja yang sangat luas baik di perusahaan lokal maupun internasional, maupun sebagai freelancer atau entrepreneur di bidang teknologi.",
    ].join("\n\n"),
    keunggulan: [
      "Laboratorium komputer lengkap dengan spesifikasi tinggi",
      "Kurikulum disesuaikan dengan kebutuhan industri IT",
      "Program magang dengan perusahaan teknologi terkemuka",
      "Sertifikasi kompetensi dari BNSP dan vendor internasional",
      "Akses platform pembelajaran online 24 jam",
      "Mengikuti kompetisi programming tingkat nasional",
    ],
    kompetensi: [
      {
        judul: "Pemrograman Web",
        deskripsi:
          "Mempelajari pengembangan website menggunakan HTML, CSS, JavaScript, React, Node.js, dan framework modern lainnya.",
      },
      {
        judul: "Pemrograman Mobile",
        deskripsi:
          "Belajar membuat aplikasi mobile menggunakan Kotlin, Swift, Flutter, dan React Native untuk Android maupun iOS.",
      },
      {
        judul: "Pengembangan Gim",
        deskripsi:
          "Menguasai pembuatan gim 2D dan 3D menggunakan Unity, Unreal Engine, dan Godot dengan pemrograman C# dan C++.",
      },
      {
        judul: "Basis Data",
        deskripsi:
          "Mempelajari desain, implementasi, dan manajemen basis data menggunakan MySQL, PostgreSQL, dan MongoDB.",
      },
      {
        judul: "UI/UX Design",
        deskripsi:
          "Merancang antarmuka pengguna yang menarik dan pengalaman pengguna yang optimal menggunakan Figma dan Adobe XD.",
      },
      {
        judul: "Cloud & DevOps",
        deskripsi:
          "Belajar deployment, CI/CD, Docker, dan pengelolaan cloud computing menggunakan AWS, GCP, dan Vercel.",
      },
    ],
    karir: [
      { pekerjaan: "Web Developer", gaji: "Rp 4 - 15 juta/bulan" },
      { pekerjaan: "Mobile App Developer", gaji: "Rp 5 - 18 juta/bulan" },
      { pekerjaan: "Game Developer", gaji: "Rp 5 - 20 juta/bulan" },
      { pekerjaan: "Fullstack Developer", gaji: "Rp 6 - 25 juta/bulan" },
      { pekerjaan: "UI/UX Designer", gaji: "Rp 4 - 12 juta/bulan" },
      { pekerjaan: "Software Engineer", gaji: "Rp 6 - 30 juta/bulan" },
    ],
    introKompetensi:
      "Kurikulum komprehensif yang mencakup seluruh aspek pengembangan perangkat lunak",
    introKarir:
      "Lulusan PPLG memiliki peluang karir yang sangat luas di industri teknologi",
    ctaJudul: "Tertarik dengan Jurusan PPLG?",
    ctaTeks:
      "Mulai karirmu di dunia teknologi sejak dini. Daftar sekarang dan jadi bagian dari generasi developer masa depan!",
  }),

  TJKT: detail("TJKT", {
    heroTeks:
      "Membentuk profesional jaringan yang mampu membangun, mengelola, dan mengamankan infrastruktur telekomunikasi modern.",
    gambar: "/jurusan/TJKT.png",
    tentang: [
      "TJKT (Teknologi Jaringan Komputer & Telekomunikasi) adalah program keahlian yang mempelajari infrastruktur jaringan komputer dan sistem telekomunikasi. Siswa akan menguasai instalasi, konfigurasi, dan troubleshooting jaringan dari skala lokal hingga enterprise.",
      "Di era digital ini, jaringan komputer menjadi tulang punggung seluruh aktivitas bisnis dan komunikasi. Lulusan TJKT sangat dibutuhkan oleh perusahaan telekomunikasi, ISP, bank, instansi pemerintah, dan berbagai organisasi yang membutuhkan infrastruktur jaringan handal.",
      "Kurikulum TJKT dirancang sesuai standar industri global dengan fokus pada keamanan jaringan (cyber security), cloud computing, dan teknologi telekomunikasi terkini termasuk 5G dan IoT.",
    ].join("\n\n"),
    keunggulan: [
      "Lab jaringan lengkap dengan perangkat Cisco, MikroTik, dan Ubiquiti",
      "Program sertifikasi Cisco CCNA, CompTIA Network+, dan MikroTik MTCNA",
      "Kerja sama dengan provider telekomunikasi dan ISP nasional",
      "Mengikuti kompetisi Jaringan tingkat nasional (LKS)",
      "Magang di perusahaan IT dan telecommunications",
      "Pembelajaran berbasis proyek nyata (real-world networking)",
    ],
    kompetensi: [
      {
        judul: "Jaringan Komputer",
        deskripsi:
          "Mempelajari instalasi, konfigurasi, dan troubleshooting jaringan LAN, WAN, dan wireless menggunakan perangkat Cisco, MikroTik, dan Ubiquiti.",
      },
      {
        judul: "Keamanan Jaringan (Cyber Security)",
        deskripsi:
          "Belajar melindungi infrastruktur jaringan dari serangan siber, termasuk firewall, intrusion detection system, dan analisis vulnerabilitas.",
      },
      {
        judul: "Telekomunikasi",
        deskripsi:
          "Menguasai teknologi komunikasi data, VoIP, fiber optic, wireless communication, dan jaringan seluler 4G/5G.",
      },
      {
        judul: "Sistem Operasi Server",
        deskripsi:
          "Mengelola server Linux (Ubuntu, CentOS) dan Windows Server, termasuk DNS, DHCP, web server, dan mail server.",
      },
      {
        judul: "Cloud Computing & Virtualisasi",
        deskripsi:
          "Belajar dan mengelola layanan cloud menggunakan AWS, Azure, Google Cloud, serta teknologi virtualisasi seperti VMware dan Proxmox.",
      },
      {
        judul: "IoT & Smart Networking",
        deskripsi:
          "Mengembangkan solusi Internet of Things yang terhubung dengan jaringan pintar untuk automasi dan monitoring.",
      },
    ],
    karir: [
      { pekerjaan: "Network Engineer", gaji: "Rp 5 - 20 juta/bulan" },
      { pekerjaan: "System Administrator", gaji: "Rp 5 - 18 juta/bulan" },
      { pekerjaan: "Cyber Security Analyst", gaji: "Rp 6 - 25 juta/bulan" },
      { pekerjaan: "Cloud Engineer", gaji: "Rp 7 - 30 juta/bulan" },
      { pekerjaan: "Telecom Specialist", gaji: "Rp 5 - 15 juta/bulan" },
      { pekerjaan: "IT Infrastructure Manager", gaji: "Rp 8 - 35 juta/bulan" },
    ],
    introKompetensi:
      "Penguasaan teknologi jaringan dan telekomunikasi secara menyeluruh",
    introKarir:
      "Lulusan TJKT memiliki peluang karir yang sangat dibutuhkan di era digital",
    ctaJudul: "Tertarik dengan Jurusan TJKT?",
    ctaTeks:
      "Jadilah ahli jaringan yang dibutuhkan oleh setiap perusahaan. Daftar sekarang dan kuasai dunia telekomunikasi!",
  }),

  DKV: detail("DKV", {
    heroTeks:
      "Membentuk kreator visual kreatif yang mampu menyampaikan ide dan pesan melalui desain grafis, fotografi, dan media digital.",
    gambar: "/jurusan/DKV.png",
    tentang: [
      "DKV (Desain Komunikasi Visual) adalah program keahlian yang menggabungkan kreativitas dengan teknologi untuk menciptakan komunikasi visual yang efektif. Siswa akan belajar mulai dari desain grafis dasar hingga produksi media digital modern.",
      "Di era konten digital ini, kebutuhan akan desainer visual yang handal semakin meningkat. Mulai dari media sosial, website, hingga kampanye iklan, semuanya membutuhkan desain yang menarik dan profesional.",
      "Kurikulum DKV dirancang untuk mengembangkan kreativitas, pemikiran visual, dan keterampilan teknis yang dibutuhkan oleh industri kreatif, mulai dari advertising, publishing, hingga production house.",
    ].join("\n\n"),
    keunggulan: [
      "Studio desain lengkap dengan iMac dan tablet grafis Wacom",
      "Perangkat lunak berlisensi Adobe Creative Cloud",
      "Portofolio proyek nyata dengan klien lokal dan UMKM",
      "Pembinaan untuk mengikuti kompetisi desain (LKS, Design Competition)",
      "Magang di studio kreatif, agency, dan media",
      "Workshop rutin dengan desainer profesional",
    ],
    kompetensi: [
      {
        judul: "Desain Grafis",
        deskripsi:
          "Menguasai Adobe Photoshop, Illustrator, dan InDesign untuk pembuatan desain cetak maupun digital seperti brosur, poster, dan majalah.",
      },
      {
        judul: "Desain UI/UX",
        deskripsi:
          "Merancang antarmuka pengguna yang menarik dan pengalaman pengguna yang optimal menggunakan Figma, Adobe XD, dan Sketch.",
      },
      {
        judul: "Motion Graphics & Animasi",
        deskripsi:
          "Membuat animasi dan video motion graphics menggunakan Adobe After Effects, Premiere Pro, dan Blender untuk konten digital.",
      },
      {
        judul: "Fotografi & Videografi",
        deskripsi:
          "Belajar teknik pemotograhan profesional, pengambilan gambar, editing video, dan produksi konten visual berkualitas tinggi.",
      },
      {
        judul: "Branding & Identitas Visual",
        deskripsi:
          "Mendesain identitas merek yang kuat termasuk logo, brand guidelines, dan sistem desain yang konsisten untuk berbagai media.",
      },
      {
        judul: "Publishing & Media Cetak",
        deskripsi:
          "Menguasai layout editorial, tipografi, dan produksi media cetak seperti buku, koran, dan materi promosi.",
      },
    ],
    karir: [
      { pekerjaan: "Graphic Designer", gaji: "Rp 3 - 10 juta/bulan" },
      { pekerjaan: "UI/UX Designer", gaji: "Rp 5 - 15 juta/bulan" },
      { pekerjaan: "Motion Designer", gaji: "Rp 4 - 12 juta/bulan" },
      { pekerjaan: "Art Director", gaji: "Rp 8 - 25 juta/bulan" },
      { pekerjaan: "Photographer / Videographer", gaji: "Rp 3 - 15 juta/bulan" },
      { pekerjaan: "Brand Identity Designer", gaji: "Rp 5 - 20 juta/bulan" },
    ],
    introKompetensi:
      "Penguasaan tools desain profesional dan pemahaman komunikasi visual yang kuat",
    introKarir: "Lulusan DKV sangat dibutuhkan di industri kreatif dan digital",
    ctaJudul: "Tertarik dengan Jurusan DKV?",
    ctaTeks:
      "Asah kreativitasmu dan wujudkan ide visualmu menjadi kenyataan. Daftar sekarang dan jadi desainer profesional!",
  }),

  TKRO: detail("TKRO", {
    heroTeks:
      "Membentuk teknisi otomotif profesional yang menguasai perawatan, perbaikan, dan diagnostik kendaraan ringan modern.",
    gambar: "/jurusan/TKRO.png",
    tentang: [
      "TKRO (Teknik Kendaraan Ringan Otomotif) adalah program keahlian yang mempelajari seluk-beluk perawatan dan perbaikan kendaraan bermotor ringan seperti mobil penumpang dan niaga ringan. Siswa akan dibekali pengetahuan teknis dan keterampilan praktis di bengkel.",
      "Indonesia merupakan salah satu pasar otomotif terbesar di Asia Tenggara. Dengan jumlah kendaraan yang terus bertambah, kebutuhan akan teknisi otomotif terampil dan bersertifikat sangat tinggi. Lulusan TKRO memiliki peluang kerja yang sangat luas.",
      "Kurikulum TKRO mengikuti perkembangan teknologi otomotif terkini termasuk sistem injeksi, diagnostik elektronik, dan teknologi kendaraan listrik (EV) yang sedang berkembang pesat di Indonesia.",
    ].join("\n\n"),
    keunggulan: [
      "Bengkel otomotif lengkap dengan peralatan modern",
      "Kerja sama dengan bengkel resmi Toyota, Honda, Daihatsu, dan Suzuki",
      "Program sertifikasi dari LSP Otomotif Indonesia",
      "Praktik langsung dengan kendaraan terkini",
      "Mengikuti kompetisi otomotif tingkat nasional (LKS)",
      "Kurikulum mencakup teknologi kendaraan listrik (EV)",
    ],
    kompetensi: [
      {
        judul: "Teknik Mesin Otomotif",
        deskripsi:
          "Mempelajari prinsip kerja mesin bensin dan diesel, sistem pendingin, pelumasan, dan bahan bakar pada kendaraan ringan.",
      },
      {
        judul: "Sistem Kelistrikan Kendaraan",
        deskripsi:
          "Menguasai sistem kelistrikan mobil meliputi sistem pengisian, starter, AC, lighting, dan electrical component diagnosis.",
      },
      {
        judul: "Teknologi Injeksi & EC",
        deskripsi:
          "Belajar sistem injeksi bahan bakar elektronik, Engine Management System, scan tool diagnostik, dan analisis data sensor.",
      },
      {
        judul: "Transmisi & Chassis",
        deskripsi:
          "Memahami sistem transmisi manual dan otomatis, sistem rem, suspensi, steering, dan chassis maintenance.",
      },
      {
        judul: "Diagnostik & Perawatan",
        deskripsi:
          "Menguasai teknik diagnostik modern menggunakan scanner OBD-II, analisis kerusakan, dan maintenance berkala kendaraan.",
      },
      {
        judul: "Teknologi Kendaraan Listrik",
        deskripsi:
          "Mempelajari teknologi kendaraan hybrid dan electric vehicle (EV), termasuk baterai, motor listrik, dan charging system.",
      },
    ],
    karir: [
      { pekerjaan: "Mekanik Otomotif", gaji: "Rp 3 - 8 juta/bulan" },
      { pekerjaan: "Teknisi Diagnostik", gaji: "Rp 4 - 12 juta/bulan" },
      { pekerjaan: "Foreman / Service Advisor", gaji: "Rp 5 - 15 juta/bulan" },
      { pekerjaan: "Bengkel Sendiri (Entrepreneur)", gaji: "Rp 5 - 20 juta/bulan" },
      { pekerjaan: "Technician Dealer Resmi", gaji: "Rp 4 - 12 juta/bulan" },
      { pekerjaan: "Inspektor Kendaraan", gaji: "Rp 4 - 10 juta/bulan" },
    ],
    introKompetensi: "Penguasaan teknik otomotif dari dasar hingga teknologi modern",
    introKarir: "Lulusan TKRO sangat dibutuhkan di industri otomotif Indonesia",
    ctaJudul: "Tertarik dengan Jurusan TKRO?",
    ctaTeks:
      "Jadilah teknisi otomotif profesional yang dibutuhkan oleh dealer dan bengkel resmi di seluruh Indonesia!",
  }),
};
