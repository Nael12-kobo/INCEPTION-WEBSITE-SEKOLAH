import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JurusanBawaanDetail } from "@/components/jurusan/jurusan-bawaan-detail";
import { getJurusanDetailBawaan } from "@/lib/jurusan-server";

export default function PPLGPage() {
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden dark:bg-gradient-to-br dark:from-[#3f0b16] dark:via-[#991b1b] dark:to-[#dc2626] bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white">
        <PPLGHeroDecorations />
        <PPLGHeroDecorationsMobile />

        <div className="relative max-w-6xl mx-auto px-6 py-5 sm:py-7 md:py-10">
          <Link
            href="/#jurusan"
            className="inline-flex items-center gap-2 py-2.5 min-h-11 text-red-200 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-card/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Code2 className="size-4" />
                Program Keahlian
              </div>
              <h1 className="text-6xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-shadow-lg">
                PPLG
              </h1>
              <p className="text-xl md:text-2xl text-red-100 mb-4 font-medium">
                Pemrograman Perangkat Lunak & Gim
              </p>
              <p className="text-lg text-red-100 max-w-lg">
                Membentuk developer handal yang mampu menciptakan aplikasi web,
                mobile, dan gim berkualitas dunia.
              </p>
            </div>
            <div className="flex-shrink-0 select-none">
              {/* Dulu `absolute left-240 top-80` (960px/320px) menimpa
                  `left-1/2 top-1/2` → ikon ter-clip `overflow-hidden`. */}
              <Image
                src="/jurusan/PPLG.png"
                alt="PPLG Icon"
                width={1254}
                height={1254}
                priority
                sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 224px"
                className="hidden lg:block w-100 h-100  lg:w-125 lg:h-125 object-contain"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tentang Jurusan */}
      <section className="py-16 md:py-20 bg-card dark:bg-gray-900">
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
                  lunak mulai dari aplikasi web, mobile, hingga gim. Siswa akan
                  diajarkan berbagai bahasa pemrograman modern dan framework
                  terkini yang banyak digunakan di industri.
                </p>
                <p>
                  Jurusan ini dirancang untuk menghasilkan lulusan yang siap
                  kerja di bidang teknologi informasi dengan kemampuan coding
                  yang solid, pemahaman alur kerja pengembangan perangkat lunak
                  (software development lifecycle), serta keterampilan problem
                  solving yang tinggi.
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
                <GraduationCap className="size-5 text-red-600" />
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
                className="bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
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
      <section className="py-16 md:py-20 bg-card dark:bg-gray-900">
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
                className="bg-gradient-to-br from-gray-50 to-card dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 transition-colors"
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
          <div className="bg-gradient-to-br from-[#3f0b16] via-[#991b1b] to-[#dc2626] rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan PPLG?
            </h2>
            <p className="text-red-100 mb-8 max-w-xl mx-auto">
              Mulai karirmu di dunia teknologi sejak dini. Daftar sekarang dan
              jadi bagian dari generasi developer masa depan!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-800 font-semibold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg"
              >
                Tanya AI Asisten
                <ChevronRight className="size-5" />
              </Link>
              <Link
                href="/#jurusan"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-3 rounded-full hover:bg-card/10 transition-colors"
              >
                Lihat Jurusan Lain
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MitraIndustri accent="red" />
    </div>
  );
}
