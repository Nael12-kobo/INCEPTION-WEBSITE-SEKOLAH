/**
 * Helper animasi panel chat berbasis Web Animations API.
 *
 * Transisi panel memakai `transform` dan `opacity` agar geraknya ringan tanpa
 * mengubah layout tiap frame. Morph ukuran hanya dipakai untuk compact ↔
 * fullscreen; buka dan tutup memakai fade dengan perpindahan pendek.
 */

export const CHAT_EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const CHAT_EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface MorphOptions {
  duration?: number;
  /** Radius awal dalam px; default 24px. */
  startRadius?: number;
}

function measure(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return rect;
}

/** Jangan biarkan morph lama menimpa transisi terbaru pada elemen yang sama. */
function cancelCurrentMotion(el: HTMLElement) {
  for (const animation of el.getAnimations()) animation.cancel();
}

/** Transform yang memetakan elemen target ke posisi/ukuran `from`. */
function transformBetween(
  from: { left: number; top: number; width: number; height: number },
  to: { left: number; top: number; width: number; height: number },
) {
  const scaleX = Math.max(from.width / to.width, 0.02);
  const scaleY = Math.max(from.height / to.height, 0.02);
  const dx =
    from.left + from.width / 2 - (to.left + to.width / 2);
  const dy =
    from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`;
}

/**
 * Animasi panel dari posisi/ukuran sebelumnya menuju posisi/ukuran barunya.
 * Mengembalikan Animation agar bisa dibatalkan saat komponen dilepas.
 */
export function morphIn(
  el: HTMLElement | null,
  from: DOMRect | null,
  options: MorphOptions = {},
): Animation | null {
  if (!el || !from || prefersReducedMotion()) return null;
  cancelCurrentMotion(el);
  const to = measure(el);
  if (!to) return null;

  const transform = transformBetween(from, to);
  const radius = getComputedStyle(el).borderRadius || "1rem";

  return el.animate(
    [
      {
        transform,
        borderRadius: `${options.startRadius ?? 24}px`,
      },
      {
        transform: "translate3d(0, 0, 0) scale(1, 1)",
        borderRadius: radius,
      },
    ],
    {
      duration: options.duration ?? 380,
      easing: CHAT_EASE_OUT,
      fill: "none",
    },
  );
}

/** Masuk panel yang tidak meregang: sedikit naik, muncul, lalu stabil. */
export function enterPanel(el: HTMLElement | null, duration = 320): Animation | null {
  if (!el || prefersReducedMotion()) return null;
  cancelCurrentMotion(el);
  const radius = getComputedStyle(el).borderRadius || "1rem";
  return el.animate(
    [
      {
        transform: "translate3d(0, 14px, 0) scale(0.97)",
        opacity: 0,
        borderRadius: radius,
      },
      {
        transform: "translate3d(0, 0, 0) scale(1)",
        opacity: 1,
        borderRadius: radius,
      },
    ],
    { duration, easing: CHAT_EASE_OUT, fill: "none" },
  );
}

/** Keluar panel dengan gerak kecil ke bawah; tidak terbang kembali ke bubble. */
export function exitPanel(el: HTMLElement | null, duration = 220): Animation | null {
  if (!el || prefersReducedMotion()) return null;
  cancelCurrentMotion(el);
  const radius = getComputedStyle(el).borderRadius || "1rem";
  return el.animate(
    [
      {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
        borderRadius: radius,
      },
      {
        opacity: 0,
        transform: "translate3d(0, 8px, 0) scale(0.985)",
        borderRadius: radius,
      },
    ],
    { duration, easing: CHAT_EASE_IN, fill: "forwards" },
  );
}

/**
 * Beri konten gerak pendek saat panel berganti ukuran agar perubahan terasa halus.
 */
export function softenSwap(el: HTMLElement | null, duration = 420): Animation | null {
  if (!el || prefersReducedMotion()) return null;
  cancelCurrentMotion(el);
  return el.animate(
    [
      { opacity: 0.82, transform: "translate3d(0, 4px, 0)" },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ],
    { duration: Math.min(duration, 220), easing: CHAT_EASE_OUT, fill: "none" },
  );
}
