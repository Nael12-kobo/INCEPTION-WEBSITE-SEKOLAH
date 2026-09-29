"use client";

import { ArrowRight, BellRing, CalendarDays, Megaphone, Sparkles, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";
import { useSession } from "next-auth/react";
import { isAdmin as checkIsAdmin } from "@/lib/roles";

/** Sapaan sesuai jam WIB server/client (aman hydration: format fix, tanpa Date.now di render). */
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

export function WelcomeSection({
  userName,
  todayLabel,
  hour,
  role,
}: {
  userName: string;
  todayLabel: string;
  /** Jam lokal saat render server — dipakai untuk sapaan agar aman hydration. */
  hour: number;
  /** Role dari DB (server) — sumber kebenaran untuk tampilan admin card. */
  role?: string;
}) {
  const ref = useAnimeReveal<HTMLElement>();
  const { data: session } = useSession();
  const [firstName, lastName] = userName.trim().split(/\s+/) || ["Sahabat"];
  const fullName = `${firstName} ${lastName}`;
  const isAdmin = checkIsAdmin(role) || checkIsAdmin(session?.user?.role);

  return (
    <section id="ringkasan" ref={ref} className="scroll-mt-24">
      {/* Kartu sapaan gradien */}
      <div
        data-reveal-item
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 p-7 text-white shadow-lg shadow-sky-200 sm:p-9"
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
              {greeting(hour)}, {fullName}!
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-sky-50/90 sm:text-base">
              Semua kebutuhan sekolah Anda dalam satu tempat — jadwal, pengumuman, hingga
              informasi PPDB. Silakan jelajahi menu di sisi kiri.
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
              <Button
                asChild
                className="bg-white text-sky-700 shadow-sm hover:bg-sky-50"
              >
                <a href="#ppdb">Info PPDB</a>
              </Button>
            </div>
          </div>

          {/* Kartu tanggal */}
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

      {/* Grid bawah: agenda + pengumuman */}
      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        {/* Agenda */}
        <Card
          id="agenda"
          data-reveal-item
          className="scroll-mt-24 bg-white lg:col-span-3"
        >
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Agenda terdekat</CardTitle>
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

        {/* Pengumuman */}
        <Card data-reveal-item className="bg-white lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Pengumuman</CardTitle>
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
                  className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5"
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

      {/* Admin Access Card - Only shown to admins */}
      {isAdmin && (
        <Card data-reveal-item className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base text-purple-900">Akses Admin</CardTitle>
              <CardDescription className="mt-1 text-purple-700">
                Kelola pengguna dan pendaftaran PPDB
              </CardDescription>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 ring-1 ring-purple-200">
              <Shield className="h-4 w-4" aria-hidden />
            </span>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              <a href="/admin">
                <Shield className="h-4 w-4 mr-2" aria-hidden />
                Buka Panel Admin
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
