"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { ExternalImage } from "@/components/external-image";
import { BLOG_URL, type Berita as BeritaItem } from "@/lib/blog";

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

/**
 * Foto buatan admin — URL domain bebas, jadi ditampilkan tanpa optimizer
 * Next (lihat src/components/external-image.tsx).
 */
function BeritaImageEksternal({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <BeritaPlaceholder />;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
      <ExternalImage
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function BeritaPlaceholder() {
  return (
    <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-sky-100 via-card to-indigo-100 dark:to-indigo-950/10">
      <Newspaper className="h-8 w-8 text-sky-300" aria-hidden />
    </div>
  );
}

/** URL internal (`/berita/...`) dibuka di tab yang sama; sisanya tab baru. */
function isInternal(url: string): boolean {
  return url.startsWith("/") && !url.startsWith("//");
}

export function Berita({ posts = [] }: { posts?: BeritaItem[] }) {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 170 });
  useTiltHover(ref, { maxTilt: 9, scale: 1.03 });

  return (
    <section id="berita" ref={ref} className="overflow-hidden bg-blue-300/15 dark:bg-black/25">
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

        {posts.length > 0 ? (
          <div className="tilt-scene mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((b) => {
              const internal = isInternal(b.url);
              return (
                <Card
                  key={`${b.sumber}-${b.id}`}
                  data-scrub-item
                  data-tilt
                  className="glass glass-hover glass-glare flex flex-col overflow-hidden"
                >
                  <div className="h-2.5 bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400 dark:to-blue-400" />
                  {b.gambar ? (
                    b.sumber === "manual" ? (
                      <BeritaImageEksternal src={b.gambar} alt={b.judul} />
                    ) : (
                      <BeritaImage src={b.gambar} alt={b.judul} />
                    )
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
                      {internal ? (
                        <Link
                          href={b.url}
                          className="transition-colors hover:text-sky-700"
                        >
                          {b.judul}
                        </Link>
                      ) : (
                        <a
                          href={b.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-sky-700"
                        >
                          {b.judul}
                        </a>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                      {b.ringkasan}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    {internal ? (
                      <Link
                        data-magnetic
                        href={b.url}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100/70 hover:text-sky-900 sm:py-1.5"
                      >
                        Baca selengkapnya <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <a
                        data-magnetic
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full px-3 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100/70 hover:text-sky-900 sm:py-1.5"
                      >
                        Baca selengkapnya <ArrowRight className="h-4 w-4" />
                      </a>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div
            data-scrub-item
            className="mt-10 flex flex-col items-center rounded-3xl border border-sky-100 bg-card/70 px-6 py-10 text-center shadow-sm sm:py-12"
            role="status"
          >
            <Newspaper className="h-9 w-9 text-sky-500" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Berita belum dapat dimuat
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
              Kunjungi situs berita resmi sekolah untuk membaca kabar terbaru.
            </p>
            <a
              href={BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              Buka berita resmi <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
