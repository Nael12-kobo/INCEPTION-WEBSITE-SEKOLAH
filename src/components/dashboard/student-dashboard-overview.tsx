import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  ListTodo,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  ATTENDANCE_LABELS,
  compareScheduleStarts,
  formatDueAt,
  formatScheduleRange,
  type AttendanceStatus,
} from "@/lib/academic";
import { scorePredicate } from "@/lib/academic";

const WIB_TZ = "Asia/Jakarta";
const SCHOOL_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const ENGLISH_DAY_TO_ID: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};
const EMPTY_ATTENDANCE: Record<AttendanceStatus, number> = {
  HADIR: 0,
  IZIN: 0,
  SAKIT: 0,
  ALFA: 0,
};

function greeting(hour: number) {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function getTodayWib() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "2000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

function EmptyLine({ children }: { children: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

function StudentStatCard({
  icon: Icon,
  value,
  valueSuffix = "",
  label,
  sublabel,
}: {
  icon: LucideIcon;
  value: number | string;
  valueSuffix?: string;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}{valueSuffix}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">{sublabel}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}

export async function StudentDashboardOverview({
  userId,
  userName,
  major,
  majorLabel,
  todayLabel,
  hour,
  semester,
}: {
  userId: string;
  userName: string;
  major: string;
  majorLabel: string;
  todayLabel: string;
  hour: number;
  semester: string;
}) {
  const today = getTodayWib();
  const [scheduleRows, grades, gradeSummary, attendanceRows, attendanceSummary, taskRows, examRows] =
    await Promise.all([
      prisma.academicSchedule.findMany({
        where: { major },
        select: { id: true, day: true, startTime: true, endTime: true, subject: true },
      }),
      prisma.academicGrade.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { id: true, subject: true, kind: true, score: true, semester: true },
      }),
      prisma.academicGrade.aggregate({
        where: { userId },
        _avg: { score: true },
        _count: { _all: true },
      }),
      prisma.academicAttendance.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 4,
        select: { id: true, date: true, status: true },
      }),
      prisma.academicAttendance.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      prisma.academicTask.findMany({
        where: { OR: [{ major: null }, { major }] },
        select: { id: true, title: true, subject: true, dueAt: true },
      }),
      prisma.academicExamCard.findMany({
        where: { userId, startDate: { gte: today } },
        orderBy: { startDate: "asc" },
        take: 2,
        select: { id: true, examName: true, startDate: true, endDate: true, room: true },
      }),
    ]);

  const scheduleByDay = new Map<string, typeof scheduleRows>();
  for (const row of scheduleRows) {
    const rows = scheduleByDay.get(row.day) ?? [];
    rows.push(row);
    scheduleByDay.set(row.day, rows);
  }
  for (const rows of scheduleByDay.values()) {
    rows.sort((a, b) => compareScheduleStarts(a.startTime, b.startTime));
  }

  const todayEnglish = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: WIB_TZ,
  }).format(new Date());
  const todayDay = ENGLISH_DAY_TO_ID[todayEnglish] ?? "Senin";
  const todayIndex = SCHOOL_WEEK.indexOf(todayDay);
  let displayScheduleDay = "";
  let displaySchedule: typeof scheduleRows = [];
  for (let offset = 0; offset < SCHOOL_WEEK.length; offset += 1) {
    const day = SCHOOL_WEEK[(todayIndex + offset) % SCHOOL_WEEK.length];
    const rows = scheduleByDay.get(day);
    if (rows?.length) {
      displayScheduleDay = day;
      displaySchedule = rows;
      break;
    }
  }

  const attendance = { ...EMPTY_ATTENDANCE };
  for (const row of attendanceSummary) {
    if (row.status in attendance) {
      attendance[row.status as AttendanceStatus] = row._count._all;
    }
  }
  const attendanceTotal = Object.values(attendance).reduce((sum, count) => sum + count, 0);
  const attendancePercent = attendanceTotal
    ? Math.round((attendance.HADIR / attendanceTotal) * 100)
    : null;

  const upcomingTasks = taskRows
    .filter((task) => !task.dueAt || task.dueAt >= today)
    .sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return a.title.localeCompare(b.title);
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return a.dueAt.localeCompare(b.dueAt);
    })
    .slice(0, 4);

  const [firstName] = userName.trim().split(/\s+/);
  const displayName = firstName || "Siswa";
  const average = gradeSummary._avg.score;
  const isTodaySchedule = displayScheduleDay === todayDay;

  return (
    <section id="ringkasan" className="scroll-mt-24 space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_20%,black,transparent)]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <Badge className="border-white/25 bg-card/15 text-white backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden />
              Ringkasan Siswa
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {greeting(hour)}, {displayName}!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sky-50/90 sm:text-base">
              Ringkasan akademik {majorLabel}. Cek jadwal, nilai, absensi, dan tugasmu di sini.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="outline"
                asChild
                className="border-white/30 bg-card/10 text-white hover:border-white/40 hover:bg-card/20"
              >
                <Link href="/student/schedule">
                  Jadwal lengkap <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild className="bg-card text-sky-700 shadow-sm hover:bg-sky-50">
                <Link href="/student/grades">Nilai / Rapor</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/25 bg-card/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wider text-sky-100">Hari ini</p>
            <p className="mt-1 text-lg font-bold leading-snug">{todayLabel}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-sky-50/90">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              {semester}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StudentStatCard
          icon={CalendarDays}
          value={displaySchedule.length}
          label={isTodaySchedule ? "Jadwal hari ini" : "Jadwal terdekat"}
          sublabel={displayScheduleDay || "Belum ada jadwal"}
        />
        <StudentStatCard
          icon={Award}
          value={average === null ? "—" : average.toFixed(1)}
          label="Rata-rata nilai"
          sublabel={`${gradeSummary._count._all} nilai tercatat`}
        />
        <StudentStatCard
          icon={ClipboardCheck}
          value={attendancePercent === null ? "—" : attendancePercent}
          valueSuffix={attendancePercent === null ? "" : "%"}
          label="Kehadiran"
          sublabel={attendanceTotal ? `${attendance.HADIR} dari ${attendanceTotal} presensi hadir` : "Belum ada data absensi"}
        />
        <StudentStatCard
          icon={ListTodo}
          value={upcomingTasks.length}
          label="Tugas mendatang"
          sublabel="Tugas sesuai jurusanmu"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="bg-card lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-h4">
                {isTodaySchedule ? "Jadwal hari ini" : "Jadwal berikutnya"}
              </CardTitle>
              <CardDescription className="mt-1">
                {displayScheduleDay ? `${displayScheduleDay} · ${majorLabel}` : "Jadwal khusus jurusanmu"}
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/student/schedule">Semua jadwal</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {displaySchedule.length ? (
              <ol className="space-y-2">
                {displaySchedule.map((row) => (
                  <li key={row.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                    <span className="inline-flex min-w-[4.75rem] items-center justify-center rounded-lg bg-sky-50 px-2 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
                      {formatScheduleRange(row.startTime, row.endTime)}
                    </span>
                    <span className="min-w-0 text-sm font-semibold text-slate-800">{row.subject}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyLine>Belum ada jadwal yang diatur untuk jurusanmu.</EmptyLine>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-h4">Tugas mendatang</CardTitle>
              <CardDescription className="mt-1">Tugas umum dan tugas {majorLabel}.</CardDescription>
            </div>
            <ListTodo className="h-5 w-5 text-amber-500" aria-hidden />
          </CardHeader>
          <CardContent>
            {upcomingTasks.length ? (
              <ul className="space-y-3">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{task.subject}</p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {formatDueAt(task.dueAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine>Belum ada tugas mendatang.</EmptyLine>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link href="/student/tasks">Buka semua tugas <ArrowRight aria-hidden /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="bg-card">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-h4">Nilai terbaru</CardTitle>
              <CardDescription className="mt-1">Nilai yang sudah dicatat untuk akunmu.</CardDescription>
            </div>
            <Award className="h-5 w-5 text-emerald-500" aria-hidden />
          </CardHeader>
          <CardContent>
            {grades.length ? (
              <ul className="divide-y divide-slate-100">
                {grades.map((grade) => (
                  <li key={grade.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{grade.subject}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{grade.kind}{grade.semester ? ` · ${grade.semester}` : ""}</p>
                    </div>
                    <Badge variant={grade.score >= 70 ? "success" : "warning"}>
                      {grade.score} · {scorePredicate(grade.score)}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine>Belum ada nilai yang dicatat.</EmptyLine>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link href="/student/grades">Lihat semua nilai <ArrowRight aria-hidden /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-h4">Ringkasan absensi</CardTitle>
              <CardDescription className="mt-1">
                {attendanceTotal ? `${attendanceTotal} presensi tercatat` : "Rekap kehadiran pribadimu."}
              </CardDescription>
            </div>
            <ClipboardCheck className="h-5 w-5 text-violet-500" aria-hidden />
          </CardHeader>
          <CardContent>
            {attendanceTotal ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[]).map((status) => (
                    <div key={status} className="rounded-xl border border-slate-200 px-3 py-2.5">
                      <p className="text-xs text-slate-500">{ATTENDANCE_LABELS[status]}</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">{attendance[status]}</p>
                    </div>
                  ))}
                </div>
                {attendanceRows.length ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
                    Presensi terakhir: {attendanceRows[0].date} · {ATTENDANCE_LABELS[attendanceRows[0].status as AttendanceStatus] ?? attendanceRows[0].status}
                  </p>
                ) : null}
              </>
            ) : (
              <EmptyLine>Belum ada data absensi yang dicatat.</EmptyLine>
            )}
            <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
              <Link href="/student/attendance">Lihat absensi <ArrowRight aria-hidden /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {examRows.length ? (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-h4">Ujian berikutnya</CardTitle>
            <CardDescription>Kartu ujian pribadimu.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {examRows.map((exam) => (
              <div key={exam.id} className="rounded-xl border border-slate-200 p-4">
                <p className="font-semibold text-slate-800">{exam.examName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {exam.startDate}{exam.endDate && exam.endDate !== exam.startDate ? ` – ${exam.endDate}` : ""}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden /> {exam.room}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <p className="text-center text-xs text-slate-400">
        Ringkasan ini hanya menampilkan data akademik milik akunmu.
      </p>
    </section>
  );
}
