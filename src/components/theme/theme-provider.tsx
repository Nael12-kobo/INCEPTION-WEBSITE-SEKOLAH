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

export function useTheme(): {
  theme: Theme;
  setTheme: (theme: Theme) => void;
} {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default "system" — nilai tersimpan (bila ada) dibaca saat mount.
  const [theme, setThemeState] = React.useState<Theme>("system");

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === "light" || stored === "dark" ? stored : "system";
    setThemeState(initial);
    applyTheme(initial);

    // "Otomatis" harus ikut hidup saat setelan sistem berubah.
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      const current = window.localStorage.getItem(STORAGE_KEY);
      if (current !== "light" && current !== "dark") applyTheme("system");
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
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
