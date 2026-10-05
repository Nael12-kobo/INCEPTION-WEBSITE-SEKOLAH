"use client"; // Error boundary wajib Client Component

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error boundary tingkat root.
 *
 * Sebelumnya tidak ada error.tsx sama sekali — ketika query database lambat /
 * gagal, pengguna melihat layar kosong tanpa tombol apa pun.
 *
 * Props mengikuti konvensi Next.js (lihat node_modules/next/dist/docs/
 * 01-app/03-api-reference/03-file-conventions/error.md): `error` + `retry`.
 * React merahasiakan pesan error server di production, jadi `error.message`
 * hanya berguna di dev; di production tetap tampilkan teks umum + digest.
 */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("[app] runtime error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";
  const detail = isDev ? error.message : null;

  return (
    <div className="flex min-h-[70dvh] w-full flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
        Terjadi kesalahan
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Ups, ada yang salah
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
        Halaman ini gagal dimuat. Coba muat ulang, atau kembali ke beranda.
      </p>

      {detail && (
        <p className="mt-4 max-w-xl rounded-xl bg-slate-100 px-4 py-3 text-left font-mono text-[11px] leading-relaxed text-slate-600">
          {detail}
        </p>
      )}
      {error.digest && (
        <p className="mt-2 text-[11px] text-slate-400">
          Kode: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={retry}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
