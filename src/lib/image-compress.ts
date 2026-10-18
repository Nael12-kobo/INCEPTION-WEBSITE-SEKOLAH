/**
 * Kompresi gambar di sisi klien (canvas) — dipakai untuk foto siswa PPDB.
 *
 * Foto dikompres sebelum dikirim ke server supaya:
 * - ukuran kecil (foto formal umumnya cukup < 300 KB), aman disimpan di DB,
 * - hemat kuota siswa, dan proses upload cepat.
 *
 * Browser-only: hanya dipanggil dari komponen client.
 */

const MAX_INPUT_BYTES = 8 * 1024 * 1024; // batas file mentah agar memori aman

export type CompressOptions = {
  /** Sisi terpanjang setelah kompresi (px). */
  maxSide?: number;
  /** Kualitas JPEG 0–1. */
  quality?: number;
};

export async function compressImageToJpeg(
  file: File,
  { maxSide = 1000, quality = 0.82 }: CompressOptions = {}
): Promise<Blob> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error(
      "Ukuran file terlalu besar (maks 8 MB). Kompres atau perkecil foto terlebih dahulu."
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "Format gambar tidak didukung. Gunakan file JPG, PNG, atau WebP."
    );
  }

  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas tidak tersedia di browser ini.");

    // Latar putih: PNG transparan tidak menjadi hitam saat dikonversi ke JPEG.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/jpeg", quality)
    );
    if (!blob) throw new Error("Gagal memproses gambar. Coba file lain.");
    return blob;
  } finally {
    bitmap.close();
  }
}
