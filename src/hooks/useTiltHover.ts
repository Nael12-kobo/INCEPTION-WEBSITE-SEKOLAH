"use client";

import { useEffect, type RefObject } from "react";
import { animate } from "animejs";

type TiltOptions = {
  maxTilt?: number;
  scale?: number;
  magneticStrength?: number;
};

/**
 * Hover mouse ramai untuk section glass: tilt 3D + magnetic + glare.
 * Pasang di root section (ref dari useAnimeFlowReveal); semua anak
 * ber-atribut [data-tilt] akan miring mengikuti kursor,
 * [data-magnetic] akan tertarik halus ke arah kursor.
 * Nonaktif otomatis di touch device & prefers-reduced-motion.
 */
export function useTiltHover(
  rootRef: RefObject<HTMLElement | null>,
  options: TiltOptions = {},
) {
  const { maxTilt = 8, scale = 1.03, magneticStrength = 6 } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const cleanups: Array<() => void> = [];
    /**
     * Satu animasi TERAKHIR per elemen.
     *
     * Versi lama menumpuk setiap hasil `animate()` ke array — padahal
     * `mousemove` bisa 60fps, jadi ratusan ribu objek animasi terbawa
     * sampai unmount (bocor memori + bikin GC sering jalan). `composition:
     * "replace"` membuat tween lama otomatis dibatalkan tween baru, jadi
     * menyimpan yang terakhir saja sudah cukup untuk di-revert saat cleanup.
     */
    const live = new Map<HTMLElement, ReturnType<typeof animate>>();
    const track = (el: HTMLElement, config: Parameters<typeof animate>[1]) => {
      live.set(el, animate(el, config));
    };

    // Isolasi CSS transition (.glass-hover: transform 250ms) selama hover.
    // Tanpa ini tiap frame anime.js di-transition browser -> lag + snap,
    // pola yang sama seperti .flow-animating di useAnimeFlowReveal.
    const isolate = (el: HTMLElement) => {
      el.classList.add("tilt-animating");
      void el.offsetWidth;
    };
    const release = (el: HTMLElement) => {
      el.classList.remove("tilt-animating");
    };

    // Tween entrance sedang jalan (sendiri atau di ancestor) -> jangan potong.
    const isRevealing = (el: HTMLElement) =>
      el.classList.contains("flow-animating") ||
      el.closest(".flow-animating") !== null;

    const tilts = Array.from(root.querySelectorAll<HTMLElement>("[data-tilt]"));
    for (const el of tilts) {
      const onMove = (e: MouseEvent) => {
        if (isRevealing(el)) return;
        isolate(el);
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
        const py = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
        el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
        track(el, {
          rotateY: px * maxTilt * 2,
          rotateX: -py * maxTilt * 2,
          scale,
          duration: 400,
          ease: "outCubic",
          composition: "replace",
        });
      };
      const onLeave = () => {
        if (isRevealing(el)) return;
        isolate(el);
        track(el, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 800,
          ease: "outElastic(1, 0.55)",
          composition: "replace",
          onComplete: () => release(el),
        });
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    }

    const magnets = Array.from(
      root.querySelectorAll<HTMLElement>("[data-magnetic]"),
    );
    for (const el of magnets) {
      const onMove = (e: MouseEvent) => {
        if (isRevealing(el)) return;
        isolate(el);
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        track(el, {
          translateX: (dx / Math.max(1, r.width)) * magneticStrength * 2,
          translateY: (dy / Math.max(1, r.height)) * magneticStrength * 2,
          scale: 1.05,
          duration: 500,
          ease: "outCubic",
          composition: "replace",
        });
      };
      const onLeave = () => {
        if (isRevealing(el)) return;
        isolate(el);
        track(el, {
          translateX: 0,
          translateY: 0,
          scale: 1,
          duration: 700,
          ease: "outElastic(1, 0.5)",
          composition: "replace",
          onComplete: () => release(el),
        });
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
      live.forEach((animation, el) => {
        animation.revert();
        // Pastikan tidak ada transform inline yang tertinggal di elemen
        // yang mungkin masih terpasang (mis. re-mount / StrictMode).
        el.style.removeProperty("transform");
      });
      live.clear();
      for (const el of root.querySelectorAll<HTMLElement>(
        "[data-tilt], [data-magnetic]",
      )) {
        release(el);
      }
    };
  }, [rootRef, maxTilt, scale, magneticStrength]);
}
