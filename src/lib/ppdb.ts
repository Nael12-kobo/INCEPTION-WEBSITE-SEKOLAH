/**
 * Data induk formulir PPDB.
 * Dipakai bersama oleh halaman /ppdb, form client, dan route /api/ppdb agar
 * pilihan jurusan, label, dan validasi tidak pernah berbeda di dua tempat.
 */

export const PPDB_YEAR = "2026/2027";
export const PPDB_PHASE = "Gelombang 1";

export const JURUSAN_OPTIONS = [
  {
    value: "DKV",
    kode: "DKV/MM",
    nama: "Desain Komunikasi Visual",
    deskripsi: "Desain grafis, foto & video, dan produksi konten kreatif.",
  },
  {
    value: "PPLG",
    kode: "PPLG/RPL",
    nama: "Pengembangan Perangkat Lunak dan Gim",
    deskripsi: "Web, aplikasi mobile, basis data, dan pengembangan game.",
  },
  {
    value: "TJKT",
    kode: "TJKT/TKJ",
    nama: "Teknik Jaringan Komputer dan Telekomunikasi",
    deskripsi: "Jaringan LAN/WAN, server, fiber optik, dan keamanan siber.",
  },
  {
    value: "TKR",
    kode: "TO/TKR",
    nama: "Teknik Otomotif Kendaraan Ringan",
    deskripsi: "Perawatan, overdraft, dan diagnosa kendaraan bermotor.",
  },
] as const;

export type JurusanValue = (typeof JURUSAN_OPTIONS)[number]["value"];

const JURUSAN_CODES: Record<JurusanValue, string> = {
  DKV: "DKV/MM",
  PPLG: "PPLG/RPL",
  TJKT: "TJKT/TKJ",
  TKR: "TO/TKR",
};

const JURUSAN_NAMES: Record<JurusanValue, string> = {
  DKV: "Desain Komunikasi Visual",
  PPLG: "Pengembangan Perangkat Lunak dan Gim",
  TJKT: "Teknik Jaringan Komputer dan Telekomunikasi",
  TKR: "Teknik Otomotif Kendaraan Ringan",
};

export const JURUSAN_VALUES = JURUSAN_OPTIONS.map((j) => j.value);

export function isJurusan(value: unknown): value is JurusanValue {
  return typeof value === "string" && JURUSAN_VALUES.includes(value as JurusanValue);
}

export function JurusanLabel(value: JurusanValue) {
  return `${JURUSAN_NAMES[value]} (${JURUSAN_CODES[value]})`;
}

export const GENDER_OPTIONS = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
] as const;

/** Nomor WhatsApp sekretariat SPMB, format internasional tanpa "+". */
export const WA_ADMIN = process.env.PPDB_WA_NUMBER ?? "6281298313040";
export const WA_ADMIN_URL = `https://wa.me/${WA_ADMIN}`;

export const FIELD_LABELS: Record<string, string> = {
  fullName: "Nama lengkap",
  email: "Alamat email",
  gender: "Jenis kelamin",
  birthPlace: "Tempat lahir",
  birthDate: "Tanggal lahir",
  previousSchool: "Asal SLTP/SMP/MTs",
  address: "Alamat tempat tinggal",
  phone: "No. HP/WhatsApp",
  majorFirst: "Pilihan jurusan 1",
  majorSecond: "Pilihan jurusan 2",
  parentName: "Nama orang tua/wali",
  parentPhone: "No. HP/WhatsApp orang tua",
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
}

export function isValidPhone(raw: string): boolean {
  return raw.replace(/\D/g, "").length >= 9;
}

export const PHONE_HINT = "Contoh: 0812-3456-7890";

export type PpdbDraft = Record<string, unknown>;

export type PpdbValues = {
  fullName: string;
  email: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  previousSchool: string;
  address: string;
  phone: string;
  majorFirst: JurusanValue;
  majorSecond: JurusanValue;
  parentName: string;
  parentPhone: string;
};

export type PpdbValidation =
  | { ok: true; data: PpdbValues }
  | { ok: false; errors: Record<string, string> };

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function ageInYears(date: Date): number {
  const diff = Date.now() - date.getTime();
  return diff / (365.25 * 24 * 60 * 60 * 1000);
}

/**
 * Validasi payload form. Dipanggil form client (untuk pesan inline) dan route
 * server (sebagai sumber kebenaran), sehingga keduanya tidak bisa berbeda.
 */
export function validatePpdbDraft(draft: PpdbDraft): PpdbValidation {
  const errors: Record<string, string> = {};

  const fullName = str(draft.fullName);
  const email = str(draft.email).toLowerCase();
  const gender = str(draft.gender).toUpperCase();
  const birthPlace = str(draft.birthPlace);
  const birthDate = str(draft.birthDate);
  const previousSchool = str(draft.previousSchool);
  const address = str(draft.address);
  const phone = str(draft.phone);
  const majorFirst = str(draft.majorFirst);
  const majorSecond = str(draft.majorSecond);
  const parentName = str(draft.parentName);
  const parentPhone = str(draft.parentPhone);

  if (fullName.length < 3) errors.fullName = "Nama lengkap minimal 3 karakter.";
  if (!EMAIL_RE.test(email)) errors.email = "Format email tidak valid.";

  if (!GENDER_OPTIONS.some((g) => g.value === gender)) {
    errors.gender = "Pilih jenis kelamin.";
  }
  if (!birthPlace) errors.birthPlace = "Tempat lahir wajib diisi.";

  if (!birthDate) {
    errors.birthDate = "Tanggal lahir wajib diisi.";
  } else {
    const born = new Date(birthDate);
    if (Number.isNaN(born.getTime())) {
      errors.birthDate = "Tanggal lahir tidak valid.";
    } else {
      // Calon siswa SMK umumnya 15–18 tahun; rentang 12–25 dipakai sebagai pagar.
      const age = ageInYears(born);
      if (age < 12) errors.birthDate = "Usu minimal 12 tahun.";
      else if (age > 25) errors.birthDate = "Usu maksimal 25 tahun.";
    }
  }

  if (!previousSchool) errors.previousSchool = "Asal sekolah wajib diisi.";
  if (address.length < 10) errors.address = "Alamat minimal 10 karakter.";

  if (!isValidPhone(phone)) errors.phone = "Nomor WhatsApp tidak valid.";

  if (!isJurusan(majorFirst)) {
    errors.majorFirst = "Pilih jurusan pertama.";
  } else if (!isJurusan(majorSecond)) {
    errors.majorSecond = "Pilih jurusan kedua.";
  } else if (majorSecond === majorFirst) {
    errors.majorSecond = "Jurusan kedua harus berbeda dari yang pertama.";
  }

  if (!parentName) errors.parentName = "Nama orang tua/wali wajib diisi.";
  if (!isValidPhone(parentPhone)) {
    errors.parentPhone = "Nomor WhatsApp orang tua tidak valid.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      fullName,
      email,
      gender,
      birthPlace,
      birthDate,
      previousSchool,
      address,
      phone,
      majorFirst: majorFirst as JurusanValue,
      majorSecond: majorSecond as JurusanValue,
      parentName,
      parentPhone,
    },
  };
}

/**
 * Nomor pendaftaran berurutan, mis. PPDB-2026-0007.
 * Route /api/ppdb menghitung dari jumlah baris tabel, dan kolom @unique
 * menjadi jaring pengaman terakhir bila ada pendaftaran bersamaan.
 */
export function registrationNoFromCount(count: number, year = new Date().getFullYear()) {
  return `PPDB-${year}-${String(count + 1).padStart(4, "0")}`;
}

/** Ringkasan data untuk pesan WhatsApp ke nomor pendaftar. */
export function buildStudentWaMessage(input: {
  registrationNo: string;
  fullName: string;
  majorFirst: JurusanValue;
  majorSecond: JurusanValue;
}): string {
  return [
    `Halo *${input.fullName}*, terima kasih sudah mendaftar di`,
    `*SMK Telekomunikasi Tunas Harapan* 🎓`,
    "",
    `*No. Pendaftaran:* ${input.registrationNo}`,
    `*Jurusan 1:* ${JurusanLabel(input.majorFirst)}`,
    `*Jurusan 2:* ${JurusanLabel(input.majorSecond)}`,
    "",
    "Informasi jadwal tes, syarat berkas, dan jadwal daftar ulang",
    "akan kami kirimkan ke nomor ini melalui WhatsApp.",
    "",
    "Formulir ini bersifat sementara sebagai bukti pendaftaran online.",
    "Daftar lengkap wajib diisi saat pendaftaran langsung di sekolah.",
    "📍 Jl. Umbul Senjoyo I No. 3, Desa Bener, Kec. Tengaran,",
    "Kab. Semarang, Jawa Tengah · ☎ (0298) 313040",
  ].join("\n");
}

export function buildAdminWaMessage(input: {
  registrationNo: string;
  fullName: string;
  phone: string;
  majorFirst: JurusanValue;
  majorSecond: JurusanValue;
  parentName: string;
}): string {
  return [
    `*Pendaftaran baru — PPDB ${PPDB_YEAR}*`,
    "",
    `No: ${input.registrationNo}`,
    `Nama: ${input.fullName}`,
    `WA: ${input.phone}`,
    `Jurusan 1: ${JurusanLabel(input.majorFirst)}`,
    `Jurusan 2: ${JurusanLabel(input.majorSecond)}`,
    `Orang tua/wali: ${input.parentName}`,
  ].join("\n");
}
