"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import {
  IKON_LANGKAH_PPDB,
  SITE_CONTENT_DEFAULTS,
  type PpdbCtaKonten,
} from "@/lib/site-content";

/**
 * Banner ajakan PPDB di beranda — teks, tombol, dan langkah diatur dari
 * Admin Panel > Konten Situs (`site_contents.ppdb-cta`).
 */
export function CtaPpdb({
  konten = SITE_CONTENT_DEFAULTS["ppdb-cta"],
}: {
  konten?: PpdbCtaKonten;
}) {
  const ref = useAnimeFlowReveal<HTMLElement>({
    direction: "center",
    distance: 0,
  });
  useTiltHover(ref, { maxTilt: 5, scale: 1.015 });
  // Ikon langkah mengikuti urutan (bisa < atau > 3) — default dipakai bila
  // jumlah langkah melebihi daftar ikon.
  const steps = konten.langkah.map((s, i) => ({
    ...s,
    icon: IKON_LANGKAH_PPDB[i] ?? ClipboardList,
  }));
  return (
    <section id="ppdb" ref={ref} className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div
          data-scrub-item
          data-tilt
          className="glass-glare relative overflow-hidden rounded-[2rem] border border-white/50 bg-gradient-to-br from-sky-600/90 via-sky-500/85 to-cyan-500/90 px-6 py-14 text-center shadow-2xl shadow-sky-300/50 backdrop-blur-xl sm:px-12 dark:bg-gradient-to-br dark:from-blue-500/80 dark:via-blue-500/60 dark:to-blue-700/80 dark:shadow-blue-900/50 dark:border-blue-500/50"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 dark:hidden"
          >
            <div className="absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
            <div className="orb-float absolute -left-16 -top-16 h-56 w-56 rounded-full bg-card/20 blur-2xl" />
            <div className="orb-float-delayed absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-sky-900/25 blur-2xl" />
          </div>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-100 dark:text-white/80">
              {konten.eyebrow}
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              {konten.judul}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sky-50 dark:text-white/80">
              {konten.deskripsi}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <span data-magnetic className="inline-flex">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="bg-white/95 hover:bg-white/95 text-sky-800 shadow-lg shadow-sky-900/20"
                >
                  <Link href={konten.cta1.href} className="dark:text-cyan-800">
                    {konten.cta1.label}
                    <ArrowRight />
                  </Link>
                </Button>
              </span>
              <span data-magnetic className="inline-flex">
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/50 bg-card/15 text-white backdrop-blur hover:bg-card/25 hover:text-white"
                >
                  <a href={konten.cta2.href} target="_blank" rel="noopener noreferrer">
                    {konten.cta2.label}
                  </a>
                </Button>
              </span>
            </div>
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
              {steps.map((s, i) => (
                <div
                  key={`${s.judul}-${i}`}
                  data-magnetic
                  className="rounded-2xl border border-white/30 bg-card/15 p-4 backdrop-blur-xl transition-colors hover:bg-card/25"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-card/25 text-white">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">
                    {i + 1}. {s.judul}
                  </p>
                  <p className="mt-1 text-xs text-sky-50 dark:text-white/80">
                    {s.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
