import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExternalImage } from "@/components/external-image";
import { getBeritaBySlug, type BeritaRecord } from "@/lib/berita-server";
import { formatTanggal } from "@/lib/blog";
import { paragrafDariTeks } from "@/lib/jurusan";

/**
 * Halaman detail berita BUATAN ADMIN (tabel `beritas`). Berita yang ditarik
 * otomatis dari WordPress tidak punya halaman ini — kartunya langsung mengarah
 * ke artikel asli di situs sekolah.
 */

export const revalidate = 0;

type Props = { params: Promise<{ slug: string }> };

async function ambil(slug: string): Promise<BeritaRecord | null> {
  const berita = await getBeritaBySlug(slug);
  return berita?.published ? berita : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const berita = await ambil(slug);
  if (!berita) return { title: "Berita tidak ditemukan" };
  return {
    title: `${berita.judul} | SMK Tunas Harapan`,
    description: berita.ringkasan,
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const berita = await ambil(slug);
  if (!berita) notFound();

  const paragraf = paragrafDariTeks(berita.konten);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-gray-950">
      <article className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <Link
          href="/#berita"
          className="inline-flex items-center gap-2 min-h-11 py-2 text-sm font-semibold text-sky-700 hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Kembali ke berita
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>{berita.kategori}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {formatTanggal(berita.tanggal)}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {berita.judul}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {berita.ringkasan}
          </p>
        </header>

        {berita.gambar ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 dark:border-gray-800">
            <ExternalImage
              src={berita.gambar}
              alt={berita.judul}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-5">
          {paragraf.length > 0 ? (
            paragraf.map((p, i) => (
              <p
                key={i}
                className="text-[1.0625rem] leading-relaxed text-slate-700 dark:text-slate-300"
              >
                {p}
              </p>
            ))
          ) : (
            <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-card px-6 py-10 text-center dark:border-gray-800">
              <Newspaper className="h-8 w-8 text-sky-500" aria-hidden />
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Berita ini hanya berupa pengumuman singkat tanpa isi artikel.
              </p>
            </div>
          )}
        </div>

        {berita.sourceUrl || berita.url ? (
          <a
            href={berita.sourceUrl ?? berita.url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
          >
            Baca sumber asli
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : null}
      </article>
    </div>
  );
}
