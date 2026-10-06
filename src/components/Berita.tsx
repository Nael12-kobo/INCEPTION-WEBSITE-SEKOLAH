"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { BLOG_URL, type Berita as BeritaItem } from "@/lib/blog";

/**
 * Fallback kalau API situs resmi (tunasharapan.info) tidak bisa dijangkau —
 * section berita tidak pernah kosong/error di homepage.
 */
const beritaFallback: BeritaItem[] = [
  {
    id: -1,
    kategori: "Prestasi",
    tanggal: "12 Sep 2026",
    judul: "Siswa TJKT juara 1 lomba jaringan tingkat provinsi",
    ringkasan:
      "Tim network school mengalahkan 24 sekolah dalam kompetisi konfigurasi jaringan dan keamanan server.",
    url: BLOG_URL,
    gambar: null,
  },
  {
    id: -2,
    kategori: "Kegiatan",
    tanggal: "28 Agu 2026",
    judul: "Penandatanganan MoU magang dengan 3 perusahaan telekomunikasi",
    ringkasan:
      "Kerja sama pemagangan dan rekrutmen langsung untuk siswa kelas XI dan XII semua jurusan.",
    url: BLOG_URL,
    gambar: null,
  },
  {
    id: -3,
    kategori: "PPDB",
    tanggal: "10 Agu 2026",
    judul: "Beasiswa penuh bagi 20 pendaftar gelombang pertama",
    ringkasan:
      "Beasiswa SPP satu tahun untuk calon siswa berprestasi akademik dan non-akademik.",
    url: BLOG_URL,
    gambar: null,
  },
];

/** Foto dari WP; kalau URL-nya mati/404, jatuh ke placeholder. */
function BeritaImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <BeritaPlaceholder />;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function BeritaPlaceholder() {
  return (
    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-indigo-100">
      <Newspaper className="h-8 w-8 text-sky-300" aria-hidden />
    </div>
  );
}

export function Berita({ posts = [] }: { posts?: BeritaItem[] }) {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 170 });
  useTiltHover(ref, { maxTilt: 9, scale: 1.03 });

  const items = posts.length > 0 ? posts : beritaFallback;

  return (
    <section id="berita" ref={ref} className="overflow-hidden bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Badge variant="secondary" className="glass-chip border-white/60">
              Berita & Kegiatan
            </Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Kabar terbaru dari sekolah
            </h2>
          </div>
          <a
            data-magnetic
            href={BLOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-chip inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm font-semibold text-sky-700 sm:py-2"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="tilt-scene mt-10 grid gap-5 md:grid-cols-3">
          {items.map((b) => (
            <Card
              key={b.id}
              data-scrub-item
              data-tilt
              className="glass glass-hover glass-glare flex flex-col overflow-hidden"
            >
              <div className="h-2.5 bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400" />
              {b.gambar ? (
                <BeritaImage src={b.gambar} alt={b.judul} />
              ) : (
                <BeritaPlaceholder />
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge>{b.kategori}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {b.tanggal}
                  </span>
                </div>
                <CardTitle className="mt-3 line-clamp-2 text-lg leading-snug">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-sky-700"
                  >
                    {b.judul}
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                  {b.ringkasan}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <a
                  data-magnetic
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full px-3 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100/70 hover:text-sky-900 sm:py-1.5"
                >
                  Baca selengkapnya <ArrowRight className="h-4 w-4" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
