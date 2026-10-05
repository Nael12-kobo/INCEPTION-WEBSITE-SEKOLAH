import Link from "next/link";
import {
  ChevronRight,
  ArrowLeft,
  Wifi,
  Server,
  Shield,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Globe,
  Router,
} from "lucide-react";
import TJKTHeroDecorations from "@/components/tjkt-hero-decorations";

const kompetensi = [
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
      "Belajar部署 dan mengelola layanan cloud menggunakan AWS, Azure, Google Cloud, serta teknologi virtualisasi seperti VMware dan Proxmox.",
  },
  {
    judul: "IoT & Smart Networking",
    deskripsi:
      "Mengembangkan solusi Internet of Things yang terhubung dengan jaringan pintar untuk automasi dan monitoring.",
  },
];

const karir = [
  {
    pekerjaan: "Network Engineer",
    gaji: "Rp 5 - 20 juta/bulan",
    icon: <Globe className="size-5" />,
  },
  {
    pekerjaan: "System Administrator",
    gaji: "Rp 5 - 18 juta/bulan",
    icon: <Server className="size-5" />,
  },
  {
    pekerjaan: "Cyber Security Analyst",
    gaji: "Rp 6 - 25 juta/bulan",
    icon: <Shield className="size-5" />,
  },
  {
    pekerjaan: "Cloud Engineer",
    gaji: "Rp 7 - 30 juta/bulan",
    icon: <Wifi className="size-5" />,
  },
  {
    pekerjaan: "Telecom Specialist",
    gaji: "Rp 5 - 15 juta/bulan",
    icon: <Router className="size-5" />,
  },
  {
    pekerjaan: "IT Infrastructure Manager",
    gaji: "Rp 8 - 35 juta/bulan",
    icon: <Briefcase className="size-5" />,
  },
];

const keunggulan = [
  "Lab jaringan lengkap dengan perangkat Cisco, MikroTik, dan Ubiquiti",
  "Program sertifikasi Cisco CCNA, CompTIA Network+, dan MikroTik MTCNA",
  "Kerja sama dengan provider telekomunikasi dan ISP nasional",
  "Mengikuti kompetisi Jaringan tingkat nasional (LKS)",
  "Magang di perusahaan IT dan telecommunications",
  "Pembelajaran berbasis proyek nyata (real-world networking)",
];

export default function TJKTPage() {
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950 select-none drag-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white">
        <TJKTHeroDecorations />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <Link
            href="/#jurusan"
            className="inline-flex items-center gap-2 text-gray-200 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Wifi className="size-4" />
                Program Keahlian
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                TJKT
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-4 font-medium">
                Teknologi Jaringan Komputer & Telekomunikasi
              </p>
              <p className="text-lg text-gray-100 max-w-lg">
                Membentuk profesional jaringan yang mampu membangun, mengelola,
                dan mengamankan infrastruktur telekomunikasi modern.
              </p>
            </div>
            <div className="flex-shrink-0 select-none drag-none">
              <img
                  src="/jurusan/TJKT.png"
                  alt="TJKT Icon"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 left-240 top-80 w-64 h-64 md:w-128 md:h-128 object-contain"
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
                Tentang TJKT
              </h2>
              <div className="space-y-4 text-black dark:text-gray-400 leading-relaxed">
                <p>
                  TJKT (Teknologi Jaringan Komputer &amp; Telekomunikasi)
                  adalah program keahlian yang mempelajari infrastruktur
                  jaringan komputer dan sistem telekomunikasi. Siswa akan
                  menguasai instalasi, konfigurasi, dan troubleshooting
                  jaringan dari skala lokal hingga enterprise.
                </p>
                <p>
                  Di era digital ini, jaringan komputer menjadi tulang punggung
                  seluruh aktivitas bisnis dan komunikasi. Lulusan TJKT sangat
                  dibutuhkan oleh perusahaan telekomunikasi, ISP, bank,
                  instansi pemerintah, dan berbagai organisasi yang membutuhkan
                  infrastruktur jaringan handal.
                </p>
                <p>
                  Kurikulum TJKT dirancang sesuai standar industri global
                  dengan fokus pada keamanan jaringan (cyber security),
                  cloud computing, dan teknologi telekomunikasi terkini
                  termasuk 5G dan IoT.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="size-5 text-gray-500" />
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
              Penguasaan teknologi jaringan dan telekomunikasi secara menyeluruh
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kompetensi.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-900/50 text-black dark:text-gray-400 flex items-center justify-center mb-4">
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
              Lulusan TJKT memiliki peluang karir yang sangat dibutuhkan di
              era digital
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karir.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900/50 text-black dark:text-gray-400 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {item.pekerjaan}
                </h3>
                <p className="text-sm text-black dark:text-gray-400 font-medium">
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
          <div className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan TJKT?
            </h2>
            <p className="text-gray-100 mb-8 max-w-xl mx-auto">
              Jadilah ahli jaringan yang dibutuhkan oleh setiap perusahaan.
              Daftar sekarang dan kuasai dunia telekomunikasi!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/asisten"
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
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
