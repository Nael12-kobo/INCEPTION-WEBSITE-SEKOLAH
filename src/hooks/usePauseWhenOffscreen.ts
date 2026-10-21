"use client";

import { useCallback } from "react";

/**
 * Menandai elemen dengan `data-offscreen` saat ia tidak terlihat sama sekali.
 * globals.css memakai tanda itu untuk pause (`animation-play-state: paused`)
 * dan melepas promosi GPU (`will-change: auto`) pada dekorasi beranimasi
 * infinite — sehingga halaman jurusan berhenti memakan compositor setelah
 * pengunjung scroll melewati hero.
 *
 * Hanya status "terlihat / tidak" yang disentuh; posisi dan tampilan tidak
 * berubah. Pakai sebagai ref: `<div ref={usePauseWhenOffscreen()}>`.
 */
export function usePauseWhenOffscreen<T extends HTMLElement>() {
  return useCallback((node: T | null) => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) node.removeAttribute("data-offscreen");
        else node.setAttribute("data-offscreen", "");
      },
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
}
