import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthLogo } from "@/components/auth/logo";
import { PpdbForm } from "@/components/ppdb/ppdb-form";
import { PpdbHero } from "@/components/ppdb/ppdb-hero";
import {
  JURUSAN_OPTIONS,
  PPDB_PHASE,
  PPDB_YEAR,
  WA_ADMIN_URL,
} from "@/lib/ppdb";

export const metadata: Metadata = {
  title: `PPDB ${PPDB_YEAR} — SMK Telekomunikasi Tunas Harapan`,
  description:
    "Formulir pendaftaran siswa baru SMK Telekomunikasi Tunas Harapan tahun pelajaran 2026/2027. Bebas zonasi, 4 Kompetensi Keahlian, tersedia beasiswa dan asrama.",
};

const Address = () => (
  <address className="not-italic">
    Jl. Umbul Senjoyo I No. 3, Desa Bener, Kec. Tengaran, Kabupaten Semarang, Jawa
    Tengah
  </address>
);

const STEPS = [
  "Isi formulir online ini dan dapatkan nomor pendaftaran.",
  "Tunggu jadwal tes yang dikirim ke nomor WhatsApp Anda.",
  "Datang ke sekolah dengan berkas asli (rapor, KK, akta, pas foto).",
  "Lengkapi daftar ulang dan lunas biaya pendidikan.",
] as const;

export default async function PpdbPage() {
  const session = await auth();
  // Pendaftaran memakai akun sekolah yang sudah ada — calon siswa login dulu
  // supaya data & nomor pendaftaran tertaut ke satu identitas.
  if (!session?.user?.email) {
    redirect("/auth/login?callbackUrl=/ppdb");
  }

  return (
    <div className="min-h-dvh bg-sky-50/60">
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <AuthLogo width={34} height={34} />
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900">
                SMK Telekomunikasi
              </span>
              <span className="block text-xs font-medium text-sky-600">
                Tunas Harapan
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <a href={WA_ADMIN_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden />
                Tanya PPDB
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <PpdbHero />

        {/* Kompetensi Keahlian */}
        <section className="mt-12">
          <div className="text-center">
            <Badge variant="secondary">Kompetensi Keahlian</Badge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
              Empat jurusan yang bisa dipilih
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
              Setiap pendaftar memilih dua jurusan: satu prioritas dan satu cadangan.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {JURUSAN_OPTIONS.map((j, i) => (
              <div
                key={j.value}
                className="flex gap-4 rounded-2xl border border-sky-100 bg-white p-5 transition-shadow hover:shadow-lg hover:shadow-sky-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">{j.nama}</p>
                  <Badge variant="outline" className="mt-1.5 text-[10px]">
                    {j.kode}
                  </Badge>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    {j.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Formulir + informasi */}
        <section className="mt-12 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
          <div>
            <Badge>Formulir Pendaftaran</Badge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
              Isi data calon siswa
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Isi sesuai akta kelahiran. Nomor pendaftaran otomatis dibuat server dan
              notifikasi dikirim ke nomor WhatsApp Anda.
            </p>
            <div className="mt-5">
              <PpdbForm defaultEmail={session.user.email} />
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-sky-100 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">
                Alur pendaftaran
              </h3>
              <ol className="mt-4 space-y-3.5">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-extrabold text-sky-700">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-slate-600">{s}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-3xl border border-sky-100 bg-white p-6">
              <h3 className="text-base font-extrabold text-slate-900">
                Datang langsung
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                <Address />
              </p>
              <a
                href="tel:+62298313040"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
              >
                <Phone className="h-4 w-4" aria-hidden />
                (0298) 313040
              </a>
              <Button asChild variant="outline" className="mt-4 w-full">
                <a href={WA_ADMIN_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle aria-hidden />
                  Chat WhatsApp PPDB
                </a>
              </Button>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-6">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-amber-900">
                <BadgeCheck className="h-4 w-4" aria-hidden />
                Sebelum mengirim
              </h3>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-amber-900/80">
                <li>Formulir ini hanya bukti pendaftaran online.</li>
                <li>Daftar lengkap wajib diisi saat datang ke sekolah.</li>
                <li>Informasi tes dikirim via WhatsApp, alternatif SMS.</li>
                <li>Jangan pernah membagikan kata sandi kepada siapa pun.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>

      <footer className="border-t border-sky-100 bg-white/60 py-8 text-center text-xs text-slate-400">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 sm:px-6">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          SMK Telekomunikasi Tunas Harapan · <Address /> · Telp. (0298) 313040
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} — Sistem Penerimaan Murid Baru {PPDB_PHASE}
        </p>
      </footer>
    </div>
  );
}
