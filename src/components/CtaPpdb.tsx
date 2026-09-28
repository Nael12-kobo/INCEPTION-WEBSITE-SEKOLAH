"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, FileCheck2, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimeReveal } from "@/hooks/useAnimeReveal";

const steps = [
  { icon: ClipboardList, title: "Isi formulir", desc: "Online atau langsung ke sekretariat PPDB." },
  { icon: FileCheck2, title: "Verifikasi berkas", desc: "Rapor, KK, akta, dan pas foto." },
  { icon: PhoneCall, title: "Wawancara & daftar ulang", desc: "Tes minat bakat + konfirmasi." },
];

export function CtaPpdb() {
  const ref = useAnimeReveal<HTMLElement>();
  return (
    <section id="ppdb" ref={ref} className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div
          data-reveal-item
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-600 via-sky-500 to-cyan-500 px-6 py-14 text-center shadow-2xl shadow-sky-200 sm:px-12"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-grid-sky opacity-40 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,black,transparent)]" />
            <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
            <div className="absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-sky-900/20 blur-2xl" />
          </div>
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-widest text-sky-100">
              PPDB 2026/2027 — Gelombang 1
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Amankan kursimu di SMK Telekomunikasi Tunas Harapan
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sky-50">
              Kuota terbatas 3 kelas per jurusan. Pendaftar gelombang pertama berkesempatan
              mendapat beasiswa dan gratis biaya pendaftaran.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" variant="secondary" asChild className="bg-white text-sky-800 hover:bg-sky-50">
                <Link href="#beranda">
                  Daftar Sekarang
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link href="#profil">Hubungi Panitia</Link>
              </Button>
            </div>
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="rounded-2xl bg-white/12 p-4 backdrop-blur ring-1 ring-white/25">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">
                    {i + 1}. {s.title}
                  </p>
                  <p className="mt-1 text-xs text-sky-50">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
