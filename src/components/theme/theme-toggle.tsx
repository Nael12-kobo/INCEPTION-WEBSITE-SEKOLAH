"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type Theme } from "@/components/theme/theme-provider";

const ORDER: Theme[] = ["light", "dark", "system"];

const META: Record<Theme, { icon: typeof Sun; label: string; next: string }> = {
  light: { icon: Sun, label: "Terang", next: "gelap" },
  dark: { icon: Moon, label: "Gelap", next: "otomatis (ikut sistem)" },
  system: { icon: Monitor, label: "Otomatis", next: "terang" },
};

/**
 * Tombol siklus tema: Terang → Gelap → Otomatis → Terang…
 * Ikon matahari/bulan/monitor mengikuti pilihan tersimpan (localStorage).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const current = META[theme] ?? META.system;
  const Icon = current.icon;

  const handleClick = React.useCallback(() => {
    const idx = ORDER.indexOf(theme);
    setTheme(ORDER[(idx + 1) % ORDER.length]);
  }, [theme, setTheme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Tema: ${current.label}. Klik untuk mengubah ke ${current.next}.`}
      title={`Tema: ${current.label} — klik untuk ${current.next}`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-card/70 text-sky-700",
        "transition-colors hover:bg-sky-50 hover:text-sky-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-sky-400 dark:hover:bg-neutral-700 dark:hover:text-sky-300",
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
