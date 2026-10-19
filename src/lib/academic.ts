/**
 * Konfigurasi domain data akademik — dipakai Admin Panel (form & tabel)
 * dan portal siswa (tampilan per halaman /student/*).
 *
 * Murni konstanta/utilitas (tanpa akses DB) sehingga aman diimpor dari
 * komponen client maupun server.
 */

export const ACADEMIC_DOMAINS = [
  "schedule",
  "grades",
  "attendance",
  "tasks",
  "exam-card",
] as const;

export type AcademicDomain = (typeof ACADEMIC_DOMAINS)[number];

export function isAcademicDomain(value: string): value is AcademicDomain {
  return (ACADEMIC_DOMAINS as readonly string[]).includes(value);
}

/** Label & deskripsi per domain (dipakai admin & judul bagian siswa). */
export const ACADEMIC_META: Record<
  AcademicDomain,
  { label: string; title: string; description: string }
> = {
  schedule: {
    label: "Jadwal",
    title: "Jadwal Peserta",
    description: "Jadwal pelajaran, piket, dan kegiatan harian per jurusan.",
  },
  grades: {
    label: "Nilai",
    title: "Nilai / Rapor",
    description: "Nilai tugas, UTS/UAS, praktik, dan rapor per siswa.",
  },
  attendance: {
    label: "Absensi",
    title: "Absensi",
    description: "Kehadiran harian siswa: hadir, izin, sakit, alfa.",
  },
  tasks: {
    label: "Tugas",
    title: "Tugas",
    description: "Tugas dari guru beserta tenggat waktu pengumpulan.",
  },
  "exam-card": {
    label: "Kartu Ujian",
    title: "Kartu Ujian",
    description: "Kartu peserta ujian: jadwal, ruang, dan nomor duduk.",
  },
};

export const DAY_OPTIONS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

export const ATTENDANCE_STATUSES = ["HADIR", "IZIN", "SAKIT", "ALFA"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  HADIR: "Hadir",
  IZIN: "Izin",
  SAKIT: "Sakit",
  ALFA: "Alfa",
};

/** Warna badge kehadiran (tampilan siswa & admin). */
export const ATTENDANCE_TONES: Record<AttendanceStatus, string> = {
  HADIR: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IZIN: "bg-sky-50 text-sky-700 ring-sky-200",
  SAKIT: "bg-amber-50 text-amber-700 ring-amber-200",
  ALFA: "bg-rose-50 text-rose-700 ring-rose-200",
};

export const GRADE_KINDS = ["Tugas", "UTS", "UAS", "Praktik", "Rapor"] as const;

/** Predikat nilai untuk tampilan siswa. */
export function scorePredicate(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  return "D";
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Format tanggal "YYYY-MM-DD" → "Senin, 20 Okt 2026" tanpa masalah zona
 * waktu (diparse lokal dari komponennya, bukan new Date(string)).
 */
export function formatDateOnly(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return value;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return `${days[date.getDay()]}, ${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format tenggat yang bisa berisi waktu opsional:
 * "2026-10-20" → "20 Okt 2026"; "2026-10-20T23:59" → "20 Okt 2026, 23:59".
 */
export function formatDueAt(value: string | null | undefined): string {
  if (!value) return "—";
  const [datePart, timePart] = value.split("T");
  const formatted = formatDateOnly(datePart);
  return timePart ? `${formatted}, ${timePart}` : formatted;
}
