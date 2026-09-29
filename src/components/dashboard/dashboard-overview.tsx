"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  CalendarDays,
  BellRing,
  Megaphone,
  Users,
  GraduationCap,
  CircleAlert,
  Shield,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { BarChart, type BarChartDatum } from "@/components/ui/bar-chart";
import { DonutChart, type DonutSegment } from "@/components/ui/donut-chart";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";
import { useSession } from "next-auth/react";
import { isAdmin as checkIsAdmin } from "@/lib/roles";
import { cn } from "@/lib/utils";

function greeting(hour: number) {
  if (hour >= 4 && hour < 11) return "Selamat pagi";
  if (hour >= 11 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
}

const agenda = [
  {
    tanggal: "2 Okt",
    bulan: "2026",
    judul: "Ujian Tengah Semester (UTS)",
    tempat: "Seluruh ruang kelas",
  },
  {
    tanggal: "8 Okt",
    bulan: "2026",
    judul: "Job Fair & rekrutmen mitra industri",
    tempat: "Aula lantai 2",
  },
  {
    tanggal: "15 Okt",
    bulan: "2026",
    judul: "Pekan Literasi Digital",
    tempat: "Perpustakaan & lab komputer",
  },
  {
    tanggal: "24 Okt",
    bulan: "2026",
    judul: "Study tour ke Balai TELKOM",
    tempat: "Kelas XI semua jurusan",
  },
];

const pengumuman = [
  {
    judul: "Pengisian KIP Kuliah gelombang 2 dibuka s.d. 10 Okt",
    badge: "Akademik",
  },
  {
    judul: "Wajib lapor wali kelas untuk rencana magang semester depan",
    badge: "Magang",
  },
  {
    judul: "Jadwal piket lab fiber optik diperbarui — cek papan informasi",
    badge: "Fasilitas",
  },
];

const adminActivities = [
  {
    time: "10:32",
    actor: "Bu Siti",
    action: "Menyetujui pendaftaran PPDB",
    entity: "Ahmad Fauzi (PPDB-2026-0847)",
  },
  {
    time: "09:15",
    actor: "Pak Rahman",
    action: "Memperbarui status berita",
    entity: "Penerimaan Siswa Baru 2026",
  },
  {
    time: "08:45",
    actor: "Bu Siti",
    action: "Menambahkan agenda baru",
    entity: "UTS Semester Ganjil",
  },
  {
    time: "Kemarin",
    actor: "Admin",
    action: "Mengubah role pengguna",
    entity: "Dewi Lestari → ADMIN",
  },
  {
    time: "Kemarin",
    actor: "Pak Rahman",
    action: "Menerbitkan pengumuman",
    entity: "Pendaftaran Magang Gelombang 2",
  },
];

const PPDB_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu jadwal tes",
  CONTACTED: "Sekretariat sudah menghubungi",
  REGISTERED: "Daftar ulang selesai",
  REJECTED: "Tidak lolos",
};

export type DashboardPpdb = {
  registrationNo: string;
  status: string;
  majorFirst: string;
  majorSecond: string;
} | null;

export interface DashboardOverviewProps {
  userName: string;
  todayLabel: string;
  hour: number;
  role?: string;
  totalUsers: number;
  totalPpdb: number;
  pendingPpdb: number;
  totalAdmins: number;
  ppdb7Days: BarChartDatum[];
  ppdbByMajor: DonutSegment[];
  ppdb?: DashboardPpdb;
}

export function DashboardOverview({
  userName,
  todayLabel,
  hour,
  role,
  totalUsers,
  totalPpdb,
  pendingPpdb,
  totalAdmins,
  ppdb7Days,
  ppdbByMajor,
  ppdb,
}: DashboardOverviewProps) {
  const ref = useAnimeReveal<HTMLElement>();
  const { data: session } = useSession();
  const [firstName] = userName.trim().split(/\s+/) || ["Sahabat"];
  const isAdmin = checkIsAdmin(role) || checkIsAdmin(session?.user?.role);

  return (
    <section id="ringkasan" ref={ref} className="scroll-mt-24 space-y-6">
      <div
        data-reveal-item
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-8 text-white shadow-lg shadow-sky-200 sm:p-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_20%,black,transparent)]"
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-xl">
            <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Portal Siswa
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              {greeting(hour)}, {firstName}!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sky-50/90 sm:text-base">
              Semua kebutuhan sekolah Anda dalam satu tempat — jadwal, pengumuman,
              hingga informasi PPDB. Silakan jelajahi menu di sisi kiri.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                asChild
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/40"
              >
                <a href="#agenda">
                  Lihat agenda
                  <ArrowRight aria-hidden />
                </a>
              </Button>
              <Button asChild className="bg-white text-sky-700 shadow-sm hover:bg-sky-50">
                <Link href="/ppdb">Info PPDB</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wider text-sky-100">
              Hari ini
            </p>
            <p className="mt-1 text-lg font-bold leading-snug">{todayLabel}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-sky-50/90">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden />
              Semester ganjil 2026/2027
            </p>
          </div>
        </div>
      </div>

      <div id="statistik" data-reveal-item className="scroll-mt-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            value={totalUsers}
            valueSuffix="+"
            label="Total Pengguna"
            sublabel="Terdaftar di sistem"
            colorTone="sky"
            trend={{ direction: "up", value: "12%", positive: true }}
          />
          <StatCard
            icon={GraduationCap}
            value={totalPpdb}
            label="Pendaftar PPDB"
            sublabel="Tahun ajaran 2026/2027"
            colorTone="emerald"
            trend={{ direction: "up", value: "8%", positive: true }}
          />
          <StatCard
            icon={CircleAlert}
            value={pendingPpdb}
            label="PPDB Pending"
            sublabel="Menunggu konfirmasi"
            colorTone="amber"
          />
          <StatCard
            icon={Shield}
            value={totalAdmins}
            label="Admin Aktif"
            sublabel="Pengelola sistem"
            colorTone="violet"
          />
        </div>
      </div>

      <div data-reveal-item className="grid gap-5 lg:grid-cols-5">
        <Card className="bg-white lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4">Pendaftaran PPDB 7 Hari Terakhir</CardTitle>
              <CardDescription className="mt-1">
                Tren jumlah pendaftar harian selama satu minggu terakhir.
              </CardDescription>
            </div>
            <Badge variant="info">PPDB</Badge>
          </CardHeader>
          <CardContent>
            <BarChart
              data={ppdb7Days}
              height={220}
              barColor="#0ea5e9"
              showValue={true}
              showAxisY={true}
              yTicks={4}
            />
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4">Distribusi Jurusan PPDB</CardTitle>
              <CardDescription className="mt-1">
                Pendaftar berdasarkan pilihan jurusan pertama.
              </CardDescription>
            </div>
            <Badge variant="violet">Jurusan</Badge>
          </CardHeader>
          <CardContent>
            <DonutChart
              segments={ppdbByMajor}
              size={200}
              thickness={28}
              centerLabel={totalPpdb}
              centerSubLabel="Total pendaftar"
            />
          </CardContent>
        </Card>
      </div>

      <div data-reveal-item className="grid gap-5 lg:grid-cols-5">
        <Card
          id="agenda"
          className="bg-white lg:col-span-3 scroll-mt-24"
        >
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4">Agenda Terdekat</CardTitle>
              <CardDescription className="mt-1">
                Empat kegiatan terjadwal berikutnya.
              </CardDescription>
            </div>
            <Badge variant="secondary">Oktober</Badge>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-1 border-l border-sky-100 pl-0">
              {agenda.map((a) => (
                <li
                  key={a.judul}
                  className="relative flex gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-sky-50/70"
                >
                  <span className="absolute -left-[21px] top-6 h-2.5 w-2.5 rounded-full border-2 border-white bg-sky-500" />
                  <div className="w-14 shrink-0 rounded-xl bg-sky-50 py-1.5 text-center ring-1 ring-sky-100">
                    <p className="text-sm font-extrabold text-sky-700">{a.tanggal}</p>
                    <p className="text-[10px] font-medium text-slate-400">{a.bulan}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{a.judul}</p>
                    <p className="text-xs text-slate-500">{a.tempat}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-white lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4">Pengumuman</CardTitle>
              <CardDescription className="mt-1">Info penting pekan ini.</CardDescription>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <BellRing className="h-4 w-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {pengumuman.map((p) => (
                <li
                  key={p.judul}
                  className="rounded-xl border border-slate-200 bg-white p-3 hover:bg-sky-50/50 transition-colors"
                >
                  <Badge variant="outline" className="text-[10px]">
                    {p.badge}
                  </Badge>
                  <p className="mt-2 text-sm font-medium leading-snug text-slate-700">
                    {p.judul}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <Megaphone className="h-3.5 w-3.5" aria-hidden />
              Diperbarui oleh bagian kesiswaan
            </p>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card data-reveal-item className="bg-gradient-to-r from-violet-50 to-sky-50 border-violet-200">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4 text-violet-900">Aktivitas Admin Terbaru</CardTitle>
              <CardDescription className="mt-1 text-violet-700">
                Log aktivitas pengelola sistem terbaru.
              </CardDescription>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 ring-1 ring-violet-200">
              <Shield className="h-4 w-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <ul className="space-y-0">
              {adminActivities.map((act, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors",
                  )}
                >
                  <span className="w-16 shrink-0 font-caption text-xs font-medium text-violet-600 tabular-nums">
                    {act.time}
                  </span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 ring-1 ring-violet-200">
                    <UserRound className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-violet-900">
                      <span className="font-semibold">{act.actor}</span>{" "}
                      <span className="text-slate-600">{act.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">{act.entity}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div data-reveal-item className="grid gap-5 lg:grid-cols-5">
        <Card className="bg-white lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="font-h4">Status Pendaftaran Anda</CardTitle>
              <CardDescription className="mt-1">
                Data diambil langsung dari formulir PPDB.
              </CardDescription>
            </div>
            <Badge variant="secondary">PPDB</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {ppdb ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-emerald-800">
                      Terdaftar — {ppdb.registrationNo}
                    </p>
                    <StatusBadge status={ppdb.status} />
                  </div>
                  <p className="mt-1 text-xs text-emerald-700/80">
                    {PPDB_STATUS_LABELS[ppdb.status] ?? "Proses berjalan"}. Jurusan{" "}
                    {ppdb.majorFirst}
                    {ppdb.majorSecond ? ` / ${ppdb.majorSecond}` : ""}. Detail dikirim
                    via WhatsApp.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    Belum mendaftar
                  </p>
                  <p className="text-xs text-amber-700/80">
                    Isi formulir PPDB untuk mendapatkan nomor pendaftaran dan jadwal
                    tes.
                  </p>
                </div>
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/ppdb">
                {ppdb ? "Lihat formulir" : "Isi formulir sekarang"}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
