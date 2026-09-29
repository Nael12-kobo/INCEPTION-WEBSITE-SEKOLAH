"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarDays, Code2, Megaphone, Network, RadioTower } from "lucide-react";
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

const jurusan = [
  {
    icon: Network,
    nama: "Teknik Jaringan Komputer",
    singkatan: "TJKT",
    desc: "Instalasi jaringan LAN/WAN, administrasi server, keamanan siber, dan cloud computing.",
    skills: ["Cisco & Mikrotik", "Linux Server", "Cyber Security"],
  },
  {
    icon: RadioTower,
    nama: "Teknik Telekomunikasi",
    singkatan: "TT",
    desc: "Fiber optik, teknologi 5G, sistem komunikasi radio, dan instalasi perangkat telekomunikasi.",
    skills: ["Fiber Optik", "Teknologi 5G", "Radio Komunikasi"],
  },
  {
    icon: Code2,
    nama: "Rekayasa Perangkat Lunak",
    singkatan: "RPL",
    desc: "Pengembangan web, aplikasi mobile, basis data, dan integrasi layanan digital modern.",
    skills: ["Web & Mobile", "Database", "UI/UX"],
  },
];

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

export function ProgramsSection() {
  const ref = useAnimeReveal<HTMLElement>();

  return (
    <section id="jurusan" ref={ref} className="mt-10 scroll-mt-24">
      <div data-reveal-item>
        <Badge variant="secondary">Program Keahlian</Badge>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          Jurusan di sekolah kami
        </h2>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {jurusan.map((j) => (
          <Card
            key={j.singkatan}
            data-reveal-item
            className="group flex flex-col bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100"
          >
            <CardHeader>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-200">
                <j.icon className="h-5 w-5" aria-hidden />
              </span>
              <Badge variant="secondary" className="mt-3 w-fit">
                {j.singkatan}
              </Badge>
              <CardTitle className="mt-1.5 text-lg">{j.nama}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-sm leading-relaxed">{j.desc}</CardDescription>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {j.skills.map((s) => (
                  <Badge key={s} variant="outline" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Berita */}
      <div id="berita" data-reveal-item className="mt-12 scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge variant="secondary">Berita & Kegiatan</Badge>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
              Kabar terbaru sekolah
            </h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-sky-700">
            <Link href="/#berita">
              Lihat di beranda
              <ArrowUpRight aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
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
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                    {b.tanggal}
                  </span>
                </div>
                <CardTitle className="mt-3 text-base leading-snug">{b.judul}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm leading-relaxed">{b.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* PPDB CTA */}
      <div id="ppdb" data-reveal-item className="mt-12 scroll-mt-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 p-7 text-white shadow-lg shadow-sky-200 sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_20%_20%,black,transparent)]"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-lg">
              <Badge className="border-white/25 bg-white/15 text-white backdrop-blur">
                <Megaphone className="h-3.5 w-3.5" aria-hidden />
                PPDB 2026/2027
              </Badge>
              <h2 className="mt-4 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
                Kenalkan sekolah ini ke adik, sepupu, atau tetangga Anda
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-sky-50/90">
                Pendaftaran siswa baru telah dibuka. Bagikan tautan PPDB kepada calon siswa —
                gelombang pertama mendapat prioritas beasiswa.
              </p>
            </div>
            <Button size="lg" asChild className="bg-white text-sky-700 shadow-sm hover:bg-sky-50">
              <Link href="/ppdb">Buka formulir PPDB</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
