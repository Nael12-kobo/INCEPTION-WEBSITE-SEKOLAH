import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Rocket,
} from "lucide-react";
import { ExternalImage } from "@/components/external-image";
import { getJurusanByKode } from "@/lib/jurusan-server";
import {
  IKON_JURUSAN,
  JURUSAN_BAWAAN,
  getWarnaJurusan,
  paragrafDariTeks,
} from "@/lib/jurusan";

/**
 * Halaman detail untuk jurusan TAMBAHAN dari Admin Panel. Empat jurusan
 * bawaan tetap memiliki route statis masing-masing (`/jurusan/PPLG`, dst.)
 * agar dekorasi hero khusus tetap digunakan; konten detailnya dibaca dari DB.
 */

export const revalidate = 0;

type Props = { params: Promise<{ kode: string }> };

/** Jurusan bawaan yang kode-nya cocok tanpa memandang huruf besar/kecil. */
function cariBawaan(kode: string) {
  return JURUSAN_BAWAAN.find(
    (b) => b.kode.toLowerCase() === kode.toLowerCase(),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kode } = await params;
  const bawaan = cariBawaan(kode);
  if (bawaan) {
    return {
      title: `${bawaan.singkatan} — ${bawaan.tagline ?? bawaan.nama}`,
      description: bawaan.deskripsi,
    };
  }

  const jurusan = await getJurusanByKode(kode);
  if (!jurusan || !jurusan.aktif) {
    return { title: "Program Keahlian tidak ditemukan" };
  }
  return {
    title: `${jurusan.singkatan} — ${jurusan.nama} | SMK Tunas Harapan`,
    description: jurusan.deskripsi,
  };
}

export default async function JurusanDetailPage({ params }: Props) {
  const { kode } = await params;

  // Salah ketik huruf besar/kecil (mis. /jurusan/pplg) → teruskan ke halaman
  // statis yang benar, jangan tampilkan 404.
  const bawaan = cariBawaan(kode);
  if (bawaan) redirect(`/jurusan/${bawaan.kode}`);

  const jurusan = await getJurusanByKode(kode);
  if (!jurusan || !jurusan.aktif) notFound();

  const warna = getWarnaJurusan(jurusan.warna);
  // Lookup langsung dari record statis (bukan fungsi) — komponen ikon tidak
  // boleh "dibuat" saat render (lint react-hooks/static-components).
  const Icon = IKON_JURUSAN[jurusan.ikon] ?? GraduationCap;
  const paragraf = paragrafDariTeks(jurusan.tentang);

  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-gray-950">
      {/* Hero */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${warna.hero} text-white`}
      >
        <div className="relative max-w-6xl mx-auto px-6 py-5 sm:py-7 md:py-10">
          <Link
            href="/jurusan"
            className="inline-flex items-center gap-2 py-2.5 min-h-11 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm mb-6">
                <Icon className="size-4" />
                Program Keahlian
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                {jurusan.singkatan}
              </h1>
              {jurusan.tagline ? (
                <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
                  {jurusan.tagline}
                </p>
              ) : null}
              <p className="text-lg text-white/80 max-w-lg">
                {jurusan.nama}
              </p>
            </div>

            <div className="flex-shrink-0 select-none">
              {jurusan.gambar ? (
                <ExternalImage
                  src={jurusan.gambar}
                  alt={`Ilustrasi ${jurusan.singkatan}`}
                  className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain rounded-3xl bg-white/10 p-2 backdrop-blur-sm"
                />
              ) : (
                <span className="flex h-44 w-44 md:h-64 md:w-64 lg:h-72 lg:w-72 items-center justify-center rounded-[2.5rem] bg-white/10 backdrop-blur-sm">
                  <Icon className="h-20 w-20 md:h-28 md:w-28" aria-hidden />
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tentang + keunggulan */}
      <section className="py-16 md:py-20 bg-card dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Tentang {jurusan.singkatan}
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {paragraf.length > 0 ? (
                  paragraf.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p>{jurusan.deskripsi}</p>
                )}
              </div>
            </div>

            {jurusan.keunggulan.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap className="size-5 text-emerald-600" />
                  Keunggulan Jurusan
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700">
                  <ul className="space-y-3">
                    {jurusan.keunggulan.map((item, index) => (
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
            )}
          </div>
        </div>
      </section>

      {/* Kompetensi keahlian */}
      {jurusan.kompetensi.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Kompetensi yang Dipelajari
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Kurikulum {jurusan.singkatan} mencakup materi berikut
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jurusan.kompetensi.map((item, index) => (
                <div
                  key={index}
                  className="bg-card dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border dark:border-gray-700"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${warna.bg} ${warna.teks} flex items-center justify-center mb-4`}
                  >
                    <span className="text-lg font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.judul}
                  </h3>
                  {item.deskripsi ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {item.deskripsi}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prospek karir */}
      {jurusan.karir.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                Prospek Karir
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Lulusan {jurusan.singkatan} memiliki peluang karir yang luas di
                industri
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jurusan.karir.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-card dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border dark:border-gray-700 hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${warna.bg} ${warna.teks} flex items-center justify-center mb-4`}
                  >
                    <Rocket className="size-5" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {item.pekerjaan}
                  </h3>
                  {item.gaji ? (
                    <p className={`text-sm ${warna.aksen} font-medium`}>
                      {item.gaji}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 bg-card dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={`bg-gradient-to-br ${warna.hero} rounded-3xl p-8 md:p-12 text-white text-center`}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Tertarik dengan Jurusan {jurusan.singkatan}?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              {jurusan.deskripsi}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/ppdb"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold px-8 py-3 rounded-full hover:bg-slate-100 transition-colors shadow-lg"
              >
                Daftar PPDB
                <ChevronRight className="size-5" />
              </Link>
              <Link
                href="/jurusan"
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
