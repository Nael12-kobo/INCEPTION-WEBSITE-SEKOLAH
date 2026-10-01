"use client";

import { Award, Building2, GraduationCap, Users } from "lucide-react";
import { useAnimeCounter } from "@/hooks/useAnimeReveal";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";

const stats = [
  { icon: Users, value: 850, suffix: "+", label: "Siswa Aktif" },
  { icon: GraduationCap, value: 64, suffix: "", label: "Guru & Tendik" },
  { icon: Building2, value: 12, suffix: "+", label: "Mitra Industri" },
  { icon: Award, value: 120, suffix: "+", label: "Prestasi & Penghargaan" },
];

export function Stats() {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 160 });
  useTiltHover(ref, { maxTilt: 10, scale: 1.04 });
  return (
    <section id="statistik" ref={ref} className="relative bg-transparent">
      <div className="tilt-scene mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              data-scrub-item
              data-scrub-dir="left"
              className="glass glass-hover glass-glare rounded-3xl p-6 text-center"
            >
              <span
                data-magnetic
                className="glass-chip mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
              >
                <s.icon className="h-6 w-6 text-sky-600" />
              </span>
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
