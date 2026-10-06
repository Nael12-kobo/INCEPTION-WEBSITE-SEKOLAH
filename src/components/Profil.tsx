"use client";

import Image from "next/image";
import { CheckCircle2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";

const visiMisi = [
  "Unggul dalam teknologi telekomunikasi dan informatika",
  "Berkarakter, disiplin, dan berakhlak mulia",
  "Siap kerja, siap kuliah, siap berwirausaha",
];

export function Profil() {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "alternate", distance: 170 });
  useTiltHover(ref, { maxTilt: 7, scale: 1.02 });
  return (
    <section id="profil" ref={ref} className="relative overflow-hidden bg-transparent">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-violet-300/50 blur-3xl"
      />
      <div className="tilt-scene relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div data-scrub-item data-scrub-dir="left">
          <Badge variant="secondary" className="glass-chip border-white/60">
            Profil Sekolah
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Mencetak talenta digital yang{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 bg-clip-text text-transparent">
              kompeten & berkarakter
            </span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            SMK Telekomunikasi Tunas Harapan adalah sekolah menengah kejuruan yang fokus pada
            bidang telekomunikasi, jaringan komputer, dan pengembangan perangkat lunak.
            Pembelajaran memadukan teori, praktik laboratorium, sertifikasi industri, dan magang
            di perusahaan mitra.
          </p>
          <ul className="mt-6 space-y-3">
            {visiMisi.map((v) => (
              <li
                key={v}
                data-magnetic
                className="glass glass-hover flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <Card
          data-scrub-item
          data-scrub-dir="right"
          data-tilt
          className="glass glass-hover glass-glare relative overflow-hidden"
        >
          <CardContent className="p-7">
            <span
              data-magnetic
              className="glass-chip flex h-12 w-12 items-center justify-center rounded-2xl"
            >
              <Quote className="h-6 w-6 text-sky-500" />
            </span>
            <blockquote className="mt-3 text-lg font-medium leading-relaxed text-slate-800">
              “ Di SMK Telekomunikasi Tunas Harapan saya dibimbing menjadi yang terbaik di bidang Komputer Jaringan,
              dengan Guru yang berintegrasi tinggi dan sudah bersertifikasi Cisco saya dapat dengan mudah memahami apa yang di sampaikan,
              serta fasilitasnya pun mendukung selama pembelajaran. Oleh karena itu membuat saya siap dan percaya diri untuk bersaing dengan Lulusan SMK lain.
              Saat saya lulus saya langsung diterima di Perusahaan Hosting Terbesar di Jakarta.
              Dan saat ini saya bekerja sebagai IT Senior Network & Infrastruktur di Transcosmos Indonesia site Semarang ”
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <Image src="/agil.jpg" alt="Foto Visentius Agiola Stanlay" width={12} height={12} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-bold text-slate-900">Visentius Agiola Stanlay</p>
                <p className="text-xs text-slate-500">IT Senior Network & Infrastruktur</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
