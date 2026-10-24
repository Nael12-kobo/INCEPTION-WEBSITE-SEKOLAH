/**
 * Kanal bantuan resmi untuk pengguna yang mengalami kendala.
 *
 * WhatsApp panitia belum bisa dipakai (Cloud API / nomor belum aktif), jadi
 * semua titik bantuan diarahkan ke Instagram sekolah. Nilai diambil dari
 * `NEXT_PUBLIC_SUPPORT_IG_URL` (di-inline saat build); bila kosong, memakai
 * default Instagram. Ketika WA sudah siap, cukup ganti isi env menjadi
 * `https://wa.me/62…` lewat .env / build-arg Coolify — label nama kanal
 * ikut berubah otomatis tanpa menyentuh kode.
 */

const envUrl = process.env.NEXT_PUBLIC_SUPPORT_IG_URL?.trim();

/** URL kanal bantuan (default: Instagram resmi sekolah). */
export const SUPPORT_IG_URL =
  envUrl && envUrl.length > 0 ? envUrl : "https://www.instagram.com/smk_tth/";

/** Nama kanal untuk label tombol/teks — mengikuti URL, bukan hardcode. */
export const SUPPORT_CHANNEL: "Instagram" | "WhatsApp" =
  SUPPORT_IG_URL.includes("wa.me") ? "WhatsApp" : "Instagram";

/** Tautan markdown untuk disisipkan di pesan kendala chat. */
export function supportMarkdownLink(label = `sekolah via ${SUPPORT_CHANNEL}`) {
  return `[${label}](${SUPPORT_IG_URL})`;
}
