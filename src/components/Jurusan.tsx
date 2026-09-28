"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, Network, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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

export function Jurusan() {
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="jurusan" ref={ref} className="relative bg-sky-50/60">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-reveal-item className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Program Keahlian</Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tiga jurusan unggulan telekomunikasi
          </h2>
          <p className="mt-3 text-slate-600">
            Kurikulum berbasis industri dengan sertifikasi kompetensi dan kelas praktik intensif.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {jurusan.map((j) => (
            <Card
              key={j.singkatan}
              data-reveal-item
              className="group flex flex-col bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-100"
            >
              <CardHeader>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-sm shadow-sky-200">
                  <j.icon className="h-6 w-6" />
                </span>
                <Badge variant="secondary" className="mt-4 w-fit">
                  {j.singkatan}
                </Badge>
                <CardTitle className="mt-2 text-xl">{j.nama}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm leading-relaxed">{j.desc}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  {j.skills.map((s) => (
                    <Badge key={s} variant="outline" className="font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  href="#ppdb"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 transition-colors hover:text-sky-900"
                >
                  Pelajari & daftar
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
