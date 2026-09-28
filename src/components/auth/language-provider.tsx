"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Languages } from "lucide-react";
import { dictionaries, type AuthMessageKey, type Locale } from "@/lib/auth-dictionary";
import { cn } from "@/lib/utils";

type AuthLanguageContextValue = {
  locale: Locale;
  t: (key: AuthMessageKey) => string;
  toggleLocale: () => void;
};

const AuthLanguageContext = createContext<AuthLanguageContextValue | null>(null);

const STORAGE_KEY = "auth-locale";

/** localStorage dipakai sebagai external store (pola yang direkomendasikan React). */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getLocaleSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "en" ? "en" : "id";
}

function getServerSnapshot(): Locale {
  return "id";
}

export function AuthLanguageProvider({ children }: { children: ReactNode }) {
  // SSR & hydration selalu render "id"; bila localStorage berisi "en",
  // client re-render ke EN. Tanpa setState di dalam effect.
  const storedLocale = useSyncExternalStore(subscribe, getLocaleSnapshot, getServerSnapshot);
  const [userChoice, setUserChoice] = useState<Locale | null>(null);

  const locale: Locale = userChoice ?? storedLocale;

  const toggleLocale = useCallback(() => {
    const next: Locale = storedLocale === "id" ? "en" : "id";
    window.localStorage.setItem(STORAGE_KEY, next);
    setUserChoice(next);
  }, [storedLocale]);

  const t = useCallback(
    (key: AuthMessageKey) => dictionaries[locale][key],
    [locale]
  );

  const value = useMemo(
    () => ({ locale, t, toggleLocale }),
    [locale, t, toggleLocale]
  );

  return (
    <AuthLanguageContext.Provider value={value}>
      {children}
    </AuthLanguageContext.Provider>
  );
}

export function useAuthLanguage(): AuthLanguageContextValue {
  const ctx = useContext(AuthLanguageContext);
  if (!ctx) {
    throw new Error("useAuthLanguage must be used within AuthLanguageProvider");
  }
  return ctx;
}

/** Tombol kecil untuk berganti bahasa ID ⇄ EN. */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale } = useAuthLanguage();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={`Switch language, current: ${locale === "id" ? "Indonesia" : "English"}`}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-sky-200/80 bg-white/80 px-3 text-xs font-semibold text-slate-600",
        "shadow-sm shadow-sky-100/60 backdrop-blur transition-colors hover:border-sky-300 hover:text-sky-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
        className
      )}
    >
      <Languages className="h-3.5 w-3.5 text-sky-500" aria-hidden />
      {locale === "id" ? "ID" : "EN"}
    </button>
  );
}
