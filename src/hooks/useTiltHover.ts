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
    const live: Array<ReturnType<typeof animate>> = [];

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
        live.push(
          animate(el, {
            rotateY: px * maxTilt * 2,
            rotateX: -py * maxTilt * 2,
            scale,
            duration: 400,
            ease: "outCubic",
            composition: "replace",
          }),
        );
      };
      const onLeave = () => {
        if (isRevealing(el)) return;
        isolate(el);
        live.push(
          animate(el, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 800,
            ease: "outElastic(1, 0.55)",
            composition: "replace",
            onComplete: () => release(el),
          }),
        );
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
        live.push(
          animate(el, {
            translateX: (dx / Math.max(1, r.width)) * magneticStrength * 2,
            translateY: (dy / Math.max(1, r.height)) * magneticStrength * 2,
            scale: 1.05,
            duration: 500,
            ease: "outCubic",
            composition: "replace",
          }),
        );
      };
      const onLeave = () => {
        if (isRevealing(el)) return;
        isolate(el);
        live.push(
          animate(el, {
            translateX: 0,
            translateY: 0,
            scale: 1,
            duration: 700,
            ease: "outElastic(1, 0.5)",
            composition: "replace",
            onComplete: () => release(el),
          }),
        );
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
      for (const el of root.querySelectorAll<HTMLElement>(
        "[data-tilt], [data-magnetic]",
      )) {
        release(el);
      }
      live.forEach((a) => a.revert());
    };
  }, [rootRef, maxTilt, scale, magneticStrength]);
}
