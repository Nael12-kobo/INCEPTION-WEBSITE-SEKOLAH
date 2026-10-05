import Link from "next/link";

/**
 * 404 untuk seluruh app (dipanggil oleh notFound() dan route yang tak dikenal).
 * Dirender di dalam root layout, jadi navbar/footer tetap ada.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] w-full flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">
        Halaman yang kamu cari mungkin sudah dipindah, dihapus, atau alamatnya
        salah ketik.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Kembali ke beranda
        </Link>
        <Link
          href="/ppdb"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Info PPDB
        </Link>
      </div>
    </div>
  );
}
