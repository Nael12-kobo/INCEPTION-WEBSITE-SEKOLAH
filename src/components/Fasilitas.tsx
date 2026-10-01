"use client";

import { useState } from "react";
import { BookOpen, FlaskConical, Trophy, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "lab", label: "Lab & Praktik", icon: FlaskConical },
  { id: "digital", label: "Fasilitas Digital", icon: Wifi },
  { id: "ekskul", label: "Ekstrakurikuler", icon: Trophy },
  { id: "akademik", label: "Penunjang Akademik", icon: BookOpen },
] as const;

type TabId = (typeof tabs)[number]["id"];

const data: Record<TabId, { title: string; desc: string; items: string[] }> = {
  lab: {
    title: "Laboratorium praktik industri",
    desc: "Belajar langsung dengan perangkat standar industri telekomunikasi.",
    items: [
      "Lab fiber optik & splicing",
      "Lab jaringan Cisco/Mikrotik",
      "Lab komputer & server",
      "Bengkel instalasi telekomunikasi",
      "Ruang praktik 5G & radio",
      "Lab elektronika dasar",
    ],
  },
  digital: {
    title: "Kampus terkoneksi penuh",
    desc: "Internet cepat dan sistem informasi akademik yang modern.",
    items: [
      "WiFi kampus 1 Gbps",
      "E-learning & kelas digital",
      "Perpustakaan digital",
      "Sistem informasi akademik online",
      "Ruang multimedia",
      "Area co-working siswa",
    ],
  },
  ekskul: {
    title: "Kembangkan bakat non-akademik",
    desc: "Wadah minat, bakat, dan kepemimpinan siswa.",
    items: [
      "Robotik & IoT club",
      "E-sport & game development",
      "Pramuka & Paskibra",
      "Futsal & basket",
      "Rohis & paduan suara",
      "Jurnalistik & fotografi",
    ],
  },
  akademik: {
    title: "Pendukung prestasi",
    desc: "Fasilitas yang menunjang kenyamanan belajar.",
    items: [
      "Perpustakaan & ruang baca",
      "Ruang bimbingan konseling",
      "Unit kesehatan sekolah",
      "Musholla & aula",
      "Kantin sehat",
      "Bursa kerja khusus (BKK)",
    ],
  },
};

export function Fasilitas() {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "left", distance: 170 });
  useTiltHover(ref, { maxTilt: 6, scale: 1.02 });
  const [active, setActive] = useState<TabId>("lab");
  const content = data[active];

  return (
    <section id="fasilitas" ref={ref} className="bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="glass-chip border-white/60">
            Fasilitas & Ekskul
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Sarana lengkap untuk belajar maksimal
          </h2>
        </div>

        <div data-scrub-item className="mt-8 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <span key={t.id} data-magnetic className="inline-flex">
              <Button
                variant={active === t.id ? "default" : "outline"}
                onClick={() => setActive(t.id)}
                className={cn(
                  "rounded-full",
                  active !== t.id && "glass-chip border-white/60 hover:border-sky-300",
                  active === t.id && "shadow-lg shadow-sky-300/50",
                )}
              >
                <t.icon />
                {t.label}
              </Button>
            </span>
          ))}
        </div>

        <Card
          data-scrub-item
          data-tilt
          className="glass glass-glare mt-8 overflow-hidden"
        >
          <CardContent className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{content.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{content.desc}</p>
              <Badge variant="secondary" className="glass-chip mt-4">
                {content.items.length} fasilitas
              </Badge>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {content.items.map((item) => (
                <li
                  key={item}
                  data-magnetic
                  className="glass-chip glass-hover rounded-2xl px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
