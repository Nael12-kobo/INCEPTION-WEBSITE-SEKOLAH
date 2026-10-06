"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, Network, RadioTower,Camera, Engine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";

const jurusan = [
  {
    icon: Code2,
    nama: "Pengembangan Perangkat Lunak Dan Gim",
    singkatan: "PPLG",
    desc: "Pengembangan web, aplikasi mobile, basis data, dan integrasi layanan digital modern.",
    skills: ["Web & Mobile", "Database", "UI/UX"],
    link: "/jurusan/PPLG",
  },
  {
    icon: Network,
    nama: "Teknik Jaringan Komputer Dan Telekomunikasi",
    singkatan: "TJKT",
    desc: "Instalasi jaringan LAN/WAN, administrasi server, keamanan siber, dan cloud computing.",
    skills: ["Cisco & Mikrotik", "Linux Server", "Cyber Security"],
    link: "/jurusan/TJKT",
  },
  {
    icon: Camera,
    nama: "Desain Komunikasi Visual",
    singkatan: "DKV",
    desc: "Teori warna, tipografi, penggunaan perangkat lunak desain, ilustrasi digital, fotografi, dan videografi.",
    skills: ["Fotografi", "Videografi", "Broadcasting", "Illustrasi Digital"],
    link: "/jurusan/DKV",
  },
    {
    icon: Engine,
    nama: "Teknik Kendaraan Ringan Otomotif",
    singkatan: "TKRO",
    desc: "Perawatan dan perbaikan kendaraan bermotor, sistem elektrik, dan mekanik.",
    skills: ["Perawatan", "Perbaikan", "Sistem Elektrik"],
    link: "/jurusan/TKRO",
  },

];

export function Jurusan() {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 170 });
  useTiltHover(ref, { maxTilt: 9, scale: 1.03 });
  return (
    <section id="jurusan" ref={ref} className="relative overflow-hidden bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="glass-chip border-white/60">
            Program Keahlian
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Tiga jurusan unggulan telekomunikasi
          </h2>
          <p className="mt-3 text-slate-600">
            Kurikulum berbasis industri dengan sertifikasi kompetensi dan kelas praktik intensif.
          </p>
        </div>

        <div className="tilt-scene mt-10 grid gap-5 md:grid-cols-3">
          {jurusan.map((j) => (
            <Card
              key={j.singkatan}
              data-scrub-item
              data-tilt
              className="glass glass-hover glass-glare group flex flex-col"
            >
              <CardHeader>
                <span
                  data-magnetic
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg shadow-sky-300/50"
                >
                  <j.icon className="h-6 w-6" />
                </span>
                <Badge variant="secondary" className="glass-chip mt-4 w-fit">
                  {j.singkatan}
                </Badge>
                <CardTitle className="mt-2 text-xl">{j.nama}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm leading-relaxed">{j.desc}</CardDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  {j.skills.map((s) => (
                    <Badge key={s} variant="outline" className="glass-chip font-normal">
                      {s}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link
                  data-magnetic
                  href={j.link}
                  className="inline-flex items-center gap-1 rounded-full px-3 py-3 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100/70 hover:text-sky-900 sm:py-1.5"
                >
                  Pelajari lebih lanjut
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
