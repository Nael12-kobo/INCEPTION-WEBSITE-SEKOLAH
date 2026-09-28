"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * Animasi entrance halaman auth berbasis anime.js (konsisten dengan Hero):
 * - form: fade + naik sedikit
 * - panel kiri: fade + geser dari kiri
 * - logo: fade + scale halus
 * Menghormati prefers-reduced-motion (langsung tampil tanpa animasi).
 */
export function useAuthEntrance() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const logo = root.querySelector<HTMLElement>("[data-auth-logo]");
    const form = root.querySelector<HTMLElement>("[data-auth-form]");
    const panel = root.querySelector<HTMLElement>("[data-auth-panel]");
    const animations: ReturnType<typeof animate>[] = [];

    if (form) {
      animations.push(
        animate(form, {
          opacity: [0, 1],
          translateY: [24, 0],
          duration: 600,
          delay: 80,
          ease: "outCubic",
        })
      );
    }
    if (panel) {
      animations.push(
        animate(panel, {
          opacity: [0, 1],
          translateX: [-24, 0],
          duration: 700,
          delay: 40,
          ease: "outCubic",
        })
      );
    }
    if (logo) {
      animations.push(
        animate(logo, {
          opacity: [0, 1],
          scale: [0.92, 1],
          duration: 500,
          ease: "outBack",
        })
      );
    }

    return () => animations.forEach((a) => a.revert());
  }, []);

  return rootRef;
}
