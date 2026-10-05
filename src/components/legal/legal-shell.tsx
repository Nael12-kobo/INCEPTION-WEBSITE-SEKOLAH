import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

/**
 * Shell halaman legal (Kebijakan Privasi & Syarat Ketentuan).
 * Dipakai bersama oleh /privacy-policy dan /terms-of-service supaya hero,
 * daftar isi, dan CTA-nya konsisten.
 */

export type LegalSectionMeta = {
  /** Cocok dengan id pada <section> di dalam LegalSection. */
  id: string;
  title: string;
};

export function LegalShell({
  title,
  description,
  updatedAt,
  sections,
  children,
}: {
  title: string;
  description: string;
  /** Tanggal pembaruan terakhir, sudah diformat manusia (mis. "5 Oktober 2026"). */
  updatedAt: string;
  sections: LegalSectionMeta[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen flex-col dark:bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-blue-200">
            <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-white">
              <Home className="size-3.5" />
              Beranda
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span className="font-medium text-white">{title}</span>
          </nav>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="max-w-2xl text-blue-100">{description}</p>
          <p className="mt-4 text-sm text-blue-200">Terakhir diperbarui: {updatedAt}</p>
        </div>
      </section>

      {/* Isi */}
      <section className="flex-1 bg-gray-50 py-12 dark:bg-gray-900 md:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[240px_1fr]">
          <aside className="h-max rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-24">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Daftar Isi
            </h2>
            <ol className="mt-3 space-y-2 text-sm">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  >
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <article className="min-w-0 space-y-9 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 md:p-8">
            {children}
          </article>
        </div>
      </section>

      {/* Kembali ke beranda */}
      <section className="bg-white py-12 dark:bg-gray-950">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            <Home className="size-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Satu bagian/heading yang id-nya dipakai oleh daftar isi di LegalShell. */
export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 md:text-[15px]">
        {children}
      </div>
    </section>
  );
}
