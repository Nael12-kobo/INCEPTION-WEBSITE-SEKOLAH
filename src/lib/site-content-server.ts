/**
 * Akses konten halaman publik dari database — hanya untuk server
 * (Server Component & route handler Admin Panel).
 *
 * Baca selalu aman: kalau tabel belum dibuat, baris belum ada, atau isi
 * Json tidak lolos validasi, fungsi mengembalikan default dari
 * `src/lib/site-content.ts`. Halaman publik tidak pernah gagal render
 * gara-gara konten.
 */

import { prisma } from "@/lib/prisma";
import {
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_KEYS,
  isSiteContentKey,
  normalizeSiteContent,
  type SiteContentKey,
  type SiteContentMap,
} from "@/lib/site-content";

/** Baca satu bagian konten (fallback ke default bila tidak ada/gagal). */
export async function getSiteContent<K extends SiteContentKey>(
  key: K,
): Promise<SiteContentMap[K]> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    if (!row) return SITE_CONTENT_DEFAULTS[key];
    return normalizeSiteContent(key, row.content);
  } catch (error) {
    // Tabel belum dibuat (belum `prisma db push`) — pakai default kode.
    console.warn(`[site-content] gagal membaca "${key}":`, error);
    return SITE_CONTENT_DEFAULTS[key];
  }
}

/** Baca semua bagian sekaligus (dipakai homepage & halaman admin). */
export async function getSemuaSiteContent(): Promise<SiteContentMap> {
  let rows: Array<{ key: string; content: unknown }> = [];
  try {
    rows = await prisma.siteContent.findMany({
      select: { key: true, content: true },
    });
  } catch (error) {
    console.warn("[site-content] gagal membaca tabel site_contents:", error);
    return { ...SITE_CONTENT_DEFAULTS };
  }

  const hasil: SiteContentMap = { ...SITE_CONTENT_DEFAULTS };
  for (const row of rows) {
    if (!isSiteContentKey(row.key)) continue;
    // Penugasan tidak bisa dikorelasikan TS dengan key dinamis — sudah
    // dijamin `isSiteContentKey` + `normalizeSiteContent` di atas.
    (hasil as Record<string, unknown>)[row.key] = normalizeSiteContent(
      row.key,
      row.content,
    );
  }
  return hasil;
}

/**
 * Simpan satu bagian konten. Data divalidasi dulu; hanya key yang dikenal
 * yang boleh disimpan (mencegah baris sampah di tabel).
 */
export async function simpanSiteContent(
  key: SiteContentKey,
  raw: unknown,
  updatedBy: string | null,
): Promise<SiteContentMap[SiteContentKey]> {
  const content = normalizeSiteContent(key, raw);
  await prisma.siteContent.upsert({
    where: { key },
    create: { key, content: content as never, updatedBy },
    update: { content: content as never, updatedBy },
  });
  return content;
}

/** Daftar key yang sah — untuk validasi body request admin. */
export function daftarSiteContentKey(): SiteContentKey[] {
  return [...SITE_CONTENT_KEYS];
}
