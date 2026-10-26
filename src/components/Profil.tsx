"use client";

import Image from "next/image";
import { CheckCircle2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalImage } from "@/components/external-image";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { SITE_CONTENT_DEFAULTS, type ProfilKonten } from "@/lib/site-content";

/**
 * Section profil beranda (ringkasan sekolah, poin visi-misi, testimoni) —
 * diedit lewat Admin Panel > Konten Situs (`site_contents.profil`).
 */
export function Profil({
  konten = SITE_CONTENT_DEFAULTS.profil,
}: {
  konten?: ProfilKonten;
}) {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "alternate", distance: 170 });
  useTiltHover(ref, { maxTilt: 7, scale: 1.02 });
  return (
    <section id="profil" ref={ref} className="relative overflow-hidden bg-blue-300/15 dark:bg-black/25">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-violet-300/50 blur-3xl dark:hidden"
      />
      <div className="tilt-scene relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div data-scrub-item data-scrub-dir="left">
          <Badge variant="secondary" className="glass-chip border-white/60">
            {konten.badge}
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {konten.judulAwal}{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent dark:to-blue-500">
              {konten.judulAccent}
            </span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            {konten.paragraf}
          </p>
          <ul className="mt-6 space-y-3">
            {konten.poin.map((v) => (
              <li
                key={v}
                data-magnetic
                className="glass glass-hover flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <Card
          data-scrub-item
          data-scrub-dir="right"
          data-tilt
          className="glass glass-hover glass-glare relative overflow-hidden"
        >
          <CardContent className="p-7">
            <span
              data-magnetic
              className="glass-chip flex h-12 w-12 items-center justify-center rounded-2xl"
            >
              <Quote className="h-6 w-6 text-sky-500" />
            </span>
            <blockquote className="mt-3 text-lg font-medium leading-relaxed text-slate-800">
              {konten.testimoni.teks}
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              {/* Foto bisa path lokal atau URL bebas — URL eksternal tidak
                  lewat optimizer Next (lihat src/components/external-image.tsx). */}
              {konten.testimoni.foto.startsWith("http") ? (
                <ExternalImage
                  src={konten.testimoni.foto}
                  alt={`Foto ${konten.testimoni.nama}`}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <Image
                  src={konten.testimoni.foto}
                  alt={`Foto ${konten.testimoni.nama}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm font-bold text-slate-900">{konten.testimoni.nama}</p>
                <p className="text-xs text-slate-500">{konten.testimoni.peran}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
