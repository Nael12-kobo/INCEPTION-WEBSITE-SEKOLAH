"use client";

import { useEffect, useState } from "react";

/**
 * Menjaga elemen tetap ter-mount selama animasi keluar.
 *
 * - `mounted`  → elemen boleh ada di DOM (termasuk saat sedang menghilang).
 * - `visible`  → target state untuk transisi CSS (opacity/transform).
 *
 * Dipakai drawer riwayat chat supaya membuka/menutup terasa halus, bukan
 * muncul-hilang mendadak.
 */
export function usePresence(open: boolean, exitMs = 240) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    let raf = 0;
    let timer = 0;

    if (open) {
      // Dua frame agar browser sempat melukis state tersembunyi sebelum
      // transisi ke state terlihat dimulai.
      raf = requestAnimationFrame(() => {
        setMounted(true);
        raf = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      // Ditunda satu frame agar tidak memicu cascading render di body effect.
      raf = requestAnimationFrame(() => {
        setVisible(false);
        timer = window.setTimeout(() => setMounted(false), exitMs);
      });
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [open, exitMs]);

  return { mounted, visible };
}
