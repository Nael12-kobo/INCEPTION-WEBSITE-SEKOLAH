import { prisma } from "@/lib/prisma";
import {
  ACADEMIC_DOMAINS,
  ATTENDANCE_STATUSES,
  DAY_OPTIONS,
  GRADE_KINDS,
  type AcademicDomain,
} from "@/lib/academic";

/**
 * Sisi server fitur data akademik: validasi payload form admin + operasi
 * CRUD per domain. Dipakai route /api/admin/academic/* — jangan diimpor
 * dari komponen client (mengimpor prisma).
 */

export type AcademicError = { ok: false; error: string; status: number };

export type AcademicResult<T> = { ok: true; data: T } | AcademicError;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function bodyOf(body: unknown): Record<string, unknown> {
  return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
}

function str(body: Record<string, unknown>, key: string): string {
  const v = body[key];
  return typeof v === "string" ? v.trim() : "";
}

function optStr(body: Record<string, unknown>, key: string): string | null {
  const value = str(body, key);
  return value === "" ? null : value;
}

function fail(error: string, status = 400): AcademicError {
  return { ok: false, error, status };
}

/** Siswa target harus ada & berstatus REGISTERED (siswa aktif). */
async function validateStudent(userId: string) {
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, ppdbRegistration: { select: { status: true } } },
  });
  if (!target) return fail("Siswa tidak ditemukan.", 404);
  if (target.ppdbRegistration?.status !== "REGISTERED") {
    return fail("Data hanya boleh untuk siswa aktif (sudah diloloskan).");
  }
  return { ok: true as const, userId: target.id };
}

/**
 * Validasi & normalisasi payload form (create/update) per domain.
 * PATCH memakai payload penuh dari form yang sama.
 */
export async function validateAcademic(
  domain: AcademicDomain,
  body: unknown
): Promise<AcademicResult<Record<string, unknown>>> {
  const b = bodyOf(body);

  switch (domain) {
    case "schedule": {
      const day = str(b, "day");
      const startTime = str(b, "startTime");
      const endTime = str(b, "endTime");
      const subject = str(b, "subject");
      if (!DAY_OPTIONS.includes(day as (typeof DAY_OPTIONS)[number]))
        return fail("Hari tidak valid.");
      if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime))
        return fail("Jam mulai/selesai tidak valid (HH:mm).");
      if (!subject) return fail("Mata pelajaran wajib diisi.");
      return {
        ok: true,
        data: {
          day,
          startTime,
          endTime,
          subject,
          teacher: optStr(b, "teacher"),
          major: optStr(b, "major"),
        },
      };
    }

    case "grades": {
      const userId = str(b, "userId");
      const subject = str(b, "subject");
      const kind = str(b, "kind");
      if (!userId) return fail("Siswa wajib dipilih.");
      const student = await validateStudent(userId);
      if (!student.ok) return student;
      if (!subject) return fail("Mata pelajaran wajib diisi.");
      if (!GRADE_KINDS.includes(kind as (typeof GRADE_KINDS)[number]))
        return fail("Jenis nilai tidak valid.");
      const rawScore =
        typeof b.score === "number"
          ? b.score
          : Number(String(b.score ?? "").trim());
      if (
        String(b.score ?? "").trim() === "" ||
        !Number.isFinite(rawScore) ||
        rawScore < 0 ||
        rawScore > 100
      )
        return fail("Nilai harus berupa angka 0–100.");
      return {
        ok: true,
        data: {
          userId: student.userId,
          subject,
          kind,
          score: rawScore,
          semester: optStr(b, "semester"),
          note: optStr(b, "note"),
        },
      };
    }

    case "attendance": {
      const userId = str(b, "userId");
      const date = str(b, "date");
      const status = str(b, "status");
      if (!userId) return fail("Siswa wajib dipilih.");
      const student = await validateStudent(userId);
      if (!student.ok) return student;
      if (!DATE_RE.test(date)) return fail("Tanggal tidak valid (YYYY-MM-DD).");
      if (!ATTENDANCE_STATUSES.includes(status as (typeof ATTENDANCE_STATUSES)[number]))
        return fail("Status absensi tidak valid.");
      return {
        ok: true,
        data: {
          userId: student.userId,
          date,
          status,
          note: optStr(b, "note"),
        },
      };
    }

    case "tasks": {
      const title = str(b, "title");
      const subject = str(b, "subject");
      const dueAt = optStr(b, "dueAt");
      if (!title) return fail("Judul tugas wajib diisi.");
      if (!subject) return fail("Mata pelajaran wajib diisi.");
      if (dueAt && !DATE_RE.test(dueAt) && !DATE_TIME_RE.test(dueAt))
        return fail("Tenggat tidak valid.");
      return {
        ok: true,
        data: {
          title,
          subject,
          description: optStr(b, "description"),
          dueAt,
          major: optStr(b, "major"),
        },
      };
    }

    case "exam-card": {
      const userId = str(b, "userId");
      const examName = str(b, "examName");
      const startDate = str(b, "startDate");
      const endDate = optStr(b, "endDate");
      const room = str(b, "room");
      if (!userId) return fail("Siswa wajib dipilih.");
      const student = await validateStudent(userId);
      if (!student.ok) return student;
      if (!examName) return fail("Nama ujian wajib diisi.");
      if (!DATE_RE.test(startDate)) return fail("Tanggal mulai tidak valid.");
      if (endDate && !DATE_RE.test(endDate)) return fail("Tanggal selesai tidak valid.");
      if (!room) return fail("Ruang ujian wajib diisi.");
      return {
        ok: true,
        data: {
          userId: student.userId,
          examName,
          startDate,
          endDate,
          room,
          seatNo: optStr(b, "seatNo"),
          participantNo: optStr(b, "participantNo"),
          note: optStr(b, "note"),
        },
      };
    }
  }
}

const STUDENT_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
} as const;

function dayRank(day: string): number {
  const i = DAY_OPTIONS.indexOf(day as (typeof DAY_OPTIONS)[number]);
  return i === -1 ? 99 : i;
}

/** Daftar baris (diurutkan untuk tampilan) per domain. */
export async function listAcademic(domain: AcademicDomain): Promise<unknown[]> {
  switch (domain) {
    case "schedule": {
      const rows = await prisma.academicSchedule.findMany();
      return rows.sort(
        (a, b) => dayRank(a.day) - dayRank(b.day) || a.startTime.localeCompare(b.startTime)
      );
    }
    case "grades": {
      const rows = await prisma.academicGrade.findMany({
        include: STUDENT_INCLUDE,
        orderBy: { createdAt: "desc" },
      });
      return rows;
    }
    case "attendance": {
      const rows = await prisma.academicAttendance.findMany({
        include: STUDENT_INCLUDE,
        orderBy: { date: "desc" },
      });
      return rows;
    }
    case "tasks": {
      const rows = await prisma.academicTask.findMany();
      return rows.sort((a, b) =>
        a.dueAt && b.dueAt ? a.dueAt.localeCompare(b.dueAt) : a.dueAt ? -1 : b.dueAt ? 1 : 0
      );
    }
    case "exam-card": {
      const rows = await prisma.academicExamCard.findMany({
        include: STUDENT_INCLUDE,
        orderBy: { startDate: "desc" },
      });
      return rows;
    }
  }
}

export async function createAcademic(
  domain: AcademicDomain,
  data: Record<string, unknown>
): Promise<unknown> {
  switch (domain) {
    case "schedule":
      return prisma.academicSchedule.create({ data: data as never });
    case "grades":
      return prisma.academicGrade.create({ data: data as never });
    case "attendance":
      return prisma.academicAttendance.create({ data: data as never });
    case "tasks":
      return prisma.academicTask.create({ data: data as never });
    case "exam-card":
      return prisma.academicExamCard.create({ data: data as never });
  }
}

export async function updateAcademic(
  domain: AcademicDomain,
  id: string,
  data: Record<string, unknown>
): Promise<unknown> {
  switch (domain) {
    case "schedule":
      return prisma.academicSchedule.update({ where: { id }, data: data as never });
    case "grades":
      return prisma.academicGrade.update({ where: { id }, data: data as never });
    case "attendance":
      return prisma.academicAttendance.update({ where: { id }, data: data as never });
    case "tasks":
      return prisma.academicTask.update({ where: { id }, data: data as never });
    case "exam-card":
      return prisma.academicExamCard.update({ where: { id }, data: data as never });
  }
}

export async function deleteAcademic(
  domain: AcademicDomain,
  id: string
): Promise<boolean> {
  try {
    switch (domain) {
      case "schedule":
        await prisma.academicSchedule.delete({ where: { id } });
        break;
      case "grades":
        await prisma.academicGrade.delete({ where: { id } });
        break;
      case "attendance":
        await prisma.academicAttendance.delete({ where: { id } });
        break;
      case "tasks":
        await prisma.academicTask.delete({ where: { id } });
        break;
      case "exam-card":
        await prisma.academicExamCard.delete({ where: { id } });
        break;
    }
    return true;
  } catch {
    // Prisma P2025 (record tidak ada) → anggap sudah terhapus.
    return false;
  }
}

/** Ringkasan singkat satu baris untuk pesan audit. */
export function academicCaption(
  domain: AcademicDomain,
  data: Record<string, unknown>
): string {
  switch (domain) {
    case "schedule":
      return `${data.subject} (${data.day} ${data.startTime})`;
    case "grades":
      return `${data.subject} ${data.kind} = ${data.score}`;
    case "attendance":
      return `${data.date} ${data.status}`;
    case "tasks":
      return `${data.title} — ${data.subject}`;
    case "exam-card":
      return `${data.examName} ruang ${data.room}`;
  }
}

export { ACADEMIC_DOMAINS };
