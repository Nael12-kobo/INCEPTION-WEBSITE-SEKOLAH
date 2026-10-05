import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowLeft,
  Code2,
  Gamepad2,
  Laptop,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Star,
  Rocket,
} from "lucide-react";
import PPLGHeroDecorations from "@/components/pplg-hero-decorations";
import PPLGHeroDecorationsMobile from "@/components/pplg-hero-decorations-buatmobile";
const kompetensi = [
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
];

const karir = [
  {
    pekerjaan: "Web Developer",
    gaji: "Rp 4 - 15 juta/bulan",
    icon: <Laptop className="size-5" />,
  },
  {
    pekerjaan: "Mobile App Developer",
    gaji: "Rp 5 - 18 juta/bulan",
    icon: <Code2 className="size-5" />,
  },
  {
    pekerjaan: "Game Developer",
    gaji: "Rp 5 - 20 juta/bulan",
    icon: <Gamepad2 className="size-5" />,
  },
  {
    pekerjaan: "Fullstack Developer",
    gaji: "Rp 6 - 25 juta/bulan",
    icon: <Rocket className="size-5" />,
  },
  {
    pekerjaan: "UI/UX Designer",
    gaji: "Rp 4 - 12 juta/bulan",
    icon: <Star className="size-5" />,
  },
  {
    pekerjaan: "Software Engineer",
    gaji: "Rp 6 - 30 juta/bulan",
    icon: <Briefcase className="size-5" />,
  },
];

const keunggulan = [
  "Laboratorium komputer lengkap dengan spesifikasi tinggi",
  "Kurikulum disesuaikan dengan kebutuhan industri IT",
  "Program magang dengan perusahaan teknologi terkemuka",
  "Sertifikasi kompetensi dari BNSP dan vendor internasional",
  "Akses platform pembelajaran online 24 jam",
  "Mengikuti kompetisi programming tingkat nasional",
];

// Mitra industri / DUDI (Dunia Usaha Dunia Industri) tempat sekolah bekerjasama
// `w`/`h` = dimensi asli gambar — dipakai next/image agar tidak ada layout
// shift (CLS) saat logo dimuat. SVG otomatis di-`unoptimized` oleh next/image.
const mitra = [
  { nama: "Sinarmas", gambar: "/sponsor/sinarmas.png", w: 1280, h: 287 },
  { nama: "iForte", gambar: "/sponsor/iforte.png", w: 1510, h: 516 },
  { nama: "Wings", gambar: "/sponsor/wings.svg", w: 1499, h: 881 },
  { nama: "Garudafood", gambar: "/sponsor/garudafood.png", w: 207, h: 50 },
  { nama: "Indofood", gambar: "/sponsor/indofood.svg", w: 265, h: 87 },
  { nama: "Bakti Barito", gambar: "/sponsor/bakti-barito.png", w: 634, h: 247 },
  {
    nama: "Triputra Agro Persada",
    gambar: "/sponsor/triputra-agro.png",
    w: 5116,
    h: 1777,
  },
  { nama: "Agung Sedayu Group", gambar: "/sponsor/agung-sedayu.png", w: 232, h: 160 },
  { nama: "PT Ciliandra Perkasa", gambar: "/sponsor/ciliandra-perkasa.png", w: 282, h: 500 },
];

export default function PPLGPage() {
  return (


    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white">
        <PPLGHeroDecorations />
        <PPLGHeroDecorationsMobile />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <Link
            href="/#jurusan"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Code2 className="size-4" />
                Program Keahlian
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                PPLG
              </h1>
              <p className="text-xl md:text-2xl text-red-200 mb-4 font-medium">
                Pemrograman Perangkat Lunak & Gim
              </p>
              <p className="text-lg text-blue-100 max-w-lg">
                Membentuk developer handal yang mampu menciptakan aplikasi web,
                mobile, dan gim berkualitas dunia.
              </p>
            </div>
            <div className="flex-shrink-0 select-none drag-none">
              {/* Dulu `absolute left-240 top-80` (960px/320px) menimpa
                  `left-1/2 top-1/2` → ikon ter-clip `overflow-hidden`. */}
              <Image
                src="/jurusan/PPLG.png"
                alt="PPLG Icon"
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 224px"
                className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Jurusan */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Tentang PPLG
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  PPLG (Pemrograman Perangkat Lunak & Gim) adalah program
                  keahlian yang mempelajari seluk-beluk pengembangan perangkat
                  lunak mulai dari aplikasi web, mobile, hingga gim. Siswa
                  akan diajarkan berbagai bahasa pemrograman modern dan
                  framework terkini yang banyak digunakan di industri.
                </p>
                <p>
                  Jurusan ini dirancang untuk menghasilkan lulusan yang siap
                  kerja di bidang teknologi informasi dengan kemampuan coding
                  yang solid, pemahaman alur kerja pengembangan perangkat
                  lunak (software development lifecycle), serta keterampilan
                  problem solving yang tinggi.
                </p>
                <p>
                  Dengan perkembangan industri teknologi yang sangat pesat,
                  lulusan PPLG memiliki prospek kerja yang sangat luas baik di
                  perusahaan lokal maupun internasional, maupun sebagai
                  freelancer atau entrepreneur di bidang teknologi.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="size-5 text-red-500" />
                Keunggulan Jurusan
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700">
                <ul className="space-y-3">
                  {keunggulan.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kompetensi Keahlian */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Kompetensi yang Dipelajari
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Kurikulum komprehensif yang mencakup seluruh aspek pengembangan
              perangkat lunak
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kompetensi.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                  <span className="text-lg font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {item.judul}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prospek Karir */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Prospek Karir
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Lulusan PPLG memiliki peluang karir yang sangat luas di industri
              teknologi
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karir.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {item.pekerjaan}
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {item.gaji}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan PPLG?
            </h2>
            <p className="text-red-100 mb-8 max-w-xl mx-auto">
              Mulai karirmu di dunia teknologi sejak dini. Daftar sekarang dan
              jadi bagian dari generasi developer masa depan!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/asisten"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-700 font-semibold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg"
              >
                Tanya AI Asisten
                <ChevronRight className="size-5" />
              </Link>
              <Link
                href="/#jurusan"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/10 transition-colors"
              >
                Lihat Jurusan Lain
              </Link>
            </div>
          </div>
        </div>
      </section>

       {/* bagian mitra / kerjasama industri */}
      <section
        id="mitra"
        className="py-16 md:py-20 bg-blue-50/60 dark:bg-gray-950 border-b dark:border-gray-800"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Disponsori oleh
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Bersinergi bersama mitra industri terpercaya untuk mendukung
              praktik kerja lapangan (PKL), kompetensi, dan masa depan
              siswa-siswi SMK Telekomunikasi Tunas Harapan.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {mitra.map((m) => (
              <div
                key={m.nama}
                className="w-40 sm:w-44 h-24 bg-white rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 transition-all duration-300 flex items-center justify-center px-4"
                title={m.nama}
              >
                {m.gambar ? (
                  <Image
                    src={m.gambar}
                    alt={`Logo ${m.nama}`}
                    width={m.w}
                    height={m.h}
                    loading="lazy"
                    className="max-h-16 max-w-full object-contain hover:grayscale-0 transition-all duration-300"
                  />
                ) : (
                  <span className="text-center font-bold text-gray-800 leading-tight text-sm">
                    {m.nama}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
