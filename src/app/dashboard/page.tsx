import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DashboardShell,
  type DashboardUser,
  type DashboardActivityItem,
} from "@/components/dashboard/dashboard-shell";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AccountSection } from "@/components/dashboard/account-section";
import { ProgramsSection } from "@/components/dashboard/programs-section";
import { SessionProvider } from "next-auth/react";
import { UserRole, isAdmin as checkIsAdminRole } from "@/lib/roles";
import type { BarChartDatum } from "@/components/ui/bar-chart";
import type { DonutSegment } from "@/components/ui/donut-chart";

export const metadata = {
  title: "Dashboard — SMK Telekomunikasi Tunas Harapan",
  description: "Portal internal siswa: agenda, pengumuman, dan profil akun.",
};

const WIB_TZ = "Asia/Jakarta";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const MAJOR_COLORS: Record<string, string> = {
  DKV: "#0ea5e9",
  PPLG: "#10b981",
  TJKT: "#8b5cf6",
  TKR: "#f59e0b",
};

const DEFAULT_MAJORS = ["DKV", "PPLG", "TJKT", "TKR"];

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfDayWib(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = Number(parts.find((p) => p.type === "year")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "month")?.value ?? 1) - 1;
  const d = Number(parts.find((p) => p.type === "day")?.value ?? 1);
  return new Date(y, m, d, 0, 0, 0, 0);
}

function getDayLabelWib(date: Date): string {
  const dayShort = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: WIB_TZ,
  }).format(date);
  const idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(dayShort);
  return DAY_LABELS[idx >= 0 ? idx : 0];
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  const now = new Date();
  const sevenDaysAgo = addDays(startOfDayWib(now), -6);

  const [
    user,
    accounts,
    ppdb,
    totalUsers,
    totalPpdb,
    pendingPpdb,
    totalAdmins,
    ppdb7DaysRaw,
    ppdbByMajorRaw,
    recentActivityRaw,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
      },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true, createdAt: true },
      distinct: ["provider"],
    }),
    prisma.ppdbRegistration.findUnique({
      where: { userId },
      select: {
        registrationNo: true,
        status: true,
        majorFirst: true,
        majorSecond: true,
      },
    }),
    prisma.user.count(),
    prisma.ppdbRegistration.count(),
    prisma.ppdbRegistration.count({ where: { status: "PENDING" } }),
    prisma.user.count({
      where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
    }),
    prisma.ppdbRegistration.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    prisma.ppdbRegistration.groupBy({
      by: ["majorFirst"],
      _count: { _all: true },
    }),
    // Aktivitas terbaru untuk notifikasi bell — nyata dari audit log.
    prisma.auditLog
      ? prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, action: true, detail: true, createdAt: true },
      })
      : Promise.resolve([]),
  ]);

  if (!user) redirect("/auth/login?callbackUrl=/dashboard");

  const providerLabels: Record<string, string> = {
    credentials: "Email & kata sandi",
    google: "Google",
    github: "GitHub",
  };
  const providerLabel =
    accounts.map((a) => providerLabels[a.provider] ?? a.provider).join(", ") ||
    "Email & kata sandi";

  const earliestAccount = accounts.reduce<Date | null>(
    (min, a) => (min === null || a.createdAt < min ? a.createdAt : min),
    null
  );

  const dashboardUser: DashboardUser = {
    name: user.name ?? user.email ?? "Pengguna",
    email: user.email ?? "—",
    image: user.image,
    initials: initialsFrom(user.name ?? "", user.email ?? ""),
    providerLabel,
    emailVerified: user.emailVerified !== null,
    joinedLabel: earliestAccount
      ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: WIB_TZ,
      }).format(earliestAccount)
      : "Tidak tercatat",
    role: user.role,
  };

  const nowInWib = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: WIB_TZ,
  }).format(new Date());
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: WIB_TZ,
    }).format(new Date())
  );

  const ppdb7Days: BarChartDatum[] = Array.from({ length: 7 }, (_, i) => {
    const dayDate = addDays(sevenDaysAgo, i);
    const nextDay = addDays(dayDate, 1);
    const count = ppdb7DaysRaw.filter(
      (r) => r.createdAt >= dayDate && r.createdAt < nextDay
    ).length;
    return {
      label: getDayLabelWib(dayDate),
      value: count,
    };
  });

  const majorCountMap = new Map<string, number>();
  for (const m of DEFAULT_MAJORS) majorCountMap.set(m, 0);
  for (const row of ppdbByMajorRaw) {
    const key = row.majorFirst ?? "Lainnya";
    majorCountMap.set(key, (majorCountMap.get(key) ?? 0) + row._count._all);
  }

  const ppdbByMajor: DonutSegment[] = Array.from(majorCountMap.entries()).map(
    ([label, value]) => ({
      label,
      value,
      color: MAJOR_COLORS[label] ?? "#94a3b8",
    })
  );

  const activities: DashboardActivityItem[] = recentActivityRaw.map((log) => ({
    id: log.id,
    action: log.action,
    detail: log.detail,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <SessionProvider session={session}>
      <DashboardShell user={dashboardUser} activities={activities}>
        <DashboardOverview
          userName={dashboardUser.name}
          todayLabel={nowInWib}
          hour={hour}
          role={dashboardUser.role}
          totalUsers={totalUsers}
          totalPpdb={totalPpdb}
          pendingPpdb={pendingPpdb}
          totalAdmins={totalAdmins}
          ppdb7Days={ppdb7Days}
          ppdbByMajor={ppdbByMajor}
          adminActivities={
            checkIsAdminRole(dashboardUser.role)
              ? activities.map((a) => ({
                id: a.id,
                actorEmail: null,
                action: a.action,
                detail: a.detail,
                createdAt: a.createdAt,
              }))
              : []
          }
          ppdb={
            ppdb
              ? {
                registrationNo: ppdb.registrationNo,
                status: ppdb.status,
                majorFirst: ppdb.majorFirst,
                majorSecond: ppdb.majorSecond,
              }
              : null
          }
        />
        <AccountSection user={dashboardUser} />
        <ProgramsSection />
      </DashboardShell>
    </SessionProvider>
  );
}
