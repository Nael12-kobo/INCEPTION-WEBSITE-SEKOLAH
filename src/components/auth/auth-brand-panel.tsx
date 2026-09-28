"use client";

import * as React from "react";
import { animate } from "animejs";
import { AuthLogo } from "@/components/auth/logo";
import {
  LanguageToggle,
  useAuthLanguage,
} from "@/components/auth/language-provider";

/**
 * Panel branding kiri (desktop) untuk halaman auth.
 * Dekorasi: grid sky + blob blur lembut yang mengapung sangat lambat
 * (anime.js, loop alternate), konsisten dengan gaya Hero.
 * Menghormati prefers-reduced-motion.
 */
export function AuthBrandPanel() {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { t } = useAuthLanguage();

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blobs = root.querySelectorAll<HTMLElement>("[data-auth-blob]");
    if (blobs.length === 0) return;

    const animation = animate(blobs, {
      translateY: [-16, 16],
      duration: 5200,
      ease: "inOutSine",
      alternate: true,
      loop: true,
    });

    return () => {
      animation.revert();
    };
  }, []);

  return (
    <div ref={rootRef} data-auth-panel className="relative flex h-full flex-col">
      {/* Dekorasi latar */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid-sky [mask-image:radial-gradient(ellipse_75%_65%_at_40%_40%,black,transparent)]" />
        <div
          data-auth-blob
          className="absolute -top-16 right-[6%] h-64 w-64 rounded-full bg-sky-200/60 blur-3xl"
        />
        <div
          data-auth-blob
          className="absolute bottom-[18%] -left-16 h-56 w-56 rounded-full bg-cyan-100/80 blur-3xl"
        />
        <div
          data-auth-blob
          className="absolute bottom-[6%] right-[24%] h-32 w-32 rounded-full bg-sky-300/30 blur-2xl"
        />
      </div>

      {/* Logo + nama */}
      <div className="relative flex items-center gap-3">
        <AuthLogo width={48} height={48} />
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-slate-900">
            SMK Telekomunikasi
          </p>
          <p className="text-xs font-medium text-sky-600">Tunas Harapan</p>
        </div>
      </div>

      {/* Quote / product statement */}
      <div className="relative my-auto max-w-md py-16">
        <span
          aria-hidden
          className="mb-6 block h-1 w-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400"
        />
        <p className="text-balance text-xl font-semibold leading-relaxed text-slate-800 xl:text-2xl">
          {t("panel.quote")}
        </p>
        <p className="mt-4 text-sm font-medium text-slate-500">{t("panel.caption")}</p>
      </div>

      {/* Footer panel + toggle bahasa */}
      <div className="relative flex items-center justify-between">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} SMK Telekomunikasi Tunas Harapan
        </p>
        <LanguageToggle />
      </div>
    </div>
  );
}
