"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useIsDesktop } from "@/hooks/useIsDesktop";

export interface FasilitasVideo {
  /** Path video scrub, mis. "/animated/facility/perpustakaan.webm" */
  src: string;
  /** Poster JPG fallback, mis. "/images/fasilitas/perpustakaan.jpg" */
  poster: string;
  label: string;
  alt: string;
  description: string;
  /** Detik timeline untuk cursor di tepi kiri card. */
  xmin: number;
  /** Detik timeline untuk cursor di tengah card (posisi netral). */
  xmid: number;
  /** Detik timeline untuk cursor di tepi kanan card. */
  xmax: number;
}

interface FasilitasVideoCardProps {
  item: FasilitasVideo;
  onOpen: () => void;
}

/**
 * Petakan posisi X ternormalisasi (0..1) ke detik timeline secara linear.
 * nx = 0 -> xmin, nx = 0.5 -> xmid, nx = 1 -> xmax.
 * Tanpa easing/smoothing: 1:1 mengikuti cursor.
 */
function mapNxToTime(nx: number, xmin: number, xmid: number, xmax: number): number {
  const clamped = Math.min(1, Math.max(0, nx));
  if (clamped <= 0.5) return xmin + (xmid - xmin) * (clamped / 0.5);
  return xmid + (xmax - xmid) * ((clamped - 0.5) / 0.5);
}

const SEEK_EPS = 0.008;
const DURATION_EPS = 0.05;
/** Durasi tween masuk & keluar (simetris): glide posisi <-> cursor/xmid. */
const TWEEN_MS = 350;

/** Kurva tween: mulai cepat, mendarat halus. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Minta satu frame target bila data sudah ter-buffer.
 * Memakai `fastSeek` (Chrome/Edge) yang dirancang untuk scrubbing,
 * fallback ke `currentTime` (Safari/Firefox).
 */
function requestSeek(video: HTMLVideoElement, time: number): void {
  if (video.readyState < 1 || !Number.isFinite(video.duration)) return;
  const t = Math.min(Math.max(0, time), Math.max(0, video.duration - DURATION_EPS));
  if (Math.abs(video.currentTime - t) <= SEEK_EPS) return;
  if (!isBuffered(video, t)) return;
  try {
    const seeker = video as HTMLVideoElement & { fastSeek?: (t: number) => void };
    if (typeof seeker.fastSeek === "function") seeker.fastSeek(t);
    else video.currentTime = t;
  } catch {
    try {
      video.currentTime = t;
    } catch {
      /* abaikan seek yang gagal */
    }
  }
}

function isBuffered(video: HTMLVideoElement, time: number): boolean {
  try {
    const ranges = video.buffered;
    for (let i = 0; i < ranges.length; i += 1) {
      if (time >= ranges.start(i) && time <= ranges.end(i)) return true;
    }
  } catch {
    /* abaikan */
  }
  return rangesFallback(video);
}

/** Bila API buffered belum tersedia, izinkan seek saat siap diputar penuh. */
function rangesFallback(video: HTMLVideoElement): boolean {
  return video.readyState >= 4;
}

/**
 * Kartu fasilitas berbasis video WebM yang di-scrub 1:1 mengikuti posisi X
 * cursor — tanpa smoothing temporal. Video tidak pernah di-play; hanya seek.
 * Saat pointer enter, timeline di-tween dulu dari posisi saat ini ke posisi
 * cursor live (350ms easeOut); saat pointer exit, di-tween kembali ke xmid.
 * Masuk lagi di tengah tween keluar -> tween dibatalkan dan diganti tween
 * masuk baru dari posisi glide saat itu. Baru setelah tween masuk selesai,
 * scrub hover 1:1 berjalan.
 * Seek dijalankan serial (satu per satu via event `seeked`) dan ditulis
 * maksimal 1x per frame agar antrean seek basi tidak menumpuk.
 * Di viewport mobile (< lg) hanya poster JPG yang dirender — webm tidak
 * di-fetch sama sekali. Jika webm gagal load, fallback ke poster JPG.
 */
export function FasilitasVideoCard({ item, onOpen }: FasilitasVideoCardProps) {
  const { src, poster, label, alt, xmin, xmid, xmax } = item;
  // Default false saat SSR: render pertama (server + mobile) selalu JPG,
  // nol byte webm diunduh sebelum terbukti desktop.
  const isDesktop = useIsDesktop();
  const figureRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetRef = useRef<number>(xmid);
  const seekingRef = useRef<boolean>(false);
  const throttleRef = useRef<number>(0);
  const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef<number>(NaN);
  // State tween dua arah (masuk/keluar), semua via ref tanpa re-render.
  const enterRafRef = useRef<number>(0);
  const enterActiveRef = useRef<boolean>(false);
  const tweenModeRef = useRef<"enter" | "exit">("enter");
  const enterFromRef = useRef<number>(xmid);
  const enterToRef = useRef<number>(xmid);
  const enterStartRef = useRef<number>(0);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // Gagal load hanya berlaku untuk src yang sedang aktif; ganti src otomatis reset.
  const videoFailed = failedSrc === src;
  const useVideo = isDesktop && !videoFailed;

  /** Nilai efektif yang sudah di-clamp ke durasi aktual (bila metadata siap). */
  const resolveBounds = useCallback(() => {
    const duration = durationRef.current;
    if (!Number.isFinite(duration) || duration <= 0) {
      return { xmin, xmid, xmax };
    }
    const max = Math.max(0, duration - DURATION_EPS);
    return {
      xmin: Math.min(Math.max(0, xmin), max),
      xmid: Math.min(Math.max(0, xmid), max),
      xmax: Math.min(Math.max(0, xmax), max),
    };
  }, [xmin, xmid, xmax]);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  /** Kirim seek ke target terbaru bila tidak ada seek yang sedang berjalan. */
  const flushSeekRef = useRef<() => void>(() => undefined);
  const flushSeek = useCallback(() => {
    if (seekingRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < 1 || !Number.isFinite(video.duration)) return;
    const t = Math.min(
      Math.max(0, targetRef.current),
      Math.max(0, video.duration - DURATION_EPS),
    );
    if (Math.abs(video.currentTime - t) <= SEEK_EPS) return;
    if (!isBuffered(video, t)) return;
    seekingRef.current = true;
    requestSeek(video, t);
    // Pengaman: bila event `seeked` tidak kunjung datang, jangan kunci
    // selamanya — target terbaru selalu menang atas seek yang macet.
    // (Via ref agar tidak self-reference `useCallback`.)
    clearWatchdog();
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null;
      seekingRef.current = false;
      flushSeekRef.current();
    }, 250);
  }, [clearWatchdog]);

  useEffect(() => {
    flushSeekRef.current = flushSeek;
  }, [flushSeek]);

  /** Tulis maksimal 1x per frame: gabungkan 120+ event mousemove per detik. */
  const scheduleFlush = useCallback(() => {
    if (!throttleRef.current) {
      throttleRef.current = requestAnimationFrame(() => {
        throttleRef.current = 0;
        flushSeek();
      });
    }
  }, [flushSeek]);

  /**
   * Batalkan tween (masuk maupun keluar) yang sedang berjalan.
   * Dipakai saat arah berbalik (leave/enter), unmount, dan ganti src.
   */
  const cancelEnterTween = useCallback(() => {
    if (enterRafRef.current) {
      cancelAnimationFrame(enterRafRef.current);
      enterRafRef.current = 0;
    }
    enterActiveRef.current = false;
  }, []);

  /**
   * Satu frame tween dua arah. Menulis via flushSeek (seek serial yang sama
   * seperti hover), jadi tidak ada jalur seek baru yang bisa menumpuk.
   * - mode "enter": destinasi live mengikuti cursor; selesai -> handover hover.
   * - mode "exit": destinasi tetap xmid; selesai -> idle parkir.
   * (Via ref agar tidak self-reference `useCallback`.)
   */
  const enterTickRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    enterTickRef.current = () => {
      const p = Math.min(1, (performance.now() - enterStartRef.current) / TWEEN_MS);
      const e = easeOutCubic(p);
      targetRef.current =
        enterFromRef.current + (enterToRef.current - enterFromRef.current) * e;
      flushSeek();
      if (p >= 1) {
        enterRafRef.current = 0;
        enterActiveRef.current = false;
        // Mode enter: targetRef sudah sinkron dengan cursor terakhir,
        // handover ke scrub 1:1 tanpa seek tambahan. Mode exit: parkir di xmid.
        return;
      }
      enterRafRef.current = requestAnimationFrame(() => enterTickRef.current());
    };
  }, [flushSeek]);

  useEffect(() => {
    const figure = figureRef.current;
    if (!figure || !useVideo) return;

    const onMove = (e: MouseEvent) => {
      const bounds = resolveBounds();
      const r = figure.getBoundingClientRect();
      if (r.width <= 0) return;
      const t = mapNxToTime(
        (e.clientX - r.left) / r.width,
        bounds.xmin,
        bounds.xmid,
        bounds.xmax,
      );
      // Selama tween masuk: destinasi live mengikuti cursor.
      if (enterActiveRef.current && tweenModeRef.current === "enter") {
        enterToRef.current = t;
        return;
      }
      targetRef.current = t;
      scheduleFlush();
    };
    const onEnter = (e: MouseEvent) => {
      // Batalkan tween keluar bila re-enter di tengah glide, lalu buka
      // tween masuk baru dari posisi timeline saat ini (idle = xmid).
      cancelEnterTween();
      seekingRef.current = false;
      const bounds = resolveBounds();
      const r = figure.getBoundingClientRect();
      const entry =
        r.width > 0
          ? mapNxToTime(
              (e.clientX - r.left) / r.width,
              bounds.xmin,
              bounds.xmid,
              bounds.xmax,
            )
          : bounds.xmid;
      const video = videoRef.current;
      const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // Tanpa glide bila: user minta reduced-motion, video belum siap,
      // target belum ter-buffer, atau sudah di posisi masuk (jarak ~0).
      if (
        reduceMotion ||
        !video ||
        !isBuffered(video, entry) ||
        Math.abs(entry - targetRef.current) <= SEEK_EPS
      ) {
        targetRef.current = entry;
        scheduleFlush();
        return;
      }
      // Tween dulu dari posisi saat ini ke posisi cursor live,
      // baru setelah itu kode hover 1:1 berjalan.
      tweenModeRef.current = "enter";
      enterActiveRef.current = true;
      enterFromRef.current = targetRef.current;
      enterToRef.current = entry;
      enterStartRef.current = performance.now();
      enterRafRef.current = requestAnimationFrame(() => enterTickRef.current());
    };
    const onLeave = () => {
      // Batalkan tween masuk bila keluar di tengah glide,
      // lalu tween kembali ke posisi netral (xmid).
      cancelEnterTween();
      clearWatchdog();
      seekingRef.current = false;
      const xmidT = resolveBounds().xmid;
      const video = videoRef.current;
      const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (
        reduceMotion ||
        !video ||
        !isBuffered(video, xmidT) ||
        Math.abs(xmidT - targetRef.current) <= SEEK_EPS
      ) {
        // Snap langsung ke posisi netral (xmid).
        // Seek yang sedang berjalan digantikan: target terbaru selalu menang.
        targetRef.current = xmidT;
        if (video) requestSeek(video, xmidT);
        return;
      }
      tweenModeRef.current = "exit";
      enterActiveRef.current = true;
      enterFromRef.current = targetRef.current;
      enterToRef.current = xmidT;
      enterStartRef.current = performance.now();
      enterRafRef.current = requestAnimationFrame(() => enterTickRef.current());
    };

    figure.addEventListener("mouseenter", onEnter);
    figure.addEventListener("mousemove", onMove);
    figure.addEventListener("mouseleave", onLeave);
    return () => {
      figure.removeEventListener("mouseenter", onEnter);
      figure.removeEventListener("mousemove", onMove);
      figure.removeEventListener("mouseleave", onLeave);
      if (throttleRef.current) {
        cancelAnimationFrame(throttleRef.current);
        throttleRef.current = 0;
      }
      cancelEnterTween();
      clearWatchdog();
      seekingRef.current = false;
    };
  }, [useVideo, resolveBounds, scheduleFlush, clearWatchdog, cancelEnterTween]);

  // Reset posisi parkir per item (hanya ref, tanpa setState).
  useEffect(() => {
    durationRef.current = NaN;
    targetRef.current = xmid;
    seekingRef.current = false;
    cancelEnterTween();
    clearWatchdog();
  }, [src, xmid, clearWatchdog, cancelEnterTween]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    durationRef.current = video.duration;
    try {
      video.pause();
    } catch {
      /* abaikan */
    }
    const bounds = resolveBounds();
    targetRef.current = bounds.xmid;
    try {
      video.currentTime = bounds.xmid;
    } catch {
      /* abaikan */
    }
  }, [resolveBounds]);

  /** Seek selesai -> langsung kirim target terbaru bila cursor sudah pindah. */
  const handleSeeked = useCallback(() => {
    clearWatchdog();
    seekingRef.current = false;
    flushSeek();
  }, [flushSeek, clearWatchdog]);

  return (
    <figure
      ref={figureRef}
      data-tilt
      className="glass glass-glare group relative aspect-[4/3] overflow-hidden rounded-2xl"
    >
      <div
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        title="Klik untuk memperbesar"
      />
      {useVideo ? (
        <video
          ref={videoRef}
          key={src}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          muted
          playsInline
          preload="auto"
          poster={poster}
          disablePictureInPicture
          aria-label={alt}
          onLoadedMetadata={handleLoadedMetadata}
          onSeeked={handleSeeked}
          onError={() => setFailedSrc(src)}
        >
          <source src={src} type="video/webm" />
        </video>
      ) : (
        <Image
          src={poster}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      {/* z-10: caption harus di atas pseudo-element glare (::after) */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/55 via-black/20 to-transparent p-3 pt-8 text-xs font-semibold text-white">
        {label}
      </figcaption>
    </figure>
  );
}
