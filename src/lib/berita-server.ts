/**
 * Akses data berita BUATAN ADMIN (tabel `beritas`) + penggabungannya dengan
 * berita otomatis dari situs WordPress (`src/lib/blog.ts`).
 *
 * Hanya dipakai di server: halaman publik (homepage, /berita/[slug]) dan
 * Admin Panel (/admin/berita).
 */

import { prisma } from "@/lib/prisma";
import { ambilBerita, formatTanggal, type Berita } from "@/lib/blog";
import { slugify } from "@/lib/jurusan";

/** Baris `beritas` dalam bentuk aman-serial (tanggal sudah string ISO). */
export type BeritaRecord = {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  konten: string | null;
  kategori: string;
  /** ISO string, contoh "2026-10-24T07:30:00.000Z". */
  tanggal: string;
  gambar: string | null;
  url: string | null;
  sourceUrl: string | null;
  published: boolean;
  updatedAt: string;
};

type Row = {
  id: string;
  slug: string;
  judul: string;
  ringkasan: string;
  konten: string | null;
  kategori: string;
  tanggal: Date;
  gambar: string | null;
  url: string | null;
  sourceUrl: string | null;
  published: boolean;
  updatedAt: Date;
};

function toRecord(row: Row): BeritaRecord {
  return {
    id: row.id,
    slug: row.slug,
    judul: row.judul,
    ringkasan: row.ringkasan,
    konten: row.konten,
    kategori: row.kategori,
    tanggal: row.tanggal.toISOString(),
    gambar: row.gambar,
    url: row.url,
    sourceUrl: row.sourceUrl,
    published: row.published,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Ubah baris DB menjadi item kartu berita (bentuk sama dengan berita web). */
export function beritaRecordToItem(row: BeritaRecord): Berita {
  const iso = row.tanggal;
  return {
    id: row.id,
    judul: row.judul,
    ringkasan: row.ringkasan,
    // Tautan keluar bila diisi admin; selain itu buka halaman detail sendiri.
    // Artikel hasil salin WordPress dibuka di halaman lokal agar salinan
    // yang telah diedit admin menjadi konten yang dibaca pengunjung.
    url: row.sourceUrl ? `/berita/${row.slug}` : (row.url?.trim() ? row.url.trim() : `/berita/${row.slug}`),
    tanggal: formatTanggal(iso),
    kategori: row.kategori,
    gambar: row.gambar,
    sumber: "manual",
    iso,
  };
}

/** Semua berita admin (termasuk draf) untuk tabel Admin Panel. */
export async function listBeritaAdmin(): Promise<BeritaRecord[]> {
  try {
    const rows = (await prisma.berita.findMany({
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
    })) as Row[];
    return rows.map(toRecord);
  } catch (error) {
    // Tabel belum dibuat (belum `prisma db push`) — jangan bikin admin panel
    // error; anggap belum ada berita buatan admin.
    console.warn("[berita] gagal membaca tabel beritas:", error);
    return [];
  }
}

/** Berita admin yang sudah dipublikasikan, terbaru di atas. */
export async function ambilBeritaManual(limit = 30): Promise<Berita[]> {
  try {
    const rows = (await prisma.berita.findMany({
      where: { published: true },
      orderBy: [{ tanggal: "desc" }, { createdAt: "desc" }],
      take: limit,
    })) as Row[];
    return rows.map((row) => beritaRecordToItem(toRecord(row)));
  } catch (error) {
    console.warn("[berita] gagal membaca tabel beritas:", error);
    return [];
  }
}

/**
 * Berita untuk homepage: buatan admin digabung dengan berita web, diurutkan
 * dari yang terbaru, lalu dibatasi `limit`.
 *
 * Berita admin dimunculkan duluan bila tanggalnya sama, dan situs WordPress
 * yang down tidak menggugurkan berita buatan admin.
 */
export async function gabungBerita(limit = 9): Promise<Berita[]> {
  const [allRows, web] = await Promise.all([
    listBeritaAdmin(),
    // Ambil lebih banyak dari web karena sebagian bisa tersingkir setelah
    // digabung dan dipotong `limit`.
    ambilBerita(limit),
  ]);

  const publishedRows = allRows.filter((row) => row.published);
  const sourceUrls = new Set(
    publishedRows.map((row) => row.sourceUrl).filter((url): url is string => Boolean(url)),
  );
  // Saat admin menyalin berita WordPress untuk menyuntingnya, jangan tampilkan
  // kartu asli sekaligus kartu hasil suntingan.
  const visibleWeb = web.filter((item) => !sourceUrls.has(item.url));
  const manual = publishedRows.slice(0, limit).map(beritaRecordToItem);
  const gabungan = [...manual, ...visibleWeb];
  gabungan.sort((a, b) => {
    const diff = Date.parse(b.iso) - Date.parse(a.iso);
    if (diff !== 0) return diff;
    if (a.sumber === b.sumber) return 0;
    return a.sumber === "manual" ? -1 : 1;
  });

  return gabungan.slice(0, limit);
}

/** Satu berita admin berdasarkan slug halaman detail. */
export async function getBeritaBySlug(
  slug: string,
): Promise<BeritaRecord | null> {
  try {
    const row = (await prisma.berita.findUnique({
      where: { slug },
    })) as Row | null;
    return row ? toRecord(row) : null;
  } catch (error) {
    console.warn("[berita] gagal membaca tabel beritas:", error);
    return null;
  }
}

export type ValidResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export type BeritaPayload = {
  slug: string;
  judul: string;
  ringkasan: string;
  konten: string | null;
  kategori: string;
  tanggal: Date;
  gambar: string | null;
  url: string | null;
  sourceUrl: string | null;
  published: boolean;
};

const URL_REGEX = /^https?:\/\/\S+$/i;
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,59}$/;

/** Potong di batas kata, tanpa memotong di tengah huruf. */
function potong(teks: string, max: number): string {
  const clean = teks.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const batas = cut.lastIndexOf(" ");
  return `${cut.slice(0, Math.max(batas, Math.floor(max * 0.6)))}…`;
}

/**
 * Validasi form berita admin. `tanggal` menerima "YYYY-MM-DD",
 * "YYYY-MM-DDTHH:mm", atau ISO penuh.
 */
export function validateBerita(body: unknown): ValidResult<BeritaPayload> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Format data tidak dikenal.", status: 400 };
  }
  const b = body as Record<string, unknown>;
  const str = (key: string) =>
    typeof b[key] === "string" ? (b[key] as string).trim() : "";

  const judul = str("judul");
  if (judul.length < 3) {
    return { ok: false, error: "Judul minimal 3 karakter.", status: 400 };
  }
  if (judul.length > 180) {
    return { ok: false, error: "Judul maksimal 180 karakter.", status: 400 };
  }

  const konten = str("konten") || null;
  let ringkasan = str("ringkasan");
  if (!ringkasan && konten) {
    // Admin tidak menulis ringkasan → ambil awal isi artikel.
    ringkasan = potong(konten, 180);
  }
  if (!ringkasan) {
    return {
      ok: false,
      error: "Ringkasan wajib diisi (atau isi artikel agar ringkasan dibuat otomatis).",
      status: 400,
    };
  }
  if (ringkasan.length > 320) {
    return { ok: false, error: "Ringkasan maksimal 320 karakter.", status: 400 };
  }

  const kategori = str("kategori") || "Berita";
  if (kategori.length > 40) {
    return { ok: false, error: "Kategori maksimal 40 karakter.", status: 400 };
  }

  const tanggalRaw = str("tanggal");
  const tanggal = tanggalRaw ? new Date(tanggalRaw) : new Date();
  if (Number.isNaN(tanggal.getTime())) {
    return { ok: false, error: "Tanggal tidak valid.", status: 400 };
  }

  const gambar = str("gambar");
  if (gambar && !URL_REGEX.test(gambar)) {
    return {
      ok: false,
      error: "Gambar harus berupa URL lengkap (https://…).",
      status: 400,
    };
  }

  const url = str("url");
  if (url && !URL_REGEX.test(url)) {
    return {
      ok: false,
      error: "Tautan harus berupa URL lengkap (https://…).",
      status: 400,
    };
  }

  const sourceUrl = str("sourceUrl");
  if (sourceUrl && !/^https:\/\/\S+$/i.test(sourceUrl)) {
    return {
      ok: false,
      error: "Tautan sumber harus berupa URL HTTPS yang valid.",
      status: 400,
    };
  }

  const slug = (str("slug") || slugify(judul)).toLowerCase();
  if (!SLUG_REGEX.test(slug)) {
    return {
      ok: false,
      error: "Slug hanya boleh berisi huruf kecil, angka, dan tanda minus (2–60 karakter).",
      status: 400,
    };
  }

  return {
    ok: true,
    data: {
      slug,
      judul,
      ringkasan,
      konten,
      kategori,
      tanggal,
      gambar: gambar || null,
      url: url || null,
      sourceUrl: sourceUrl || null,
      published: typeof b.published === "boolean" ? b.published : b.published !== "false",
    },
  };
}
