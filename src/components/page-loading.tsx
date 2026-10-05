/**
 * Fallback standar untuk `loading.tsx`.
 *
 * Sebelumnya tidak ada loading.tsx sama sekali: halaman dinamis yang query-nya
 * lama (dashboard, admin, ppdb) memunculkan layar kosong sampai stream selesai.
 */
export function PageLoading({ label = "Memuat halaman…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4 px-6 py-16"
    >
      <span
        aria-hidden
        className="h-8 w-8 animate-spin rounded-full border-[3px] border-sky-200 border-t-sky-600"
      />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
