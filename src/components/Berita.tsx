"use client";

import { ArrowRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";

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
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="berita" ref={ref} className="bg-sky-50/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-reveal-item className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <Badge variant="secondary">Berita & Kegiatan</Badge>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Kabar terbaru dari sekolah
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
            Lihat semua <ArrowRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {berita.map((b) => (
            <Card
              key={b.judul}
              data-reveal-item
              className="flex flex-col bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100"
            >
              <div className="h-2.5 rounded-t-3xl bg-gradient-to-r from-sky-400 via-sky-500 to-cyan-400" />
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
                <span className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-900">
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
