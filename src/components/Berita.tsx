"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";

const berita = [
  {
    kategori: "Prestasi",
    tanggal: "12 Sep 2026",
    judul: "Siswa TJKT juara 1 lomba jaringan tingkat provinsi",
    desc: "Tim network school mengalahkan 24 sekolah dalam kompetisi konfigurasi jaringan dan keamanan server.",
  },
  {
    kategori: "Kegiatan",
    tanggal: "28 Agu 2026",
    judul: "Penandatanganan MoU magang dengan 3 perusahaan telekomunikasi",
    desc: "Kerja sama pemagangan dan rekrutmen langsung untuk siswa kelas XI dan XII semua jurusan.",
  },
  {
    kategori: "PPDB",
    tanggal: "10 Agu 2026",
    judul: "Beasiswa penuh bagi 20 pendaftar gelombang pertama",
    desc: "Beasiswa SPP satu tahun untuk calon siswa berprestasi akademik dan non-akademik.",
  },
];

export function Berita() {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 170 });
  useTiltHover(ref, { maxTilt: 9, scale: 1.03 });
  return (
    <section id="berita" ref={ref} className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Badge variant="secondary" className="glass-chip border-white/60">
              Berita & Kegiatan
            </Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Kabar terbaru dari sekolah
            </h2>
          </div>
          <span
            data-magnetic
            className="glass-chip inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold text-sky-700"
          >
            Lihat semua <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="tilt-scene mt-10 grid gap-5 md:grid-cols-3">
          {berita.map((b) => (
            <Card
              key={b.judul}
              data-scrub-item
              data-tilt
              className="glass glass-hover glass-glare flex flex-col overflow-hidden"
            >
              <div className="h-2.5 bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge>{b.kategori}</Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {b.tanggal}
                  </span>
                </div>
                <CardTitle className="mt-3 text-lg leading-snug">{b.judul}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm leading-relaxed">{b.desc}</CardDescription>
              </CardContent>
              <CardFooter>
                <span
                  data-magnetic
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100/70 hover:text-sky-900"
                >
                  Baca selengkapnya <ArrowRight className="h-4 w-4" />
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
