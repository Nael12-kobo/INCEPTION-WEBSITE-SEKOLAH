"use client";

import Image from "next/image";
import {
  Bookmark,
  CheckCircle2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Quote,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalImage } from "@/components/external-image";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { SITE_CONTENT_DEFAULTS, type ProfilKonten } from "@/lib/site-content";
import { InstagramIcon } from "@/components/ui/instagram-icon";

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

          <Card
            data-tilt
            className="glass glass-hover glass-glare relative mt-8 w-full max-w-md self-center overflow-hidden"
          >
            <CardContent className="p-7 text-center">
              <span
                data-magnetic
                className="glass-chip mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
              >
                <Quote className="h-6 w-6 text-sky-500" />
              </span>
              <blockquote className="mt-3 text-lg font-medium leading-relaxed text-slate-800">
                {konten.testimoni.teks}
              </blockquote>
              <div className="mt-6 flex items-center justify-center gap-3 text-left">
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

        <div
          data-scrub-item
          data-scrub-dir="right"
          className="flex h-full items-start justify-center"
        >
          <article className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900  dark:text-black shadow-xl shadow-slate-900/10">
            <header className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 p-0.5">
                <span className="flex h-full w-full items-center justify-center rounded-full bg-white p-1">
                  <Image
                    src="/images/TTH.png"
                    alt=""
                    width={28}
                    height={28}
                    className="h-full w-full object-contain"
                  />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">@smk_tth</p>
                <p className="text-xs text-slate-500">SMK Telekomunikasi Tunas Harapan</p>
              </div>
              <InstagramIcon className="h-5 w-5 text-slate-500" />
              <MoreHorizontal className="h-5 w-5 text-slate-500" aria-hidden />
            </header>

            <div className="relative aspect-[9/14] overflow-hidden bg-slate-100">
              <video
                className="h-full w-full object-cover"
                src="/animated/TiktokRemastered-optimized.mp4"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
                aria-label="Video Reels SMK Telekomunikasi Tunas Harapan"
              />
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <Heart className="h-5 w-5" aria-label="Suka" />
                <MessageCircle className="h-5 w-5" aria-label="Komentar" />
                <Send className="h-5 w-5" aria-label="Bagikan" />
                <Bookmark className="ml-auto h-5 w-5" aria-label="Simpan" />
              </div>
              <p className="mt-3 text-sm leading-relaxed">
                <span className="font-bold">@smk_tth</span>{" "}
                Membangun generasi kreatif, terampil, dan siap menghadapi masa depan.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
