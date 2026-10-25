import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_TONES,
  DAY_OPTIONS,
  formatDueAt,
  formatDateOnly,
  formatScheduleRange,
  compareScheduleStarts,
  scorePredicate,
  type AcademicDomain,
  type AttendanceStatus,
} from "@/lib/academic";
import { JurusanLabel, type JurusanValue } from "@/lib/ppdb";
import { getPpdbJurusanOptions } from "@/lib/ppdb-jurusan-server";

/**
 * Isi konten halaman /student/* sesuai domain akademik (Bagian C).
 * Server component: mengambil data milik siswa yang sedang login lalu
 * merender tabel/kartu — bila tidak ada data, `node` bernilai null agar
 * StudentPage menampilkan kotak kosong bawaannya.
 */

export type AcademicSectionResult = {
  hasData: boolean;
  count: number;
  node: React.ReactNode | null;
};

const EMPTY: AcademicSectionResult = { hasData: false, count: 0, node: null };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="font-overline text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

const TH =
  "px-4 py-2.5 text-left font-overline text-[10px] uppercase tracking-wider text-slate-500";
const TD = "px-4 py-2.5 text-sm text-slate-700";

async function scheduleSection(
  studentMajor: string | null
): Promise<AcademicSectionResult> {
  const rows = await prisma.academicSchedule.findMany();
  // Jadwal tanpa jurusan (data lama yang sebelumnya berlaku global) tidak
  // ditampilkan ke semua siswa. Admin perlu menetapkan jurusannya dahulu.
  const visible = studentMajor
    ? rows.filter((r) => r.major === studentMajor)
    : [];
  const jurusanOptions = await getPpdbJurusanOptions();
  const labelJurusan = (value: string) => {
    const option = jurusanOptions.find((item) => item.value === value);
    return option ? `${option.nama} (${option.kode})` : JurusanLabel(value);
  };
  const groups = DAY_OPTIONS.map((day) => ({
    day,
    items: visible
      .filter((r) => r.day === day)
      .sort((a, b) => compareScheduleStarts(a.startTime, b.startTime)),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return EMPTY;

  return {
    hasData: true,
    count: visible.length,
    node: (
      <div className="space-y-4">
        {groups.map((group) => (
          <div
            key={group.day}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            <div className="bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700">
              {group.day}
            </div>
            {/* Bungkus tabel dengan overflow-x-auto: kolom guru/mapel
                dipotong tanpa bisa digeser di 360px tanpa ini. */}
            <div className="subtle-scroll overflow-x-auto">
              <table className="w-full min-w-[420px]">
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="w-36 px-4 py-2.5 text-xs font-semibold tabular-nums text-slate-500">
                      {formatScheduleRange(item.startTime, item.endTime)}
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">
                      {item.subject}
                      {item.major ? (
                        <span className="ml-2 text-xs font-medium text-slate-400">
                          {labelJurusan(item.major)}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2.5 text-right text-sm text-slate-500">
                      {item.teacher ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ))}
      </div>
    ),
  };
}

async function gradesSection(userId: string): Promise<AcademicSectionResult> {
  const rows = await prisma.academicGrade.findMany({
    where: { userId },
    orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
  });
  if (rows.length === 0) return EMPTY;

  const avg = rows.reduce((sum, r) => sum + r.score, 0) / rows.length;
  const max = Math.max(...rows.map((r) => r.score));

  return {
    hasData: true,
    count: rows.length,
    node: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Rata-rata" value={avg.toFixed(1)} />
          <Stat label="Nilai tertinggi" value={String(max)} />
          <Stat label="Jumlah entri" value={String(rows.length)} />
        </div>
        <div className="overflow-x-auto subtle-scroll">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={TH}>Mata Pelajaran</th>
                <th className={TH}>Jenis</th>
                <th className={TH}>Nilai</th>
                <th className={TH}>Semester</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const pred = scorePredicate(row.score);
                const tone =
                  pred === "A"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : pred === "B"
                      ? "bg-sky-50 text-sky-700 ring-sky-200"
                      : pred === "C"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : "bg-rose-50 text-rose-700 ring-rose-200";
                return (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className={TD}>
                      <span className="font-semibold text-slate-800">
                        {row.subject}
                      </span>
                      {row.note ? (
                        <span className="block text-xs text-slate-400">
                          {row.note}
                        </span>
                      ) : null}
                    </td>
                    <td className={TD}>{row.kind}</td>
                    <td className={TD}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          {row.score}
                        </span>
                        <span
                          className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ring-1",
                            tone
                          )}
                        >
                          {pred}
                        </span>
                      </span>
                    </td>
                    <td className={TD}>{row.semester ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    ),
  };
}

async function attendanceSection(
  userId: string
): Promise<AcademicSectionResult> {
  const rows = await prisma.academicAttendance.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
  if (rows.length === 0) return EMPTY;

  const counts: Record<AttendanceStatus, number> = {
    HADIR: 0,
    IZIN: 0,
    SAKIT: 0,
    ALFA: 0,
  };
  for (const row of rows) {
    if (row.status in counts) counts[row.status as AttendanceStatus] += 1;
  }

  return {
    hasData: true,
    count: rows.length,
    node: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.keys(counts) as AttendanceStatus[]).map((status) => (
            <div
              key={status}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3"
            >
              <p className="font-overline text-[10px] uppercase tracking-wider text-slate-500">
                {ATTENDANCE_LABELS[status]}
              </p>
              <p className="mt-1 text-lg font-extrabold text-slate-800">
                {counts[status]}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto subtle-scroll">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={TH}>Tanggal</th>
                <th className={TH}>Status</th>
                <th className={TH}>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = row.status as AttendanceStatus;
                return (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className={TD}>{formatDateOnly(row.date)}</td>
                    <td className={TD}>
                      <span
                        className={cn(
                          "inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold ring-1",
                          ATTENDANCE_TONES[status] ??
                            "bg-slate-100 text-slate-600 ring-slate-200"
                        )}
                      >
                        {ATTENDANCE_LABELS[status] ?? status}
                      </span>
                    </td>
                    <td className={TD}>{row.note ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    ),
  };
}

async function tasksSection(
  studentMajor: string | null
): Promise<AcademicSectionResult> {
  const rows = await prisma.academicTask.findMany({
    where: studentMajor
      ? { OR: [{ major: null }, { major: studentMajor }] }
      : { major: null },
  });
  rows.sort((a, b) =>
    a.dueAt && b.dueAt
      ? a.dueAt.localeCompare(b.dueAt)
      : a.dueAt
        ? -1
        : b.dueAt
          ? 1
          : 0
  );
  if (rows.length === 0) return EMPTY;

  return {
    hasData: true,
    count: rows.length,
    node: (
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-2xl border border-slate-200 bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-slate-800">{row.title}</p>
              <span className="shrink-0 rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700 ring-1 ring-sky-100">
                {row.subject}
              </span>
            </div>
            {row.description ? (
              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                {row.description}
              </p>
            ) : null}
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  row.dueAt ? "bg-amber-400" : "bg-slate-300"
                )}
                aria-hidden
              />
              Tenggat: {formatDueAt(row.dueAt)}
            </p>
          </div>
        ))}
      </div>
    ),
  };
}

async function examCardSection(
  userId: string,
  student: { name: string; major: string | null }
): Promise<AcademicSectionResult> {
  const rows = await prisma.academicExamCard.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
  if (rows.length === 0) return EMPTY;

  return {
    hasData: true,
    count: rows.length,
    node: (
      <div className="space-y-4">
        {rows.map((row) => {
          const jadwal =
            row.endDate && row.endDate !== row.startDate
              ? `${formatDateOnly(row.startDate)} – ${formatDateOnly(row.endDate)}`
              : formatDateOnly(row.startDate);
          const items: { label: string; value: string }[] = [
            { label: "Nama peserta", value: student.name },
            {
              label: "Jurusan",
              value: student.major
                ? JurusanLabel(student.major as JurusanValue)
                : "—",
            },
            { label: "Nomor peserta", value: row.participantNo ?? "—" },
            { label: "Jadwal ujian", value: jadwal },
            { label: "Ruang", value: row.room },
            { label: "Nomor duduk", value: row.seatNo ?? "—" },
          ];
          return (
            <div
              key={row.id}
              className="overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-card to-card"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-100 bg-sky-100/70 px-5 py-3">
                <p className="font-overline text-[11px] uppercase tracking-widest text-sky-800">
                  Kartu Peserta Ujian
                </p>
                <p className="text-sm font-extrabold text-sky-900">
                  {row.examName}
                </p>
              </div>
              <div className="grid gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-3">
                {items.map((item) => (
                  <div key={item.label}>
                    <p className="font-overline text-[10px] uppercase tracking-wider text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              {row.note ? (
                <p className="border-t border-sky-100 bg-sky-50/60 px-5 py-3 text-xs font-medium text-slate-600">
                  {row.note}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    ),
  };
}

export async function AcademicSection({
  slug,
  userId,
  student,
}: {
  slug: AcademicDomain;
  userId: string;
  student: { name: string; email: string; major: string | null };
}): Promise<AcademicSectionResult> {
  switch (slug) {
    case "schedule":
      return scheduleSection(student.major);
    case "grades":
      return gradesSection(userId);
    case "attendance":
      return attendanceSection(userId);
    case "tasks":
      return tasksSection(student.major);
    case "exam-card":
      return examCardSection(userId, student);
  }
}

// (indikator domain akademik cukup dari import ACADEMIC_DOMAINS di konsumen)
