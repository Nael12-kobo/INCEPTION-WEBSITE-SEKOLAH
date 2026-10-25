import { revalidatePath } from "next/cache";

/**
 * Bersihkan cache halaman publik setelah admin mengubah konten situs
 * (jurusan & berita).
 *
 * Kenapa perlu: homepage memakai ISR (fetch berita di-cache 1 jam) dan
 * halaman /jurusan, /berita ikut ter-prerender. Tanpa revalidate, perubahan
 * dari Admin Panel baru terlihat sampai masa cache habis.
 */
export function revalidateKontenPublik(): void {
  try {
    // "layout" pada "/" = semua route di bawah root layout ikut basi.
    revalidatePath("/", "layout");
  } catch (error) {
    // Gagal membersihkan cache tidak boleh menggagalkan aksi admin.
    console.warn("[revalidate] gagal membersihkan cache halaman publik:", error);
  }
}
