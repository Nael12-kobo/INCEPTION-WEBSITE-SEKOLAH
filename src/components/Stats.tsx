"use client";

import { Award, Building2, GraduationCap, Users } from "lucide-react";
import { useAnimeCounter, useAnimeReveal } from "@/hooks/useAnimeReveal";

const stats = [
  { icon: Users, value: 850, suffix: "+", label: "Siswa Aktif" },
  { icon: GraduationCap, value: 64, suffix: "", label: "Guru & Tendik" },
  { icon: Building2, value: 12, suffix: "+", label: "Mitra Industri" },
  { icon: Award, value: 120, suffix: "+", label: "Prestasi & Penghargaan" },
];

export function Stats() {
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="statistik" ref={ref} className="relative bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              data-reveal-item
              className="rounded-3xl border border-sky-100 bg-sky-50/60 p-6 text-center transition-shadow hover:shadow-lg hover:shadow-sky-100"
            >
              <s.icon className="mx-auto h-6 w-6 text-sky-600" />
              <dd className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                <StatValue value={s.value} suffix={s.suffix} />
              </dd>
              <dt className="mt-1 text-sm font-medium text-slate-500">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function StatValue({ value, suffix }: { value: number; suffix: string }) {
  const ref = useAnimeCounter(value, { suffix });
  return <span ref={ref}>0{suffix}</span>;
}
