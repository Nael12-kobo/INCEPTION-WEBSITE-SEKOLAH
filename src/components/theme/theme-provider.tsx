"use client";

import * as React from "react";

/**
 * Penyedia tema terang/gelap/otomatis tanpa dependensi eksternal.
 *
 * Mekanisme:
 * - Pilihan user ("light" | "dark" | "system") disimpan di localStorage
 *   (kunci "theme").
 * - Momen paling awal (sebelum React hydrate) ditangani script inline di
 *   root layout — lihat `themeInitScript` di layout.tsx — supaya tidak ada
 *   kedip putih→gelap (FOUC) saat membuka halaman.
 * - Di sini hanya menangani perubahan interaktif + sinkronisasi class
 *   `.dark` di <html> (satu-satunya saklar yang dibaca globals.css).
 */

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

/**
 * Script inline anti-FOUC — dijalankan SEBELUM hydration (lihat root layout).
 * Membaca localStorage + prefers-color-scheme lalu menulis class `.dark`
 * lebih dulu, supaya halaman gelap langsung dirender gelap tanpa kedip.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

/** Terapkan tema ke <html>: class `.dark` + atribut color-scheme. */
function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: "system",
  setTheme: () => undefined,
});

/** localStorage sebagai external store (pola yang direkomendasikan React —
 *  tanpa setState di dalam effect). `storage` sinkronkan antar-tab. */
function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getThemeSnapshot(): Theme {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : "system";
}

/** SSR & hydration selalu "system" — cocok dengan HTML prerender; nilai
 *  tersimpan (bila ada) dipakai re-render sesudah hydration. */
function getServerThemeSnapshot(): Theme {
  return "system";
}

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
} {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Nilai tersimpan dibaca via external store — bukan setState di effect.
  const storedTheme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );
  // Pilihan eksplisit user di tab ini menang atas snapshot (mis. setelah
  // toggle "system" → "dark" tanpa menunggu event storage lintas-tab).
  const [choice, setChoice] = React.useState<Theme | null>(null);
  const theme: Theme = choice ?? storedTheme;

  // Sinkronkan class `.dark` + color-scheme di <html> dengan state React.
  // Idempoten dengan themeInitScript (anti-FOUC) di root layout.
  React.useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    // "Otomatis" harus ikut hidup saat setelan sistem berubah.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => applyTheme("system");
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, [theme]);

  const setTheme = React.useCallback((next: Theme) => {
    setChoice(next);
    if (next === "system") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    applyTheme(next);
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
