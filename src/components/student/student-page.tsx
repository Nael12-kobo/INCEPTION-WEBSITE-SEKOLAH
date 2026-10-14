import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionProvider } from "next-auth/react";
import type { LucideIcon } from "lucide-react";
import { Construction, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DashboardShell,
  type DashboardUser,
} from "@/components/dashboard/dashboard-shell";
import { isStudentStatus, JurusanLabel } from "@/lib/ppdb";
import { hasPermission } from "@/lib/roles";
import type { JurusanValue } from "@/lib/ppdb";

export const STUDENT_PAGES = [
  "schedule",
  "grades",
  "attendance",
  "tasks",
  "exam-card",
] as const;

export type StudentPageSlug = (typeof STUDENT_PAGES)[number];

export type StudentPageProps = {
  slug: StudentPageSlug;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Penjelasan singkat data apa yang nanti tampil di halaman ini. */
  emptyHint: string;
};

function initialsFrom(name: string, email: string): string {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

/**
 * Kerangka halaman /student/*.
 * - Wajib login.
 * - Wajib punya permission `student.access`.
 * - Wajib berstatus siswa aktif (PPDB REGISTERED) — selain itu redirect.
 *
 * Kontennya masih placeholder sampai skema data siswa (Bagian C) dibuat.
 */
export async function StudentPage({
  slug,
  title,
  description,
  icon: Icon,
  emptyHint,
}: StudentPageProps) {
  const callbackUrl = `/student/${slug}`;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      ppdbRegistration: {
        select: { status: true, majorFirst: true, majorSecond: true },
      },
    },
  });

  if (!user) redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!hasPermission(user.role, "student.access")) redirect("/dashboard");
  if (!isStudentStatus(user.ppdbRegistration?.status)) redirect("/dashboard");

  const dashboardUser: DashboardUser = {
    name: user.name ?? user.email ?? "Pengguna",
    email: user.email ?? "—",
    image: user.image,
    initials: initialsFrom(user.name ?? "", user.email ?? ""),
    providerLabel: "Portal Siswa",
    emailVerified: Boolean(user.emailVerified),
    joinedLabel: "Siswa aktif",
    role: user.role,
  };

  const majorFirst = user.ppdbRegistration?.majorFirst as
    | JurusanValue
    | undefined;
  const majorSecond = user.ppdbRegistration?.majorSecond as
    | JurusanValue
    | undefined;

  return (
    <SessionProvider session={session}>
      <DashboardShell user={dashboardUser} isStudent>
        <section className="space-y-6">
          <header className="rounded-3xl border border-sky-100 bg-card p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {title}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {description}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="success">Siswa aktif</Badge>
                {majorFirst && (
                  <span className="font-caption text-xs text-slate-400">
                    {JurusanLabel(majorFirst)}
                    {majorSecond ? ` → ${majorSecond}` : ""}
                  </span>
                )}
              </div>
            </div>
          </header>

          <Card className="bg-card">
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="font-h4">{title}</CardTitle>
                <CardDescription className="mt-1">{emptyHint}</CardDescription>
              </div>
              <Badge variant="secondary">Segera</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-slate-400 ring-1 ring-slate-200">
                  <Construction className="h-6 w-6" aria-hidden />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Belum ada data untuk ditampilkan
                </p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                  {emptyHint} Data ini akan muncul otomatis setelah diisi oleh
                  sekolah.
                </p>
              </div>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Info className="h-3.5 w-3.5" aria-hidden />
                Hubungi wali kelas bila ada data yang perlu diperbaiki.
              </p>
            </CardContent>
          </Card>
        </section>
      </DashboardShell>
    </SessionProvider>
  );
}
