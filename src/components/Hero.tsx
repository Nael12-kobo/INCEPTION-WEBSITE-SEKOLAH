"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { ArrowRight, Award, PlayCircle, Signal, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { SITE_CONTENT_DEFAULTS, type HeroKonten } from "@/lib/site-content";

/** Posisi kartu statistik melayang (mengikuti urutan, diputar tiap 4). */
const POSISI_KARTU = [
  "-left-10 top-6 sm:left-15",
  "-right-3 bottom-16 sm:right-12",
  "left-4 bottom-4 sm:left-15",
  "right-4 top-4 sm:right-12",
];

/**
 * Huruf per-karakter untuk animasi `data-hero-letter`.
 *
 * Dua aturan pemecahan baris yang saling melengkapi:
 *
 * 1. Tiap KATA dibungkus `whitespace-nowrap`. Huruf per-karakter tadi tetap
 *    `inline-block`, dan tanpa pembungkus ini browser boleh memotong di
 *    tengah kata ("SMK Telek | omunikasi") karena setiap huruf = satu
 *    atomic inline.
 * 2. Spasi antar kata dirender sebagai text node biasa, BUKAN NBSP
 *    ("\u00A0"). NBSP membuat "SMK Telekomunikasi" jadi satu token yang
 *    tidak bisa dipecah → di layar 360–412px judul meluber keluar frame
 *    (section-nya `overflow-hidden`). Spasi biasa tetap menyediakan peluang
 *    wrap antar kata.
 */
function AnimatedTitle({ text, prefix }: { text: string; prefix: string }) {
  const words = text.split(" ").filter((word) => word.length > 0);

  return (
    <>
      {words.map((word, w) => (
        <Fragment key={`${prefix}-${w}`}>
          {w > 0 ? " " : null}
          <span className="whitespace-nowrap">
            {word.split("").map((ch, i) => (
              <span
                key={`${prefix}-${w}-${i}`}
                data-hero-letter
                className="inline-block will-change-transform"
              >
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </>
  );
}

/**
 * Hero beranda. Teks & CTA datang dari Admin Panel > Konten Situs
 * (`site_contents.hero`); nilai default ada di src/lib/site-content.ts.
 */
export function Hero({
  konten = SITE_CONTENT_DEFAULTS.hero,
}: {
  konten?: HeroKonten;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const contentRef = useAnimeFlowReveal<HTMLDivElement>({
    direction: "alternate",
    distance: 180,
  });
  useTiltHover(contentRef, { maxTilt: 35, scale: 1.02 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const letters = root.querySelectorAll<HTMLElement>("[data-hero-letter]");
    const fades = root.querySelectorAll<HTMLElement>("[data-hero-fade]");
    const image = root.querySelector<HTMLElement>("[data-hero-image]");
    const blobs = root.querySelectorAll<HTMLElement>("[data-hero-blob]");
    const animations: ReturnType<typeof animate>[] = [];

    animations.push(
      animate(letters, {
        opacity: [0, 1],
        translateY: [36, 0],
        rotateX: [-70, 0],
        duration: 700,
        delay: stagger(25),
        ease: "outExpo",
      }),
    );
    animations.push(
      animate(fades, {
        opacity: [0, 1],
        translateY: [22, 0],
        duration: 800,
        delay: stagger(130, { start: 350 }),
        ease: "outCubic",
      }),
    );
    if (image) {
      animations.push(
        animate(image, {
          opacity: [0, 1],
          translateX: [48, 0],
          scale: [0.96, 1],
          duration: 1000,
          delay: 300,
          ease: "outExpo",
        }),
      );
    }
    if (blobs.length > 0) {
      animations.push(
        animate(blobs, {
          translateY: [-18, 18],
          duration: 4200,
          delay: stagger(600),
          ease: "inOutSine",
          alternate: true,
          loop: true,
        }),
      );
    }
    return () => {
      animations.forEach((a) => a.revert());
    };
  }, []);

  return (
    <section
      id="beranda"
      ref={rootRef}
      className="relative overflow-hidden bg-transparent"
    >
      {/* dekorasi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
      >
        <div className="absolute inset-0 bg-grid-sky [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]" />
        <div
          data-hero-blob
          className="absolute -top-24 right-[8%] h-72 w-72 rounded-full bg-sky-200/60 blur-3xl"
        />
        <div
          data-hero-blob
          className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-cyan-100/80 blur-3xl"
        />
        <div
          data-hero-blob
          className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl"
        />
      </div>

      <div
        ref={contentRef}
        className="tilt-scene relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-2 lg:pb-28 lg:pt-24"
      >
        {/* Kolom teks */}
        <div data-scrub-item data-scrub-dir="left">
          <Badge data-hero-fade variant="outline" className="glass-chip mb-5">
            <Signal className="h-3.5 w-3.5 text-sky-600" />
            {konten.badge}
          </Badge>

          <h1 className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="block" aria-label={konten.judulAtas.trim()}>
              <AnimatedTitle text={konten.judulAtas} prefix="top" />
            </span>
            <span
              className="block bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 bg-clip-text dark:to-blue-500"
              aria-label={konten.judulBawah}
            >
              <AnimatedTitle text={konten.judulBawah} prefix="bottom" />
            </span>
          </h1>

          <p
            data-hero-fade
            className="mt-5 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            {konten.deskripsi}
          </p>

          <div
            data-hero-fade
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <span data-magnetic className="inline-flex">
              <Button size="lg" asChild className="shadow-lg shadow-sky-300/50">
                <Link href={konten.cta1.href} className="dark:text-white">
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
                className="glass-chip"
              >
                <Link href={konten.cta2.href}>
                  <PlayCircle />
                  {konten.cta2.label}
                </Link>
              </Button>
            </span>
          </div>

          <div data-hero-fade className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {konten.chips.map((chip) => (
              <div
                key={`${chip.nilai}-${chip.label}`}
                data-magnetic
                className="glass-chip glass-hover flex items-center gap-2.5 rounded-2xl px-3 py-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-extrabold text-white shadow-md shadow-sky-300/50 dark:to-blue-500">
                  {chip.nilai === "100%" ? <Award className="h-4 w-4" /> : chip.nilai}
                </span>
                <span className="text-sm font-medium text-slate-600">{chip.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom gambar */}
        {/* Kolom gambar. Jangan pakai `translate-x-50`: di Tailwind v4 itu
            = 200px (spacing × 50), bukan 50% — gambar keluar frame di HP. */}
        <div>
          <div
            data-scrub-item
            data-scrub-dir="right"
            data-tilt
            className="relative hidden min-h-[38rem] lg:block translate-x-8"
          >
            <div
              className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              <Loader2
                strokeWidth={2}
                className="m-auto absolute size-180 animate-[spin_10s_linear_infinite] text-sky-400/50 dark:text-sky-400/80 justify-center items-center opacity-75"
                style={{ translate: "0 0 -74px" }}
              />
              <Loader2
                strokeWidth={2}
                className="m-auto absolute size-140 animate-[spin_20s_linear_infinite_reverse] text-sky-400/20 justify-center items-center opacity-75"
                style={{ translate: "0 0 -48px" }}
              />

              <Loader2
                strokeWidth={2}
                className="m-auto absolute size-160 animate-[spin_15s_linear_infinite_reverse] text-sky-400/80 justify-center items-center opacity-75"
                style={{ translate: "0 0 0px" }}
              />
              <Loader2
                strokeWidth={1}
                className="m-auto absolute size-180 animate-[spin_30s_linear_infinite_reverse] text-yellow-800/20 dark:text-yellow-500/40 justify-center items-center opacity-75"
                style={{ translate: "0 0 24px" }}
              />
              <Loader2
                strokeWidth={1.25}
                className="m-auto absolute size-160 animate-[spin_20s_linear_infinite] text-yellow-400/60 dark:text-yellow-500/80 justify-center items-center text-shadow-lg opacity-75"
                style={{ translate: "0 0 48px" }}
              />

              <div className="w-16 h-16 absolute rounded-full outline-offset-240 outline-dashed outline-2 outline-yellow-300/80 animate-[spin_120s_linear_infinite] opacity-75"></div>
              <div className="w-16 h-16 absolute rounded-full outline-offset-280 outline-dashed outline-3 outline-sky-400/80 animate-[spin_60s_linear_infinite_reverse] opacity-75"></div>
            </div>
            <Image
              src="/images/TTH.png"
              alt="Logo SMK Telekomunikasi Tunas Harapan"
              width={300}
              height={300}
              unoptimized
              loading="eager"
              className="absolute left-1/2 top-1/2 z-20 block h-auto w-[300px] max-w-[75%] bottom-50000 -translate-x-1/2 -translate-y-1/2 select-none brightness-50 pointer-events-none object-contain drop-shadow"
              style={{ translate: "-150px -150px -25px" }}
            />
            <Image
              src="/images/TTH.png"
              alt="Logo SMK Telekomunikasi Tunas Harapan"
              width={300}
              height={300}
              unoptimized
              loading="eager"
              className="absolute left-1/2 top-1/2 z-20 block h-auto w-[300px] max-w-[75%] -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none object-contain drop-shadow"
            />
            {konten.kartu.map((kartu, i) => (
              <div
                key={`${kartu.nilai}-${kartu.label}`}
                data-magnetic
                className={`glass-strong absolute rounded-2xl px-4 py-3 ${POSISI_KARTU[i % POSISI_KARTU.length]}`}
                style={{ translate: "0 0 64px" }}
              >
                <p className="text-2xl font-extrabold text-sky-700">{kartu.nilai}</p>
                <p className="text-xs font-medium text-slate-500">{kartu.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
