import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCog,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  UserRoundPlus,
  ClipboardList,
  Activity,
  LineChart,
  PieChart,
} from "lucide-react";
import { requireAdmin, isSuperAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { BarChart } from "@/components/ui/bar-chart";
import { DonutChart } from "@/components/ui/donut-chart";

export const metadata = {
  title: "Overview — Admin Panel | SMK Tunas Harapan",
  description: "Ringkasan operasional dan metrik sistem admin panel.",
};

const MAJOR_COLORS: Record<string, string> = {
  DKV: "#8b5cf6",
  PPLG: "#0ea5e9",
  TJKT: "#10b981",
  TKR: "#f59e0b",
};

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export default async function AdminOverviewPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/overview");
  }

  const viewerIsSuperAdmin = isSuperAdmin(session.user.role);

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalAdmins,
    totalPpdb,
    pendingCount,
    registeredCount,
    rejectedCount,
    recentRegistrations,
    majorGroups,
    recentPpdbRows,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    }),
    prisma.ppdbRegistration.count(),
    prisma.ppdbRegistration.count({ where: { status: "PENDING" } }),
    prisma.ppdbRegistration.count({ where: { status: "REGISTERED" } }),
    prisma.ppdbRegistration.count({ where: { status: "REJECTED" } }),
    prisma.ppdbRegistration.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ppdbRegistration.groupBy({
      by: ["majorFirst"],
      _count: { _all: true },
    }),
    prisma.ppdbRegistration.findMany({
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
        email: true,
        majorFirst: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const dayBuckets = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo);
    d.setDate(thirtyDaysAgo.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    return { key, label: formatDayLabel(d), value: 0 };
  });
  const bucketMap = new Map(dayBuckets.map((b) => [b.key, b]));
  for (const row of recentRegistrations) {
    const key = row.createdAt.toISOString().slice(0, 10);
    const bucket = bucketMap.get(key);
    if (bucket) bucket.value += 1;
  }
  const trendData = dayBuckets.map(({ label, value }) => ({ label, value }));

  const majorSegments = majorGroups.map((g) => ({
    label: g.majorFirst,
    value: g._count._all,
    color: MAJOR_COLORS[g.majorFirst] ?? "#64748b",
  }));
  const majorTotal = majorSegments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-h1 text-slate-900">Dashboard Admin</h1>
        <p className="font-body text-slate-500">
          Ringkasan operasional dan metrik sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Pengguna"
          value={totalUsers}
          icon={Users}
          accent="sky"
          description="Seluruh akun terdaftar"
        />
        <StatCard
          title="Total Admin"
          value={totalAdmins}
          icon={UserCog}
          accent="violet"
          description="ADMIN + SUPER_ADMIN"
        />
        <StatCard
          title="Total PPDB"
          value={totalPpdb}
          icon={FileSpreadsheet}
          accent="emerald"
          description="Semua pendaftaran"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock}
          accent="amber"
          description="Menunggu diproses"
        />
        <StatCard
          title="Registered"
          value={registeredCount}
          icon={CheckCircle2}
          accent="emerald"
          description="Sudah terdaftar resmi"
        />
        <StatCard
          title="Rejected"
          value={rejectedCount}
          icon={XCircle}
          accent="rose"
          description="Pendaftaran ditolak"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-sky-600" />
                  Tren Pendaftaran 30 Hari
                </CardTitle>
                <CardDescription>
                  Jumlah pendaftar PPDB per hari
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {recentRegistrations.length} data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {trendData.some((d) => d.value > 0) ? (
              <BarChart data={trendData.filter((_, i) => i % 3 === 0 || i === trendData.length - 1)} height={220} showValue />
            ) : (
              <div className="h-56 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-dashed border-slate-200">
                <div className="text-center space-y-2">
                  <LineChart className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="font-caption text-slate-400">
                    Belum ada pendaftaran dalam 30 hari terakhir
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-violet-600" />
                  Distribusi Jurusan
                </CardTitle>
                <CardDescription>
                  Perbandingan pilihan jurusan utama
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {majorTotal} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {majorSegments.length > 0 ? (
              <div className="flex justify-center py-2">
                <DonutChart
                  segments={majorSegments}
                  size={200}
                  thickness={26}
                  centerLabel={majorTotal}
                  centerSubLabel="Pendaftar"
                />
              </div>
            ) : (
              <div className="h-56 w-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border border-dashed border-slate-200">
                <div className="text-center space-y-2">
                  <PieChart className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="font-caption text-slate-400">
                    Belum ada data jurusan
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-h3 text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/admin/users" className="block group">
            <Card className="h-full hover-lift transition-all group-hover:border-sky-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50">
                    <UserRoundPlus className="h-6 w-6 text-sky-600" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-h4 text-slate-900">Kelola Pengguna</h3>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0" />
                    </div>
                    <p className="font-caption text-slate-500 leading-relaxed">
                      Tambah, edit, atau hapus akun pengguna dan atur peran.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/ppdb" className="block group">
            <Card className="h-full hover-lift transition-all group-hover:border-emerald-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50">
                    <ClipboardList className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-h4 text-slate-900">Review PPDB</h3>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </div>
                    <p className="font-caption text-slate-500 leading-relaxed">
                      Tinjau pendaftaran, ubah status, dan proses seleksi.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {viewerIsSuperAdmin && (
            <Link href="/admin/audit" className="block group">
              <Card className="h-full hover-lift transition-all group-hover:border-violet-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50">
                      <Activity className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-h4 text-slate-900">Audit Aktivitas</h3>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
                      </div>
                      <p className="font-caption text-slate-500 leading-relaxed">
                        Lihat riwayat perubahan dan aktivitas admin di sistem.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-sky-600" />
                Recent Registrations
              </CardTitle>
              <CardDescription>
                Pendaftaran PPDB terbaru
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/ppdb">
                Lihat semua
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentPpdbRows.length === 0 ? (
            <p className="font-caption text-slate-400 text-center py-8">
              Belum ada pendaftaran PPDB.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[420px] sm:min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                      No. Reg
                    </th>
                    <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                      Nama
                    </th>
                    <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden sm:table-cell">
                      Jurusan
                    </th>
                    <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                      Status
                    </th>
                    <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden md:table-cell">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPpdbRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <span className="font-caption font-semibold text-sky-600">
                          {row.registrationNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-body text-sm font-medium text-slate-900">
                          {row.fullName}
                        </div>
                        <div className="font-caption text-[11px] text-slate-400 hidden sm:block">
                          {row.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {row.majorFirst}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={row.status}>{row.status}</StatusBadge>
                      </td>
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <span className="font-caption text-[11px] text-slate-500">
                          {row.createdAt.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
