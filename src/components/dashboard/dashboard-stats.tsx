"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Building2,
  CalendarCheck,
  CheckCircle2,
  CircleAlert,
  GraduationCap,
  LibraryBig,
  Users,
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
import { useAnimeCounter, useAnimeReveal } from "@/hooks/useAnimeReveal";

const statistik = [
  { icon: Users, value: 850, suffix: "+", label: "Siswa aktif", sub: "Semua jurusan" },
  { icon: GraduationCap, value: 64, suffix: "", label: "Guru & tendik", sub: "Staf tetap" },
  { icon: Building2, value: 12, suffix: "+", label: "Mitra industri", sub: "MoU aktif" },
  { icon: Award, value: 120, suffix: "+", label: "Prestasi", sub: "Sejak 2010" },
];

const fasilitas = [
  { icon: LibraryBig, label: "Perpustakaan digital", ketersediaan: "Buka 07.00–16.00" },
  { icon: CalendarCheck, label: "Lab jaringan & server", ketersediaan: "Praktik terjadwal" },
  { icon: Award, label: "Sertifikasi kompetensi", ketersediaan: "Kelas XII, gratis" },
];

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const ref = useAnimeCounter(value, { suffix });
  return <span ref={ref}>0{suffix}</span>;
}

export type DashboardPpdb = {
  registrationNo: string;
  status: string;
  majorFirst: string;
  majorSecond: string;
} | null;

const PPDB_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu jadwal tes",
  CONTACTED: "Sekretariat sudah menghubungi",
  REGISTERED: "Daftar ulang selesai",
  REJECTED: "Tidak lolos",
};

export function DashboardStats({ ppdb }: { ppdb?: DashboardPpdb }) {
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="statistik" ref={ref} className="mt-10 scroll-mt-24">
      {/* Kartu statistik */}
      <div data-reveal-item className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statistik.map((s) => (
          <div
            key={s.label}
            className="rounded-3xl border border-sky-100 bg-white p-5 text-center transition-shadow hover:shadow-lg hover:shadow-sky-100"
          >
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
              <s.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              <StatValue value={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Aktivitas akun + fasilitas */}
      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <Card data-reveal-item className="bg-white lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Status pendaftaran Anda</CardTitle>
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
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-emerald-800">
                    Terdaftar — {ppdb.registrationNo}
                  </p>
                  <p className="text-xs text-emerald-700/80">
                    {PPDB_STATUS_LABELS[ppdb.status] ?? "Proses berjalan"}. Jurusan {ppdb.majorFirst}
                    {ppdb.majorSecond ? ` / ${ppdb.majorSecond}` : ""}. Detail dikirim via WhatsApp.
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
                    Isi formulir PPDB untuk mendapatkan nomor pendaftaran dan jadwal tes.
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

        <Card data-reveal-item className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Layanan & fasilitas</CardTitle>
            <CardDescription>Akses yang tersedia untuk siswa.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {fasilitas.map((f) => (
                <li
                  key={f.label}
                  className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 ring-1 ring-sky-100">
                    <f.icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{f.label}</p>
                    <p className="text-xs text-slate-500">{f.ketersediaan}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
