import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  ArrowLeft,
  Palette,
  PenTool,
  Camera,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Film,
  Layers,
} from "lucide-react";
import DKVHeroDecorations from "@/components/dkv-hero-decorations";

const kompetensi = [
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
];

const karir = [
  {
    pekerjaan: "Graphic Designer",
    gaji: "Rp 3 - 10 juta/bulan",
    icon: <PenTool className="size-5" />,
  },
  {
    pekerjaan: "UI/UX Designer",
    gaji: "Rp 5 - 15 juta/bulan",
    icon: <Layers className="size-5" />,
  },
  {
    pekerjaan: "Motion Designer",
    gaji: "Rp 4 - 12 juta/bulan",
    icon: <Film className="size-5" />,
  },
  {
    pekerjaan: "Art Director",
    gaji: "Rp 8 - 25 juta/bulan",
    icon: <Palette className="size-5" />,
  },
  {
    pekerjaan: "Photographer / Videographer",
    gaji: "Rp 3 - 15 juta/bulan",
    icon: <Camera className="size-5" />,
  },
  {
    pekerjaan: "Brand Identity Designer",
    gaji: "Rp 5 - 20 juta/bulan",
    icon: <Briefcase className="size-5" />,
  },
];

const keunggulan = [
  "Studio desain lengkap dengan iMac dan tablet grafis Wacom",
  "Perangkat lunak berlisensi Adobe Creative Cloud",
  "Portofolio proyek nyata dengan klien lokal dan UMKM",
  "Pembinaan untuk mengikuti kompetisi desain (LKS, Design Competition)",
  "Magang di studio kreatif, agency, dan media",
  "Workshop rutin dengan desainer profesional",
];

export default function DKVPage() {
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950 select-none drag-none">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 text-white">
        <DKVHeroDecorations />

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
                <Palette className="size-4" />
                Program Keahlian
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                DKV
              </h1>
              <p className="text-xl md:text-2xl text-blue-200 mb-4 font-medium">
                Desain Komunikasi Visual
              </p>
              <p className="text-lg text-blue-100 max-w-lg">
                Membentuk kreator visual kreatif yang mampu menyampaikan ide
                dan pesan melalui desain grafis, fotografi, dan media digital.
              </p>
            </div>
            <div className="flex-shrink-0 select-none drag-none">
              {/* Dulu `absolute left-240 top-80` (960px/320px) menimpa
                  `left-1/2 top-1/2` → ikon ter-clip `overflow-hidden`. */}
              <Image
                src="/jurusan/DKV.png"
                alt="DKV Icon"
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
                Tentang DKV
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  DKV (Desain Komunikasi Visual) adalah program keahlian yang
                  menggabungkan kreativitas dengan teknologi untuk menciptakan
                  komunikasi visual yang efektif. Siswa akan belajar mulai dari
                  desain grafis dasar hingga produksi media digital modern.
                </p>
                <p>
                  Di era konten digital ini, kebutuhan akan desainer visual
                  yang handal semakin meningkat. Mulai dari media sosial,
                  website, hingga kampanye iklan, semuanya membutuhkan desain
                  yang menarik dan profesional.
                </p>
                <p>
                  Kurikulum DKV dirancang untuk mengembangkan kreativitas,
                  pemikiran visual, dan keterampilan teknis yang dibutuhkan
                  oleh industri kreatif, mulai dari advertising, publishing,
                  hingga production house.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="size-5 text-blue-500" />
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
              Penguasaan tools desain profesional dan pemahaman komunikasi
              visual yang kuat
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kompetensi.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
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
              Lulusan DKV sangat dibutuhkan di industri kreatif dan digital
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karir.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {item.pekerjaan}
                </h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
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
          <div className="bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan DKV?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Asah kreativitasmu dan wujudkan ide visualmu menjadi kenyataan.
              Daftar sekarang dan jadi desainer profesional!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/asisten"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors shadow-lg"
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
