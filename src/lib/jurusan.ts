/**
 * Konfigurasi program keahlian (jurusan) — sumber kebenaran bersama untuk
 * homepage (`src/components/Jurusan.tsx`), daftar `/jurusan`, halaman detail,
 * dan Admin Panel.
 *
 * Empat jurusan BAWAAN tetap didefinisikan di sini sebagai fallback dan
 * metadata tampilan. Konten detailnya dapat diedit di Admin Panel dan
 * disimpan di tabel `jurusans`, bersama jurusan baru.
 *
 * Murni konstanta/utilitas tanpa akses DB — aman diimpor dari komponen
 * client maupun server.
 */

import {
  BookOpen,
  Briefcase,
  Camera,
  Code2,
  Cpu,
  Engine,
  GraduationCap,
  Laptop,
  Monitor,
  Network,
  Palette,
  RadioTower,
  Rocket,
  Wrench,
  Wifi,
  type LucideIcon,
} from "lucide-react";

/** Bentuk data jurusan yang aman dikirim ke client (serializable). */
export type JurusanItem = {
  /** Slug URL: `/jurusan/<kode>` (huruf kecil). */
  kode: string;
  /** Nama lengkap program keahlian. */
  nama: string;
  /** Singkatan/kode kelas untuk badge, mis. "PPLG". */
  singkatan: string;
  /** Subjudul hero halaman detail (null = tidak ada). */
  tagline: string | null;
  /** Ringkasan untuk kartu homepage & daftar /jurusan. */
  deskripsi: string;
  /** Chip keterampilan di kartu homepage. */
  skills: string[];
  /** Kunci ikon — lihat IKON_JURUSAN. */
  ikon: string;
  /** Kunci warna — lihat WARNA_JURUSAN. */
  warna: string;
  /** true → punya halaman detail statis (bawaan sekolah). */
  bawaan: boolean;
};

/** Materi yang dipelajari (kompetensi keahlian). */
export type KompetensiItem = { judul: string; deskripsi: string };

/** Prospek karir lulusan. */
export type KarirItem = { pekerjaan: string; gaji: string };

/** Jurusan bawaan — urutan tampil sama dengan data lama. */
export const JURUSAN_BAWAAN: JurusanItem[] = [
  {
    // Kode = slug URL yang sudah dipakai halaman statis (case-sensitive).
    kode: "PPLG",
    nama: "Pengembangan Perangkat Lunak Dan Gim",
    singkatan: "PPLG",
    tagline: "Pemrograman Perangkat Lunak & Gim",
    deskripsi:
      "Pengembangan web, aplikasi mobile, basis data, dan integrasi layanan digital modern.",
    skills: ["Web & Mobile", "Database", "UI/UX"],
    ikon: "Code2",
    warna: "red",
    bawaan: true,
  },
  {
    kode: "TJKT",
    nama: "Teknik Jaringan Komputer Dan Telekomunikasi",
    singkatan: "TJKT",
    tagline: "Teknologi Jaringan Komputer & Telekomunikasi",
    deskripsi:
      "Instalasi jaringan LAN/WAN, administrasi server, keamanan siber, dan cloud computing.",
    skills: ["Cisco & Mikrotik", "Linux Server", "Cyber Security"],
    ikon: "Network",
    warna: "gray",
    bawaan: true,
  },
  {
    kode: "DKV",
    nama: "Desain Komunikasi Visual",
    singkatan: "DKV",
    tagline: "Desain Komunikasi Visual",
    deskripsi:
      "Teori warna, tipografi, penggunaan perangkat lunak desain, ilustrasi digital, fotografi, dan videografi.",
    skills: ["Fotografi", "Videografi", "Broadcasting", "Illustrasi Digital"],
    ikon: "Camera",
    warna: "blue",
    bawaan: true,
  },
  {
    kode: "TKRO",
    nama: "Teknik Kendaraan Ringan Otomotif",
    singkatan: "TKRO",
    tagline: "Teknik Kendaraan Ringan Otomotif",
    deskripsi:
      "Perawatan dan perbaikan kendaraan bermotor, sistem elektrik, dan mekanik.",
    skills: ["Perawatan", "Perbaikan", "Sistem Elektrik"],
    ikon: "Engine",
    warna: "orange",
    bawaan: true,
  },
];

/** Ikon yang boleh dipilih admin (key disimpan di kolom `jurusans.ikon`). */
export const IKON_JURUSAN: Record<string, LucideIcon> = {
  GraduationCap,
  Code2,
  Network,
  Wifi,
  Camera,
  Palette,
  Engine,
  Wrench,
  Cpu,
  Monitor,
  Laptop,
  BookOpen,
  Briefcase,
  RadioTower,
  Rocket,
};

export const IKON_JURUSAN_KEYS = Object.keys(IKON_JURUSAN);

/** Ambil komponen ikon; fallback GraduationCap bila kunci tidak dikenal. */
export function getIkonJurusan(key: string): LucideIcon {
  return IKON_JURUSAN[key] ?? GraduationCap;
}

export type WarnaJurusan = {
  label: string;
  /** Latar kotak ikon di daftar /jurusan. */
  bg: string;
  /** Teks ikon di daftar /jurusan. */
  teks: string;
  /** Border kartu saat di-hover. */
  border: string;
  /** Kotak ikon saat grup di-hover. */
  hover: string;
  /** Gradient hero halaman detail. */
  hero: string;
  /** Teks aksen (mis. gaji karir) di halaman detail. */
  aksen: string;
};

/** Tema warna yang boleh dipilih admin (kolom `jurusans.warna`). */
export const WARNA_JURUSAN: Record<string, WarnaJurusan> = {
  red: {
    label: "Merah",
    bg: "bg-red-100 dark:bg-red-900/50",
    teks: "text-red-600 dark:text-red-400",
    border: "hover:border-red-300 dark:hover:border-red-600",
    hover: "group-hover:bg-red-600",
    hero: "from-[#3f0b16] via-[#991b1b] to-[#dc2626]",
    aksen: "text-red-600 dark:text-red-400",
  },
  gray: {
    label: "Abu-abu",
    bg: "bg-gray-100 dark:bg-gray-700",
    teks: "text-gray-600 dark:text-gray-300",
    border: "hover:border-gray-300 dark:hover:border-gray-500",
    hover: "group-hover:bg-gray-600",
    hero: "from-slate-700 via-slate-800 to-slate-950",
    aksen: "text-slate-600 dark:text-slate-300",
  },
  blue: {
    label: "Biru",
    bg: "bg-blue-100 dark:bg-blue-900/50",
    teks: "text-blue-600 dark:text-blue-400",
    border: "hover:border-blue-300 dark:hover:border-blue-600",
    hover: "group-hover:bg-blue-600",
    hero: "from-blue-700 via-blue-800 to-blue-950",
    aksen: "text-blue-600 dark:text-blue-400",
  },
  orange: {
    label: "Oranye",
    bg: "bg-orange-100 dark:bg-orange-900/50",
    teks: "text-orange-600 dark:text-orange-400",
    border: "hover:border-orange-300 dark:hover:border-orange-600",
    hover: "group-hover:bg-orange-600",
    hero: "from-orange-600 via-orange-700 to-amber-900",
    aksen: "text-orange-600 dark:text-orange-400",
  },
  sky: {
    label: "Biru langit",
    bg: "bg-sky-100 dark:bg-sky-900/50",
    teks: "text-sky-600 dark:text-sky-400",
    border: "hover:border-sky-300 dark:hover:border-sky-600",
    hover: "group-hover:bg-sky-600",
    hero: "from-sky-600 via-cyan-700 to-blue-900",
    aksen: "text-sky-600 dark:text-sky-400",
  },
  emerald: {
    label: "Hijau",
    bg: "bg-emerald-100 dark:bg-emerald-900/50",
    teks: "text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-600",
    hover: "group-hover:bg-emerald-600",
    hero: "from-emerald-600 via-teal-700 to-teal-950",
    aksen: "text-emerald-600 dark:text-emerald-400",
  },
  violet: {
    label: "Ungu",
    bg: "bg-violet-100 dark:bg-violet-900/50",
    teks: "text-violet-600 dark:text-violet-400",
    border: "hover:border-violet-300 dark:hover:border-violet-600",
    hover: "group-hover:bg-violet-600",
    hero: "from-violet-600 via-purple-700 to-indigo-950",
    aksen: "text-violet-600 dark:text-violet-400",
  },
  amber: {
    label: "Kuning-emas",
    bg: "bg-amber-100 dark:bg-amber-900/50",
    teks: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-600",
    hover: "group-hover:bg-amber-600",
    hero: "from-amber-500 via-orange-600 to-red-800",
    aksen: "text-amber-600 dark:text-amber-400",
  },
};

export const WARNA_JURUSAN_KEYS = Object.keys(WARNA_JURUSAN);

/** Ambil tema warna; fallback "sky" bila kunci tidak dikenal. */
export function getWarnaJurusan(key: string): WarnaJurusan {
  return WARNA_JURUSAN[key] ?? WARNA_JURUSAN.sky;
}

/** Kunci kode URL yang sah: huruf, angka, dan tanda minus (1–31 karakter). */
export const KODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9-]{0,30}$/;

/**
 * Kode jurusan bawaan dibandingkan tanpa memperhatikan huruf besar/kecil —
 * `/jurusan/pplg` tidak boleh dipakai jurusan baru karena bisa tabrakan
 * dengan halaman statis `/jurusan/PPLG`.
 */
export function kodeDipakaiBawaan(kode: string): boolean {
  const normalized = kode.trim().toLowerCase();
  return JURUSAN_BAWAAN.some((j) => j.kode.toLowerCase() === normalized);
}

/** Ubah teks bebas menjadi slug URL ("Teknik Mesin" → "teknik-mesin"). */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Pecah textarea menjadi daftar baris non-kosong (skills/keunggulan). */
export function parseBaris(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 30);
}

/** Gabung daftar menjadi teks textarea (kebalikan dari parseBaris). */
export function gabungBaris(values: readonly string[]): string {
  return values.join("\n");
}

/**
 * Pecah textarea "Judul | Deskripsi" per baris menjadi objek terstruktur.
 * Pemisah menerima "|", tab, atau " - " pertama pada baris.
 */
export function parsePasangan<T extends string>(
  value: string | null | undefined,
  keys: [T, T],
): Array<Record<T, string>> {
  const rows: Array<Record<T, string>> = [];
  for (const line of parseBaris(value)) {
    const parts = line.split(/\s*[|\t]\s*|\s+-\s+/);
    const first = (parts[0] ?? "").trim();
    const rest = parts
      .slice(1)
      .map((p) => p.trim())
      .filter(Boolean)
      .join(" — ");
    if (!first) continue;
    rows.push({ [keys[0]]: first, [keys[1]]: rest } as Record<T, string>);
  }
  return rows.slice(0, 30);
}

/** Ambil nilai string dari objek hasil parse (aman terhadap shape aneh). */
export function ambilString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** Normalisasi nilai Json kolom kompetensi menjadi daftar objek valid. */
export function kompetensiDariJson(value: unknown): KompetensiItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      judul: ambilString((item as { judul?: unknown })?.judul).trim(),
      deskripsi: ambilString((item as { deskripsi?: unknown })?.deskripsi).trim(),
    }))
    .filter((item) => item.judul)
    .slice(0, 30);
}

/** Normalisasi nilai Json kolom karir menjadi daftar objek valid. */
export function karirDariJson(value: unknown): KarirItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      pekerjaan: ambilString((item as { pekerjaan?: unknown })?.pekerjaan).trim(),
      gaji: ambilString((item as { gaji?: unknown })?.gaji).trim(),
    }))
    .filter((item) => item.pekerjaan)
    .slice(0, 30);
}

/** Pecah narasi "tentang" menjadi daftar paragraf. */
export function paragrafDariTeks(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
