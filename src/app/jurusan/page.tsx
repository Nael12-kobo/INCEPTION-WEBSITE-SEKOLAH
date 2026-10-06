import Link from "next/link";
import { ChevronRight, Code2, Wifi, Palette, Wrench } from "lucide-react";

const jurusan = [
  {
    nama: "PPLG",
    deskripsi: "Pemrograman Perangkat Lunak & Gim",
    icon: "💻",
    color: "purple",
    href: "/jurusan/PPLG",
    lucide: <Code2 className="size-5" />,
    detail:
      "Belajar pemrograman web, mobile, gim, UI/UX, dan cloud computing. Siap jadi developer profesional.",
  },
  {
    nama: "TJKT",
    deskripsi: "Teknologi Jaringan Komputer & Telekomunikasi",
    icon: "🌐",
    color: "cyan",
    href: "/jurusan/TJKT",
    lucide: <Wifi className="size-5" />,
    detail:
      "Kuasai jaringan komputer, cybersecurity, telekomunikasi, dan cloud computing. Jadi ahli infrastruktur IT.",
  },
  {
    nama: "DKV",
    deskripsi: "Desain Komunikasi Visual",
    icon: "🎨",
    color: "pink",
    href: "/jurusan/DKV",
    lucide: <Palette className="size-5" />,
    detail:
      "Asah kreativitas di desain grafis, UI/UX, motion graphics, fotografi, dan branding.",
  },
  {
    nama: "TKRO",
    deskripsi: "Teknik Kendaraan Ringan Otomotif",
    icon: "🔧",
    color: "orange",
    href: "/jurusan/TKRO",
    lucide: <Wrench className="size-5" />,
    detail:
      "Jadi teknisi otomotif profesional. Kuasai mesin, kelistrikan, diagnostik, dan teknologi EV.",
  },
];

const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/50",
    text: "text-purple-600 dark:text-purple-400",
    border: "hover:border-purple-300 dark:hover:border-purple-600",
    hover: "group-hover:bg-purple-600",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-900/50",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "hover:border-cyan-300 dark:hover:border-cyan-600",
    hover: "group-hover:bg-cyan-600",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-900/50",
    text: "text-pink-600 dark:text-pink-400",
    border: "hover:border-pink-300 dark:hover:border-pink-600",
    hover: "group-hover:bg-pink-600",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-600 dark:text-orange-400",
    border: "hover:border-orange-300 dark:hover:border-orange-600",
    hover: "group-hover:bg-orange-600",
  },
};

export default function JurusanPage() {
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Program Keahlian
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            SMK Telekomunikasi Tunas Harapan menyediakan 4 program keahlian
            unggulan yang siap mencetak lulusan profesional dan berkompetensi.
          </p>
        </div>
      </section>

      {/* List Jurusan */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jurusan.map((j) => {
              const colors = colorClasses[j.color];
              return (
                <Link
                  key={j.nama}
                  href={j.href}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border dark:border-gray-700 ${colors.border}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0 transition-colors ${colors.hover} group-hover:text-white`}
                    >
                      <span className="text-3xl">{j.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {j.nama}
                        </h3>
                        <ChevronRight className="size-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {j.deskripsi}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {j.detail}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Masih Bingung Memilih?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Tanyakan langsung kepada AI Asisten kami untuk rekomendasi jurusan
            yang sesuai dengan minat dan bakatmu!
          </p>
          <Link
            href="/asisten"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
          >
            Tanya AI Asisten
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
