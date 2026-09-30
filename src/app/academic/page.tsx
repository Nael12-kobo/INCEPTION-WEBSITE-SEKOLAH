import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DashboardShell,
  type DashboardUser,
} from "@/components/dashboard/dashboard-shell";
import { AcademicClient } from "@/components/academic/academic-client";

export const metadata = {
  title: "Portal Akademik & Kurikulum — SMK Tunas Harapan",
  description: "Jadwal pelajaran mingguan, kalender ujian, rekap nilai siswa, dan materi pembelajaran digital.",
};

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export default async function AcademicPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/academic");
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, image: true, role: true, emailVerified: true },
  });

  if (!user) redirect("/auth/login?callbackUrl=/academic");

  const recentLogs = prisma.auditLog
    ? await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, action: true, detail: true, createdAt: true },
      })
    : [];

  const dashboardUser: DashboardUser = {
    name: user.name ?? user.email ?? "Pengguna",
    email: user.email ?? "—",
    image: user.image,
    initials: initialsFrom(user.name ?? "", user.email ?? ""),
    providerLabel: "Portal Siswa",
    emailVerified: Boolean(user.emailVerified),
    joinedLabel: "Aktif",
    role: user.role,
  };

  const activities = recentLogs.map((log) => ({
    id: log.id,
    action: log.action,
    detail: log.detail,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <DashboardShell user={dashboardUser} activities={activities}>
      <AcademicClient userName={dashboardUser.name} />
    </DashboardShell>
  );
}
