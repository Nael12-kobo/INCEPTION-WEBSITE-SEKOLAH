"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export type FlowDirection = "left" | "right" | "alternate" | "center";

type FlowOptions = {
  /** selector anak yang dianimasikan, default: "[data-scrub-item]" */
  itemSelector?: string;
  /** arah entrance dari luar layar */
  direction?: FlowDirection;
  /** jarak geser awal (px) */
  distance?: number;
  /** jeda stagger antar item (ms) */
  staggerMs?: number;
  /** durasi animasi per item (ms) */
  duration?: number;
};

function resolveDir(
  el: HTMLElement,
  index: number,
  fallback: FlowDirection,
): "left" | "right" | "center" {
  const attr = el.getAttribute("data-scrub-dir");
  if (attr === "left" || attr === "right" || attr === "center") return attr;
  if (fallback === "alternate") return index % 2 === 0 ? "left" : "right";
  return fallback;
}

function fromValues(dir: "left" | "right" | "center", distance: number) {
  return {
    x: dir === "left" ? -distance : dir === "right" ? distance : 0,
    scale: dir === "center" ? 0.92 : 1,
    rotate: dir === "left" ? -2.5 : dir === "right" ? 2.5 : 0,
  };
}

/**
 * Scroll-reveal trigger-based berbasis anime.js — replay tiap masuk viewport.
 * Nilai keyframe & arah SAMA seperti scrub sebelumnya (kiri/kanan/center),
 * hanya pemicunya trigger saat masuk viewport + easing tegas (outCubic).
 */
export function useAnimeFlowReveal<T extends HTMLElement = HTMLElement>(
  options: FlowOptions = {},
) {
  const ref = useRef<T | null>(null);
  const {
    itemSelector = "[data-scrub-item]",
    direction = "alternate",
    distance = 140,
    staggerMs = 70,
    duration = 600,
  } = options;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const froms = items.map((el, i) => {
      const dir = resolveDir(el, i, direction);
      return { el, dir, ...fromValues(dir, distance) };
    });

    // Isolasi CSS transition (.glass-hover: transform 250ms) selama entrance.
    // Tanpa ini tiap frame anime.js di-transition browser -> lag setengah
    // jalan lalu snap cepat ke posisi/rotasi akhir.
    const isolate = () => {
      for (const f of froms) f.el.classList.add("flow-animating");
      // Force reflow agar `transition: none` diterapkan sebelum tween jalan.
      void root.offsetWidth;
    };
    const release = () => {
      for (const f of froms) f.el.classList.remove("flow-animating");
    };

    // State awal tersembunyi (instan, tanpa flash).
    const live: Array<ReturnType<typeof animate>> = [];
    isolate();
    for (const f of froms) {
      live.push(
        animate(f.el, {
          opacity: 0,
          translateX: f.x,
          scale: f.scale,
          rotate: f.rotate,
          duration: 1,
          ease: "linear",
          composition: "replace",
        }),
      );
    }

    // Status section: hidden -> playing -> shown. Mencegah trigger ganda
    // menumpuk animasi (sumber flick), replay hanya setelah reset.
    let state: "hidden" | "playing" | "shown" = "hidden";

    const play = () => {
      if (state !== "hidden") return;
      state = "playing";
      // Single-tween: satu panggilan animate untuk semua item agar tidak ada
      // tween susulan. Titik awal = state hidden instan di atas, jadi cukup
      // animasikan ke nilai akhir (tiap item mulai dari posisinya sendiri).
      isolate();
      live.push(
        animate(
          items,
          {
            opacity: 1,
            translateX: 0,
            scale: 1,
            rotate: 0,
            duration,
            delay: stagger(staggerMs),
            ease: "outQuart",
            composition: "replace",
            onComplete: () => {
              if (state !== "playing") return;
              state = "shown";
              release();
            },
          },
        ),
      );
    };

    const reset = () => {
      if (state === "hidden") return;
      state = "hidden";
      isolate();
      for (const f of froms) {
        live.push(
          animate(f.el, {
            opacity: 0,
            translateX: f.x,
            scale: f.scale,
            rotate: f.rotate,
            duration: 1,
            ease: "linear",
            composition: "replace",
          }),
        );
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            play();
          } else {
            // Reset hanya saat section sepenuhnya keluar viewport
            // agar tidak flicker saat masih sebagian terlihat.
            const r = (entry.target as HTMLElement).getBoundingClientRect();
            const vh = window.innerHeight || 800;
            if (r.bottom <= 0 || r.top >= vh) reset();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(root);
    return () => {
      observer.disconnect();
      release();
      live.forEach((a) => a.revert());
    };
  }, [itemSelector, direction, distance, staggerMs, duration]);

  return ref;
}
