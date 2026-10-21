/**
 * Helper animasi panel chat berbasis Web Animations API.
 *
 * Semua morph memakai `transform` + `opacity` (GPU/compositor) sehingga
 * tidak memicu layout ulang tiap frame. Dipakai untuk:
 * - membuka panel dari posisi bubble (FLIP),
 * - menutup panel kembali ke bubble,
 * - berpindah compact ↔ fullscreen,
 * - cross-fade konten saat ukuran panel berubah.
 */

export const CHAT_EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
export const CHAT_EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";
export const CHAT_EASE_SPRING = "cubic-bezier(0.34, 1.35, 0.64, 1)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface MorphOptions {
  duration?: number;
  /** Opacity awal panel (0–1). */
  startOpacity?: number;
  /** Radius awal dalam px; default mengikuti radius elemen. */
  startRadius?: number;
  /** Blur awal dalam px (reveal "blur → tajam" khas situs). */
  startBlur?: number;
}

function measure(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  return rect;
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
  return {
    transform: `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})`,
    scaleX,
    scaleY,
  };
}

/**
 * Animasi panel dari `from` (mis. rect bubble) menuju posisi aslinya.
 * Mengembalikan Animation agar bisa dibatalkan saat komponen dilepas.
 */
export function morphIn(
  el: HTMLElement | null,
  from: DOMRect | null,
  options: MorphOptions = {},
): Animation | null {
  if (!el || !from || prefersReducedMotion()) return null;
  const to = measure(el);
  if (!to) return null;

  const { transform } = transformBetween(from, to);
  const radius = getComputedStyle(el).borderRadius || "1rem";

  return el.animate(
    [
      {
        transform,
        opacity: options.startOpacity ?? 0.2,
        borderRadius: `${options.startRadius ?? 24}px`,
        filter: `blur(${options.startBlur ?? 8}px)`,
      },
      {
        transform: "translate3d(0, 0, 0) scale(1, 1)",
        opacity: 1,
        borderRadius: radius,
        filter: "blur(0px)",
      },
    ],
    {
      duration: options.duration ?? 560,
      easing: CHAT_EASE_OUT,
      fill: "none",
    },
  );
}

/**
 * Animasi panel mengecil ke `target` (mis. rect bubble) sambil memudar.
 * `fill: forwards` menahan frame terakhir sampai panel di-unmount.
 */
export function morphOut(
  el: HTMLElement | null,
  target: { left: number; top: number; width: number; height: number } | null,
  duration = 360,
  endRadius = 24,
): Animation | null {
  if (!el || !target || prefersReducedMotion()) return null;
  const from = measure(el);
  if (!from) return null;

  const { transform } = transformBetween(target, from);
  const radius = getComputedStyle(el).borderRadius || "1rem";
  return el.animate(
    [
      {
        transform: "translate3d(0, 0, 0) scale(1, 1)",
        opacity: 1,
        borderRadius: radius,
        filter: "blur(0px)",
      },
      { transform, opacity: 0, borderRadius: `${endRadius}px`, filter: "blur(6px)" },
    ],
    {
      duration,
      easing: CHAT_EASE_IN,
      fill: "forwards",
    },
  );
}

/**
 * Penutupan lembut untuk panel fullscreen: mengecil ke bawah sambil
 * memudar (tanpa harus menyusut ke ukuran bubble 64px yang terlalu ekstrem).
 */
export function dismissPanel(el: HTMLElement | null, duration = 260): Animation | null {
  if (!el || prefersReducedMotion()) return null;
  return el.animate(
    [
      { opacity: 1, transform: "translate3d(0, 0, 0) scale(1, 1)", filter: "blur(0px)" },
      {
        opacity: 0,
        transform: "translate3d(0, 14px, 0) scale(0.97, 0.97)",
        filter: "blur(6px)",
      },
    ],
    { duration, easing: CHAT_EASE_IN, fill: "forwards" },
  );
}

/**
 * Cross-fade konten saat panel berganti ukuran — menutupi distorsi teks
 * yang ikut ter-scale selama morph.
 */
export function softenSwap(el: HTMLElement | null, duration = 420): Animation | null {
  if (!el || prefersReducedMotion()) return null;
  return el.animate(
    [
      { opacity: 0.35, filter: "blur(3px)" },
      { opacity: 1, filter: "blur(0px)" },
    ],
    { duration, easing: CHAT_EASE_OUT, fill: "none" },
  );
}
