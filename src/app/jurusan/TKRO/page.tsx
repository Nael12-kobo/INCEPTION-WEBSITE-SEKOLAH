import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Wrench,
  Car,
  Gauge,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Fuel,
  Settings,
} from "lucide-react";
import TKROHeroDecorations from "@/components/tkro-hero-decorations";
import TKROHeroDecorationsMobile from "@/components/tkro-hero-decorations-buatmobile";

const kompetensi = [
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
];

const karir = [
  {
    pekerjaan: "Mekanik Otomotif",
    gaji: "Rp 3 - 8 juta/bulan",
    icon: <Wrench className="size-5" />,
  },
  {
    pekerjaan: "Teknisi Diagnostik",
    gaji: "Rp 4 - 12 juta/bulan",
    icon: <Gauge className="size-5" />,
  },
  {
    pekerjaan: "Foreman / Service Advisor",
    gaji: "Rp 5 - 15 juta/bulan",
    icon: <Car className="size-5" />,
  },
  {
    pekerjaan: "Bengkel Sendiri (Entrepreneur)",
    gaji: "Rp 5 - 20 juta/bulan",
    icon: <Briefcase className="size-5" />,
  },
  {
    pekerjaan: "Technician Dealer Resmi",
    gaji: "Rp 4 - 12 juta/bulan",
    icon: <Settings className="size-5" />,
  },
  {
    pekerjaan: "Inspektor Kendaraan",
    gaji: "Rp 4 - 10 juta/bulan",
    icon: <Fuel className="size-5" />,
  },
];

const keunggulan = [
  "Bengkel otomotif lengkap dengan peralatan modern",
  "Kerja sama dengan bengkel resmi Toyota, Honda, Daihatsu, dan Suzuki",
  "Program sertifikasi dari LSP Otomotif Indonesia",
  "Praktik langsung dengan kendaraan terkini",
  "Mengikuti kompetisi otomotif tingkat nasional (LKS)",
  "Kurikulum mencakup teknologi kendaraan listrik (EV)",
];

export default function TKROPage() {
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-orange-600 to-yellow-700 text-white">
        <TKROHeroDecorations />
        <TKROHeroDecorationsMobile />
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <Link
            href="/#jurusan"
            className="inline-flex items-center gap-2 text-orange-200 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Car className="size-4" />
                Program Keahlian
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                TKRO
              </h1>
              <p className="text-xl md:text-2xl text-orange-200 mb-4 font-medium">
                Teknik Kendaraan Ringan Otomotif
              </p>
              <p className="text-lg text-orange-100 max-w-lg">
                Membentuk teknisi otomotif profesional yang menguasai
                perawatan, perbaikan, dan diagnostik kendaraan ringan modern.
              </p>
            </div>
            <div className="flex-shrink-0">
              <img
                  src="/jurusan/TKRO.png"
                  alt="TKRO Icon"
                  className="absolute hidden top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 left-240 top-80 w-64 h-64 md:hidden lg:block lg:w-150 lg:h-150 object-contain"
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
                Tentang TKRO
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  TKRO (Teknik Kendaraan Ringan Otomotif) adalah program
                  keahlian yang mempelajari seluk-beluk perawatan dan
                  perbaikan kendaraan bermotor ringan seperti mobil penumpang
                  dan niaga ringan. Siswa akan dibekali pengetahuan teknis
                  dan keterampilan praktis di bengkel.
                </p>
                <p>
                  Indonesia merupakan salah satu pasar otomotif terbesar di
                  Asia Tenggara. Dengan jumlah kendaraan yang terus bertambah,
                  kebutuhan akan teknisi otomotif terampil dan bersertifikat
                  sangat tinggi. Lulusan TKRO memiliki peluang kerja yang
                  sangat luas.
                </p>
                <p>
                  Kurikulum TKRO mengikuti perkembangan teknologi otomotif
                  terkini termasuk sistem injeksi, diagnostik elektronik, dan
                  teknologi kendaraan listrik (EV) yang sedang berkembang
                  pesat di Indonesia.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="size-5 text-orange-500" />
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
              Penguasaan teknik otomotif dari dasar hingga teknologi modern
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kompetensi.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
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
              Lulusan TKRO sangat dibutuhkan di industri otomotif Indonesia
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karir.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {item.pekerjaan}
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
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
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan TKRO?
            </h2>
            <p className="text-orange-100 mb-8 max-w-xl mx-auto">
              Jadilah teknisi otomotif profesional yang dibutuhkan oleh dealer
              dan bengkel resmi di seluruh Indonesia!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/asisten"
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-700 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg"
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
    </div>
  );
}
