/**
 * Berkas kelengkapan PPDB (syarat daftar ulang) — dipakai bersama oleh
 * dashboard siswa, endpoint unggah, dan panel admin PPDB supaya label &
 * aturan tidak pernah berbeda antar tempat.
 *
 * Pas foto tidak ada di daftar ini: pas foto disimpan di kolom
 * `User.photoBytes` karena sudah wajib sejak pengisian formulir.
 */

export const PPDB_DOC_KINDS = ["PEMBAYARAN", "RAPOR", "AKTE", "KK"] as const;

export type PpdbDocKind = (typeof PPDB_DOC_KINDS)[number];

export const PPDB_DOC_META: Record<
  PpdbDocKind,
  { label: string; hint: string }
> = {
  PEMBAYARAN: {
    label: "Biaya Pendaftaran Rp 60.000",
    hint: "Unggah bukti pembayaran/transfer — foto struk atau tangkapan layar.",
  },
  RAPOR: {
    label: "Fotokopi Rapor Semester 1–5",
    hint: "Boleh beberapa file sekaligus — misalnya satu file per semester.",
  },
  AKTE: {
    label: "Fotokopi Akte Kelahiran",
    hint: "Foto atau scan dokumen.",
  },
  KK: {
    label: "Fotokopi Kartu Keluarga",
    hint: "Foto atau scan dokumen.",
  },
};

/** Item pas foto pada checklist berkas (memakai foto siswa di akun). */
export const PPDB_PHOTO_META = {
  label: "Pas Foto 3×4 (5 lembar)",
  hint: "Unggah 1 foto digital; 5 lembar fisik dibawa saat daftar ulang.",
} as const;

/** Total item checklist berkas: 4 jenis dokumen + pas foto. */
export const PPDB_DOC_TOTAL = PPDB_DOC_KINDS.length + 1;

/** Batas ukuran per file — gambar dikompres dulu di browser. */
export const PPDB_DOC_MAX_BYTES = 5 * 1024 * 1024;

/** Batas jumlah file per jenis berkas (rapor bisa banyak halaman). */
export const PPDB_DOC_MAX_PER_KIND = 12;

export function isPpdbDocKind(value: unknown): value is PpdbDocKind {
  return (
    typeof value === "string" &&
    (PPDB_DOC_KINDS as readonly string[]).includes(value)
  );
}

/* ------------------------------------------------------------------ */
/* Penilaian admin per item berkas (Sesuai / Perlu perbaikan).         */
/* ------------------------------------------------------------------ */

export const PPDB_REVIEW_STATUSES = ["SESUAI", "PERLU_PERBAIKAN"] as const;

export type PpdbReviewStatus = (typeof PPDB_REVIEW_STATUSES)[number];

/** Item yang bisa dinilai admin: 4 jenis dokumen + pas foto. */
export const PPDB_REVIEW_KINDS = [...PPDB_DOC_KINDS, "FOTO"] as const;

export type PpdbReviewKind = (typeof PPDB_REVIEW_KINDS)[number];

export const PPDB_REVIEW_STATUS_LABELS: Record<PpdbReviewStatus, string> = {
  SESUAI: "Sesuai",
  PERLU_PERBAIKAN: "Perlu perbaikan",
};

/** Batas panjang catatan admin per item. */
export const PPDB_REVIEW_NOTE_MAX = 300;

export function isPpdbReviewKind(value: unknown): value is PpdbReviewKind {
  return (
    typeof value === "string" &&
    (PPDB_REVIEW_KINDS as readonly string[]).includes(value)
  );
}

export function isPpdbReviewStatus(value: unknown): value is PpdbReviewStatus {
  return (
    typeof value === "string" &&
    (PPDB_REVIEW_STATUSES as readonly string[]).includes(value)
  );
}

/** Label item penilaian — dokumen memakai label berkas, FOTO memakai label pas foto. */
export function ppdbReviewKindLabel(kind: PpdbReviewKind): string {
  return kind === "FOTO" ? PPDB_PHOTO_META.label : PPDB_DOC_META[kind].label;
}
