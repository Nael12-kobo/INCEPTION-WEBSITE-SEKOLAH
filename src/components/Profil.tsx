"use client";

import { CheckCircle2, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";

const visiMisi = [
  "Unggul dalam teknologi telekomunikasi dan informatika",
  "Berkarakter, disiplin, dan berakhlak mulia",
  "Siap kerja, siap kuliah, siap berwirausaha",
];

export function Profil() {
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="profil" ref={ref} className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div data-reveal-item>
          <Badge variant="secondary">Profil Sekolah</Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Mencetak talenta digital yang{" "}
            <span className="text-sky-600">kompeten & berkarakter</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            SMK Telekomunikasi Tunas Harapan adalah sekolah menengah kejuruan yang fokus pada
            bidang telekomunikasi, jaringan komputer, dan pengembangan perangkat lunak.
            Pembelajaran memadukan teori, praktik laboratorium, sertifikasi industri, dan magang
            di perusahaan mitra.
          </p>
          <ul className="mt-6 space-y-3">
            {visiMisi.map((v) => (
              <li key={v} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                {v}
              </li>
            ))}
          </ul>
        </div>

        <Card data-reveal-item className="relative overflow-hidden border-sky-100 bg-gradient-to-br from-sky-50 to-white">
          <CardContent className="p-7">
            <Quote className="h-8 w-8 text-sky-300" />
            <blockquote className="mt-3 text-lg font-medium leading-relaxed text-slate-800">
              “Kami tidak hanya mengajarkan teknologi, tetapi membentuk sikap profesional —
              disiplin, jujur, dan pantang menyerah menghadapi tantangan industri.”
            </blockquote>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-lg font-bold text-white">
                H
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">H. Tunas Harapan, M.Pd.</p>
                <p className="text-xs text-slate-500">Kepala SMK Telekomunikasi Tunas Harapan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
