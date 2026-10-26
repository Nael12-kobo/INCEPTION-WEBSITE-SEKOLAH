"use client";

import { Users } from "lucide-react";
import { useAnimeCounter } from "@/hooks/useAnimeReveal";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import {
  IKON_STATISTIK,
  SITE_CONTENT_DEFAULTS,
  type StatistikKonten,
} from "@/lib/site-content";

/**
 * Kartu statistik beranda — angka & label dari Admin Panel > Konten Situs
 * (`site_contents.statistik`).
 */
export function Stats({
  konten = SITE_CONTENT_DEFAULTS.statistik,
}: {
  konten?: StatistikKonten;
}) {
  const ref = useAnimeFlowReveal<HTMLElement>({ direction: "right", distance: 160 });
  useTiltHover(ref, { maxTilt: 10, scale: 1.04 });
  const stats = konten.items.map((s) => ({
    ...s,
    // Lookup langsung dari record statis — komponen ikon tidak boleh
    // "dibuat" saat render (lint react-hooks/static-components).
    icon: IKON_STATISTIK[s.ikon] ?? Users,
  }));
  return (
    <section id="statistik" ref={ref} className="relative bg-blue-300/25 dark:bg-black/40">
      <div className="tilt-scene mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              data-scrub-item
              data-scrub-dir="left"
              className="glass glass-hover glass-glare rounded-3xl p-4 text-center sm:p-6"
            >
              <span
                data-magnetic
                className="glass-chip mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
              >
                <s.icon className="h-6 w-6 text-sky-600" />
              </span>
              <dd className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                <StatValue value={s.nilai} suffix={s.suffix} />
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
