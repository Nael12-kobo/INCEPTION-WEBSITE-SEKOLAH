"use client";

import { useEffect, useState } from "react";

/**
 * true bila viewport >= breakpoint desktop (default 1024px = `lg`).
 * - Default `false` saat SSR agar server & hydration sama (mobile dulu),
 *   nilai asli diisi setelah mount.
 */
export function useIsDesktop(minWidth = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const query = `(min-width: ${minWidth}px)`;
    const mql = window.matchMedia(query);
    const sync = () => setIsDesktop(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [minWidth]);

  return isDesktop;
}
