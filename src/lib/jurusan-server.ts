/**
 * Akses data program keahlian (jurusan) dari database — hanya dipakai di
 * server (Server Component & route handler admin).
 *
 * Empat jurusan bawaan memiliki nilai cadangan di `jurusan.ts` dan konten
 * detail di `jurusan-detail.ts`. Saat Admin Panel dibuka, baris awal yang
 * belum ada dibuat tanpa menimpa suntingan admin; setelah itu semua halaman
 * membaca data yang sama dari tabel `jurusans`.
 */

import { prisma } from "@/lib/prisma";
import { DETAIL_BAWAAN } from "@/lib/jurusan-detail";
import {
  IKON_JURUSAN_KEYS,
  JURUSAN_BAWAAN,
  KODE_REGEX,
  WARNA_JURUSAN_KEYS,
  kompetensiDariJson,
  karirDariJson,
  kodeDipakaiBawaan,
  parseBaris,
  slugify,
  type JurusanItem,
  type KompetensiItem,
  type KarirItem,
} from "@/lib/jurusan";

/** Data jurusan dari DB (siap dirender halaman detail & tabel admin). */
export type JurusanRecord = {
  id: string;
  kode: string;
  nama: string;
  singkatan: string;
  tagline: string | null;
  deskripsi: string;
  tentang: string;
  skills: string[];
  keunggulan: string[];
  kompetensi: KompetensiItem[];
  karir: KarirItem[];
  ikon: string;
  warna: string;
  gambar: string | null;
  heroTeks: string | null;
  introKompetensi: string;
  introKarir: string;
  ctaJudul: string;
  ctaTeks: string;
  /** true = jurusan bawaan (route khusus, tidak boleh dihapus). */
  bawaan: boolean;
  urutan: number;
  aktif: boolean;
};

/**
 * Payload tervalidasi untuk create/update (kolom Prisma, tanpa id).
 * `bawaan` sengaja dikecualikan: hanya boleh di-set inisialisasi server,
 * tidak pernah oleh form admin.
 */
export type JurusanPayload = Omit<JurusanRecord, "id" | "bawaan">;

type Row = {
  id: string;
  kode: string;
  nama: string;
  singkatan: string;
  tagline: string | null;
  deskripsi: string;
  tentang: string;
  skills: string[];
  keunggulan: string[];
  kompetensi: unknown;
  karir: unknown;
  ikon: string;
  warna: string;
  gambar: string | null;
  heroTeks: string | null;
  introKompetensi: string;
  introKarir: string;
  ctaJudul: string;
  ctaTeks: string;
  bawaan: boolean;
  urutan: number;
  aktif: boolean;
};

function toRecord(row: Row): JurusanRecord {
  return {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    singkatan: row.singkatan,
    tagline: row.tagline,
    deskripsi: row.deskripsi,
    tentang: row.tentang,
    skills: row.skills,
    keunggulan: row.keunggulan,
    kompetensi: kompetensiDariJson(row.kompetensi),
    karir: karirDariJson(row.karir),
    ikon: row.ikon,
    warna: row.warna,
    gambar: row.gambar,
    heroTeks: row.heroTeks,
    introKompetensi: row.introKompetensi,
    introKarir: row.introKarir,
    ctaJudul: row.ctaJudul,
    ctaTeks: row.ctaTeks,
    bawaan: row.bawaan,
    urutan: row.urutan,
    aktif: row.aktif,
  };
}

const SELECT = {
  id: true,
  kode: true,
  nama: true,
  singkatan: true,
  tagline: true,
  deskripsi: true,
  tentang: true,
  skills: true,
  keunggulan: true,
  kompetensi: true,
  karir: true,
  ikon: true,
  warna: true,
  gambar: true,
  heroTeks: true,
  introKompetensi: true,
  introKarir: true,
  ctaJudul: true,
  ctaTeks: true,
  bawaan: true,
  urutan: true,
  aktif: true,
} as const;

/** Bentuk data awal jurusan bawaan yang ditulis ke DB satu kali. */
function dataBawaan(kode: string, index: number) {
  const item = JURUSAN_BAWAAN.find((jurusan) => jurusan.kode === kode);
  const detail = DETAIL_BAWAAN[kode];
  if (!item || !detail) return null;

  return {
    kode: item.kode,
    nama: item.nama,
    singkatan: detail.singkatan,
    tagline: detail.tagline,
    deskripsi: item.deskripsi,
    tentang: detail.tentang,
    skills: item.skills,
    keunggulan: detail.keunggulan,
    kompetensi: detail.kompetensi as never,
    karir: detail.karir as never,
    ikon: item.ikon,
    warna: item.warna,
    gambar: detail.gambar,
    heroTeks: detail.heroTeks,
    introKompetensi: detail.introKompetensi,
    introKarir: detail.introKarir,
    ctaJudul: detail.ctaJudul,
    ctaTeks: detail.ctaTeks,
    bawaan: true,
    urutan: (index + 1) * 10,
    aktif: true,
  };
}

function fallbackBawaan(kode: string, index: number): JurusanRecord | null {
  const data = dataBawaan(kode, index);
  return data ? { ...data, id: `bawaan-${kode}` } : null;
}

/**
 * Siapkan empat data bawaan untuk Admin Panel. Upsert tidak mengubah baris
 * yang sudah ada, jadi pemanggilan berulang aman dan tidak menimpa suntingan.
 */
async function pastikanJurusanBawaan(): Promise<void> {
  for (const [index, item] of JURUSAN_BAWAAN.entries()) {
    const data = dataBawaan(item.kode, index);
    if (!data) continue;
    await prisma.jurusan.upsert({
      where: { kode: item.kode },
      create: data,
      update: {},
    });
  }
}

function itemDariRow(row: Row): JurusanItem {
  return {
    kode: row.kode,
    nama: row.nama,
    singkatan: row.singkatan,
    tagline: row.tagline,
    deskripsi: row.deskripsi,
    skills: row.skills,
    ikon: row.ikon,
    warna: row.warna,
    bawaan: row.bawaan,
  };
}

/** Daftar kartu untuk situs: bawaan + jurusan aktif dari DB, terurut. */
export async function getJurusanAktif(): Promise<JurusanItem[]> {
  try {
    const rows = (await prisma.jurusan.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
      select: SELECT,
    })) as Row[];

    const rowBawaan = new Map(
      rows.filter((row) => row.bawaan).map((row) => [row.kode, row]),
    );
    const hasil: Array<{ item: JurusanItem; urutan: number; index: number }> = [];

    JURUSAN_BAWAAN.forEach((defaultItem, index) => {
      const row = rowBawaan.get(defaultItem.kode);
      if (row) {
        if (row.aktif) {
          hasil.push({
            item: itemDariRow(row),
            urutan: row.urutan,
            index,
          });
        }
        return;
      }
      hasil.push({ item: defaultItem, urutan: (index + 1) * 10, index });
    });

    rows.forEach((row, index) => {
      if (
        !row.aktif ||
        row.bawaan ||
        kodeDipakaiBawaan(row.kode)
      ) {
        return;
      }
      hasil.push({
        item: itemDariRow(row),
        urutan: row.urutan,
        index: JURUSAN_BAWAAN.length + index,
      });
    });

    return hasil
      .sort((a, b) => a.urutan - b.urutan || a.index - b.index)
      .map(({ item }) => item);
  } catch (error) {
    // Tabel belum dibuat (belum `prisma db push`) — situs tetap jalan
    // dengan jurusan bawaan saja.
    console.warn("[jurusan] gagal membaca tabel jurusans:", error);
    return [...JURUSAN_BAWAAN];
  }
}

/** Semua baris (termasuk non-aktif) untuk tabel Admin Panel. */
export async function listJurusanAdmin(): Promise<JurusanRecord[]> {
  try {
    await pastikanJurusanBawaan();
    const rows = (await prisma.jurusan.findMany({
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
      select: SELECT,
    })) as Row[];
    return rows.map(toRecord);
  } catch (error) {
    // Tabel belum dibuat (belum `prisma db push`) — panel tetap terbuka
    // dengan daftar kosong, bukan halaman error.
    console.warn("[jurusan] gagal membaca tabel jurusans:", error);
    return [];
  }
}

/** Satu jurusan tambahan berdasarkan kode URL. */
export async function getJurusanByKode(
  kode: string,
): Promise<JurusanRecord | null> {
  const row = (await prisma.jurusan.findUnique({
    where: { kode },
    select: SELECT,
  })) as Row | null;
  return row ? toRecord(row) : null;
}

/** Baca detail jurusan bawaan dari DB, atau fallback selama belum tersimpan. */
export async function getJurusanDetailBawaan(
  kode: string,
): Promise<JurusanRecord | null> {
  const index = JURUSAN_BAWAAN.findIndex((item) => item.kode === kode);
  if (index < 0) return null;

  try {
    const row = (await prisma.jurusan.findUnique({
      where: { kode },
      select: SELECT,
    })) as Row | null;
    if (row) return row.bawaan && row.aktif ? toRecord(row) : null;
  } catch (error) {
    console.warn(`[jurusan] gagal membaca detail ${kode}:`, error);
  }

  return fallbackBawaan(kode, index);
}

export type ValidResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

/** Terima string[] atau textarea multi-baris → daftar baris rapi. */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 30);
  }
  if (typeof value === "string") return parseBaris(value);
  return [];
}

/** Terima array objek, atau textarea "Judul | Deskripsi". */
function toPasangan(
  value: unknown,
  keyA: string,
  keyB: string,
): Array<Record<string, string>> {
  if (typeof value === "string") {
    const lines = parseBaris(value);
    return lines.map((line) => {
      const [first = "", ...rest] = line.split(/\s*[|\t]\s*|\s+-\s+/);
      return { [keyA]: first.trim(), [keyB]: rest.join(" — ").trim() };
    });
  }
  if (Array.isArray(value)) {
    return value
      .filter(
        (v): v is Record<string, unknown> =>
          typeof v === "object" && v !== null,
      )
      .map((v) => ({
        [keyA]: typeof v[keyA] === "string" ? (v[keyA] as string).trim() : "",
        [keyB]: typeof v[keyB] === "string" ? (v[keyB] as string).trim() : "",
      }))
      .filter((v) => v[keyA]);
  }
  return [];
}

const URL_GAMBAR = /^(https?:\/\/\S+|\/(?!\/)\S*)$/i;

/**
 * Validasi payload form admin (tambah/ubah jurusan).
 * `existingKode` dipakai saat edit supaya kode sendiri tidak dianggap bentrok.
 */
export function validateJurusan(
  body: unknown,
  options: { existingKode?: string } = {},
): ValidResult<JurusanPayload> {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Format data tidak dikenal.", status: 400 };
  }
  const b = body as Record<string, unknown>;
  const str = (key: string) =>
    typeof b[key] === "string" ? (b[key] as string).trim() : "";

  const nama = str("nama");
  const singkatan = str("singkatan");
  const deskripsi = str("deskripsi");
  if (nama.length < 3) {
    return { ok: false, error: "Nama jurusan minimal 3 karakter.", status: 400 };
  }
  if (!singkatan) {
    return { ok: false, error: "Singkatan wajib diisi.", status: 400 };
  }
  if (singkatan.length > 24) {
    return { ok: false, error: "Singkatan maksimal 24 karakter.", status: 400 };
  }
  if (!deskripsi) {
    return { ok: false, error: "Deskripsi singkat wajib diisi.", status: 400 };
  }
  if (deskripsi.length > 320) {
    return { ok: false, error: "Deskripsi maksimal 320 karakter.", status: 400 };
  }

  const kode = (str("kode") || slugify(nama)).trim();
  if (!KODE_REGEX.test(kode)) {
    return {
      ok: false,
      error: "Kode URL hanya boleh berisi huruf, angka, dan tanda minus (maks 31 karakter).",
      status: 400,
    };
  }
  if (
    kode.toLowerCase() !== (options.existingKode ?? "").toLowerCase() &&
    JURUSAN_BAWAAN.some((j) => j.kode.toLowerCase() === kode.toLowerCase())
  ) {
    return {
      ok: false,
      error: `Kode "${kode}" sudah dipakai jurusan bawaan.`,
      status: 409,
    };
  }

  const ikon = str("ikon") || "GraduationCap";
  if (!IKON_JURUSAN_KEYS.includes(ikon)) {
    return { ok: false, error: "Ikon tidak dikenal.", status: 400 };
  }
  const warna = str("warna") || "sky";
  if (!WARNA_JURUSAN_KEYS.includes(warna)) {
    return { ok: false, error: "Warna tidak dikenal.", status: 400 };
  }

  const gambar = str("gambar");
  if (gambar && !URL_GAMBAR.test(gambar)) {
    return {
      ok: false,
      error: "Gambar harus berupa URL HTTPS atau path lokal yang diawali /.",
      status: 400,
    };
  }

  const urutanRaw = Number(b.urutan);
  const urutan = Number.isFinite(urutanRaw)
    ? Math.min(9999, Math.max(0, Math.trunc(urutanRaw)))
    : 100;

  return {
    ok: true,
    data: {
      kode,
      nama,
      singkatan,
      tagline: str("tagline") || null,
      deskripsi,
      tentang: str("tentang"),
      skills: toStringArray(b.skills),
      keunggulan: toStringArray(b.keunggulan),
      kompetensi: toPasangan(b.kompetensi, "judul", "deskripsi").map((v) => ({
        judul: v.judul ?? "",
        deskripsi: v.deskripsi ?? "",
      })) as KompetensiItem[],
      karir: toPasangan(b.karir, "pekerjaan", "gaji").map((v) => ({
        pekerjaan: v.pekerjaan ?? "",
        gaji: v.gaji ?? "",
      })) as KarirItem[],
      ikon,
      warna,
      gambar: gambar || null,
      heroTeks: str("heroTeks") || null,
      introKompetensi: str("introKompetensi").slice(0, 300),
      introKarir: str("introKarir").slice(0, 300),
      ctaJudul: str("ctaJudul").slice(0, 160),
      ctaTeks: str("ctaTeks").slice(0, 500),
      urutan,
      aktif: typeof b.aktif === "boolean" ? b.aktif : b.aktif !== "false",
    },
  };
}
