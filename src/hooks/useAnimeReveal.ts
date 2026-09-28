"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

type RevealOptions = {
  /** selector anak yang di-stagger, default: "[data-reveal-item]" */
  itemSelector?: string;
  y?: number;
  duration?: number;
};

/**
 * Scroll-reveal berbasis anime.js v4.
 * Bungkus section dengan ref ini; anak ber-atribut data-reveal-item
 * akan fade-up + stagger (anime.js) saat masuk viewport.
 */
export function useAnimeReveal<T extends HTMLElement = HTMLDivElement>(
  options: RevealOptions = {}
) {
  const ref = useRef<T | null>(null);
  const { itemSelector = "[data-reveal-item]", y = 28, duration = 800 } = options;

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));
    if (items.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Set state awal via anime.js agar tidak FOUC saat JS mati sebagian
    animate(items, {
      opacity: 0,
      translateY: y,
      duration: 1,
      ease: "outCubic",
    });

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animate(items, {
            opacity: [0, 1],
            translateY: [y, 0],
            duration,
            delay: stagger(90),
            ease: "outCubic",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, [itemSelector, y, duration]);

  return ref;
}

/** Animasi counter angka (anime.js) saat terlihat. */
export function useAnimeCounter<T extends HTMLElement = HTMLSpanElement>(
  target: number,
  options: { duration?: number; suffix?: string } = {}
) {
  const ref = useRef<T | null>(null);
  const { duration = 1400, suffix = "" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const render = (v: number) => {
      el.textContent = `${Math.round(v).toLocaleString("id-ID")}${suffix}`;
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(target);
      return;
    }
    render(0);
    const obj = { value: 0 };
    let animation: ReturnType<typeof animate> | null = null;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animation = animate(obj, {
            value: target,
            duration,
            ease: "outExpo",
            onUpdate: () => render(obj.value),
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      animation?.revert();
    };
  }, [target, duration, suffix]);

  return ref;
}
