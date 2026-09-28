"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthLanguage } from "@/components/auth/language-provider";

/* Ikon resmi (brand mark) — simple-icons, inline agar tidak perlu dependency baru. */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-4.5 w-4.5", className)}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.25 1.3-1.66 3.8-5.5 3.8-3.31 0-6.01-2.74-6.01-6.1S8.69 5.7 12 5.7c1.89 0 3.15.8 3.87 1.49l2.64-2.54C16.8 3.08 14.62 2.1 12 2.1 6.64 2.1 2.3 6.44 2.3 11.8S6.64 21.5 12 21.5c5.6 0 9.3-3.93 9.3-9.47 0-.64-.07-1.13-.16-1.62H12z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-4.5 w-4.5", className)}>
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"
      />
    </svg>
  );
}

type Provider = "google" | "github";

/**
 * Pasang tombol Google & GitHub.
 * Memanggil signIn() dari next-auth/react → redirect ke provider.
 * Loading per-tombol, disabled saat request berjalan, error inline.
 */
export function SocialAuthButtons({ className }: { className?: string }) {
  const { t } = useAuthLanguage();
  const [pending, setPending] = React.useState<Provider | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async (provider: Provider) => {
    setError(null);
    setPending(provider);
    try {
      // OAuth: mengarahkan browser ke provider; bila redirect gagal (mis. provider
      // belum dikonfigurasi), NextAuth melempar error yang kita tampilkan inline.
      await signIn(provider, { redirectTo: "/dashboard" });
    } catch {
      setError(t("error.generic"));
      setPending(null);
    }
  };

  const disabled = pending !== null;

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSignIn("google")}
          disabled={disabled}
          aria-busy={pending === "google"}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-sky-200/90 bg-white px-4",
            "text-sm font-semibold text-slate-700 shadow-sm shadow-sky-50",
            "transition-[background-color,border-color,transform,box-shadow] duration-200",
            "hover:border-sky-300 hover:bg-sky-50/70 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/15",
            "disabled:pointer-events-none disabled:opacity-55"
          )}
        >
          {pending === "google" ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-sky-600" aria-hidden />
          ) : (
            <GoogleIcon />
          )}
          <span>{pending === "google" ? t("googleLoading") : t("google")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSignIn("github")}
          disabled={disabled}
          aria-busy={pending === "github"}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2.5 rounded-xl border border-sky-200/90 bg-white px-4",
            "text-sm font-semibold text-slate-700 shadow-sm shadow-sky-50",
            "transition-[background-color,border-color,transform,box-shadow] duration-200",
            "hover:border-sky-300 hover:bg-sky-50/70 active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/15",
            "disabled:pointer-events-none disabled:opacity-55"
          )}
        >
          {pending === "github" ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-sky-600" aria-hidden />
          ) : (
            <GitHubIcon />
          )}
          <span>{pending === "github" ? t("githubLoading") : t("github")}</span>
        </button>
      </div>

      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
