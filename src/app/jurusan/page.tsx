import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getJurusanAktif } from "@/lib/jurusan-server";
import { getIkonJurusan, getWarnaJurusan } from "@/lib/jurusan";

export const metadata: Metadata = {
  title: "Program Keahlian — SMK Telekomunikasi Tunas Harapan",
  description:
    "Jelajahi seluruh program keahlian di SMK Telekomunikasi Tunas Harapan.",
};

// Konten bisa ditambah/diubah admin → render per request, jangan di-cache
// hasil build (revalidatePath di API admin juga sudah membersihkan cache).
export const revalidate = 0;

export default async function JurusanPage() {
  // Bawaan (PPLG, TJKT, DKV, TKRO) digabung jurusan tambahan dari database.
  const jurusan = await getJurusanAktif();

  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Program Keahlian
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            SMK Telekomunikasi Tunas Harapan menyediakan {jurusan.length}{" "}
            program keahlian unggulan yang siap mencetak lulusan profesional
            dan berkompetensi.
          </p>
        </div>
      </section>

      {/* List Jurusan */}
      <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jurusan.map((j) => {
              const warna = getWarnaJurusan(j.warna);
              const Icon = getIkonJurusan(j.ikon);
              return (
                <Link
                  key={j.kode}
                  href={`/jurusan/${j.kode}`}
                  className={`group bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border dark:border-gray-700 ${warna.border}`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${warna.bg} ${warna.teks} flex items-center justify-center flex-shrink-0 transition-colors ${warna.hover} group-hover:text-white`}
                    >
                      <Icon className="size-7" aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {j.singkatan} — {j.nama}
                        </h3>
                        <ChevronRight className="size-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        {j.tagline ?? j.singkatan}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {j.deskripsi}
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
      <section className="py-16 md:py-20 bg-card dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Masih Bingung Memilih?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
            Tanyakan langsung kepada AI Asisten kami untuk rekomendasi jurusan
            yang sesuai dengan minat dan bakatmu!
          </p>
          <Link
            href="/chat"
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
