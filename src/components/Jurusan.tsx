"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { getIkonJurusan, JURUSAN_BAWAAN, type JurusanItem } from "@/lib/jurusan";

export function Jurusan({ items = JURUSAN_BAWAAN }: { items?: JurusanItem[] }) {
  const ref = useAnimeFlowReveal<HTMLElement>({
    direction: "right",
    distance: 170,
  });
  useTiltHover(ref, { maxTilt: 9, scale: 1.03 });

  return (
    <section
      id="jurusan"
      ref={ref}
      className="relative overflow-hidden bg-black/5 dark:bg-black/25"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="glass-chip border-white/60">
            Program Keahlian
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {items.length} Program Keahlian Unggulan
          </h2>
          <p className="mt-3 text-slate-600">
            Kurikulum berbasis industri dengan sertifikasi kompetensi dan kelas
            praktik intensif.
          </p>
        </div>

        <div className="tilt-scene mt-10 grid gap-5 md:grid-cols-2">
          {items.map((j) => {
            const Icon = getIkonJurusan(j.ikon);
            return (
              <Card
                key={j.kode}
                data-scrub-item
                data-tilt
                className="glass glass-hover glass-glare group flex flex-col"
              >
                <CardHeader>
                  <span
                    data-magnetic
               z