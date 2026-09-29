"use client";

import { BedDouble, Gift, Sparkles, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";
import { PPDB_PHASE, PPDB_YEAR } from "@/lib/ppdb";

const FEATURES = [
  {
    icon: Wallet,
    title: "Biaya pendidikan spesial",
    body: "PP Rp. 3.500.000 (dapat diangsur) dan SPP Rp. 250.000 per bulan pada masa early registration.",
  },
  {
    icon: Gift,
    title: "Bea pendidikan Bina Lingkungan",
    body: "Khusus calon siswa dari Kota Salatiga, Kec. Tengaran, Kec. Suruh, dan Kec. Getasan. Informasi di sekretariat SPMB.",
  },
  {
    icon: BedDouble,
    title: "Asrama tersedia",
    body: "Tempat tinggal bagi siswa yang berasal dari luar kota. Kuota terbatas, segera daftar.",
  },
] as const;

export function PpdbHero() {
  const ref = useAnimeReveal<HTMLElement>();

  return (
    <section ref={ref}>
      <div
        data-reveal-item
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 px-6 py-12 text-white shadow-2xl shadow-sky-200 sm:px-12 sm:py-16"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_20%,black,transparent)]" />
          <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-sky-900/25 blur-3xl" />
        </div>

        <div className="relative text-center">
          <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            PPDB {PPDB_YEAR} — {PPDB_PHASE} — Bebas Zonasi
          </Badge>
          <h1 className="mx-auto mt-4 max-w-3xl text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Sistem Penerimaan Murid Baru
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-sky-50 sm:text-base">
            SMK Telekomunikasi Tunas Harapan membuka pendaftaran tahun pelajaran{" "}
            {PPDB_YEAR} untuk empat Kompetensi Keahlian, bebas zonasi.
          </p>

          <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-3 rounded-2xl bg-white/12 p-4 ring-1 ring-white/25 backdrop-blur"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
                  <f.icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-sky-50">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
