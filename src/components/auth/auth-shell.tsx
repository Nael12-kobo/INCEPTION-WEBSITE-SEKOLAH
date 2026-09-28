import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthLogo } from "@/components/auth/logo";
import { LanguageToggle } from "@/components/auth/language-provider";

/**
 * Layout halaman auth: split panel premium.
 * - Desktop: panel branding kiri (sky lembut, dekorasi halus) + form kanan.
 * - Mobile: branding disembunyikan, logo kecil di atas form.
 */
export function AuthShell({
  panel,
  children,
}: {
  /** Konten panel kiri (branding/quote) — hanya desktop. */
  panel: ReactNode;
  /** Form autentikasi. */
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-white lg:grid lg:grid-cols-[1fr_1.1fr] xl:grid-cols-[1.05fr_1fr]">
      {/* Panel kiri — desktop only */}
      <aside className="relative hidden overflow-hidden bg-sky-50 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {panel}
      </aside>

      {/* Panel kanan — form */}
      <main className="relative flex flex-1 flex-col px-5 py-6 sm:px-8 lg:py-10 xl:px-16">
        {/* Bar atas: logo (mobile) + kembali ke beranda */}
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 -ml-3 text-sm font-medium text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Beranda
          </Link>
          <span className="flex items-center gap-2 lg:hidden">
            <AuthLogo width={36} height={36} />
            <LanguageToggle />
          </span>
        </header>

        <div className="flex flex-1 items-center justify-center py-10 sm:py-14 lg:py-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <footer className="pb-1 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SMK Telekomunikasi Tunas Harapan
        </footer>
      </main>
    </div>
  );
}
