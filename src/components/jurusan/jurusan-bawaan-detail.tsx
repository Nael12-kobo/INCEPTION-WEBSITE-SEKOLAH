import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Camera,
  Car,
  CheckCircle2,
  Code2,
  Film,
  Fuel,
  Gamepad2,
  Gauge,
  Globe,
  Laptop,
  Layers,
  Palette,
  PenTool,
  Rocket,
  Router,
  Server,
  Settings,
  Shield,
  Star,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { ExternalImage } from "@/components/external-image";
import MitraIndustri from "@/components/jurusan/mitra-industri";
import PPLGHeroDecorations from "@/components/pplg-hero-decorations";
import PPLGHeroDecorationsMobile from "@/components/pplg-hero-decorations-buatmobile";
import TJKTHeroDecorations from "@/components/tjkt-hero-decorations";
import DKVHeroDecorations from "@/components/dkv-hero-decorations";
import TKROHeroDecorations from "@/components/tkro-hero-decorations";
import TKROHeroDecorationsMobile from "@/components/tkro-hero-decorations-buatmobile";
import { IKON_JURUSAN, getWarnaJurusan, paragrafDariTeks } from "@/lib/jurusan";
import type { JurusanRecord } from "@/lib/jurusan-server";

const AKSEN_MITRA: Record<string, "red" | "gray" | "blue" | "orange"> = {
  PPLG: "red",
  TJKT: "gray",
  DKV: "blue",
  TKRO: "orange",
};

const IKON_KARIR: Record<string, LucideIcon[]> = {
  PPLG: [Laptop, Code2, Gamepad2, Rocket, Star, Briefcase],
  TJKT: [Globe, Server, Shield, Wifi, Router, Briefcase],
  DKV: [PenTool, Layers, Film, Palette, Camera, Briefcase],
  TKRO: [Wrench, Gauge, Car, Briefcase, Settings, Fuel],
};

function DekorasiHero({ kode }: { kode: string }) {
  switch (kode) {
    case "PPLG":
      return (
        <>
          <PPLGHeroDecorations />
          <PPLGHeroDecorationsMobile />
        </>
      );
    case "TJKT":
      return <TJKTHeroDecorations />;
    case "DKV":
      return <DKVHeroDecorations />;
    case "TKRO":
      return (
        <>
          <TKROHeroDecorations />
          <TKROHeroDecorationsMobile />
        </>
      );
    default:
      return null;
  }
}

export function JurusanBawaanDetail({ jurusan }: { jurusan: JurusanRecord }) {
  const warna = getWarnaJurusan(jurusan.warna);
  const Icon = IKON_JURUSAN[jurusan.ikon] ?? Briefcase;
  const paragraf = paragrafDariTeks(jurusan.tentang);
  const ikonKarir = IKON_KARIR[jurusan.kode] ?? [];

  return (
    <div className="flex min-h-screen w-full flex-col dark:bg-gray-950">
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${warna.hero} text-white`}
      >
        <DekorasiHero kode={jurusan.kode} />
        <div className="relative mx-auto max-w-6xl px-6 py-5 sm:py-7 md:py-10">
          <Link
            href="/#jurusan"
            className="mb-8 inline-flex min-h-11 items-center gap-2 py-2.5 text-white/75 transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Program Keahlian
          </Link>

          <div className="flex flex-col items-center gap-10 md:flex-row">
            <div className="flex-1 text-center md:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
                <Icon className="size-4" aria-hidden />
                Program Keahlian
              </div>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                {jurusan.singkatan}
              </h1>
              {jurusan.tagline ? (
                <p className="mb-4 text-xl font-medium text-white/90 md:text-2xl">
                  {jurusan.tagline}
                </p>
              ) : null}
              <p className="max-w-lg text-lg text-white/80">
                {jurusan.heroTeks || jurusan.deskripsi}
              </p>
            </div>
            <div className="flex-shrink-0 select-none">
              {jurusan.gambar ? (
                <ExternalImage
                  src={jurusan.gambar}
                  alt={`${jurusan.singkatan} — ${jurusan.nama}`}
                  className="h-56 w-56 object-contain md:h-80 md:w-80 lg:h-96 lg:w-96"
                />
              ) : (
                <span className="flex h-56 w-56 items-center justify-center rounded-3xl bg-white/10 md:h-80 md:w-80 lg:h-96 lg:w-96">
                  <Icon className="h-24 w-24 md:h-32 md:w-32" aria-hidden />
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 dark:bg-gray-900 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                Tentang {jurusan.singkatan}
              </h2>
              <div className="space-y-4 leading-relaxed text-gray-600 dark:text-gray-400">
                {paragraf.length > 0 ? (
                  paragraf.map((item, index) => <p key={index}>{item}</p>)
                ) : (
                  <p>{jurusan.deskripsi}</p>
                )}
              </div>
            </div>

            {jurusan.keunggulan.length > 0 ? (
              <div>
                <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                  <Icon className={`size-5 ${warna.aksen}`} aria-hidden />
                  Keunggulan Jurusan
                </h3>
                <div className="rounded-2xl border bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                  <ul className="space-y-3">
                    {jurusan.keunggulan.map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {jurusan.kompetensi.length > 0 ? (
        <section className="bg-gray-50 py-16 dark:bg-gray-950 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Kompetensi yang Dipelajari
              </h2>
              <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                {jurusan.introKompetensi ||
                  `Kurikulum ${jurusan.singkatan} mencakup materi berikut`}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jurusan.kompetensi.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${warna.bg} ${warna.teks}`}
                  >
                    <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    {item.judul}
                  </h3>
                  {item.deskripsi ? (
                    <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                      {item.deskripsi}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {jurusan.karir.length > 0 ? (
        <section className="bg-card py-16 dark:bg-gray-900 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Prospek Karir
              </h2>
              <p className="mx-auto max-w-2xl text-gray-500 dark:text-gray-400">
                {jurusan.introKarir ||
                  `Lulusan ${jurusan.singkatan} memiliki peluang karir yang luas di industri`}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jurusan.karir.map((item, index) => {
                const CareerIcon = ikonKarir[index] ?? Briefcase;
                return (
                  <div
                    key={index}
                    className={`rounded-2xl border bg-gradient-to-br from-gray-50 to-card p-6 transition-colors dark:border-gray-700 dark:from-gray-800 dark:to-gray-800/50 ${warna.border}`}
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${warna.bg} ${warna.teks}`}
                    >
                      <CareerIcon className="size-5" aria-hidden />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      {item.pekerjaan}
                    </h3>
                    {item.gaji ? (
                      <p className={`text-sm font-medium ${warna.aksen}`}>
                        {item.gaji}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-gray-50 py-16 dark:bg-gray-950 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div
            className={`rounded-3xl bg-gradient-to-br ${warna.hero} p-8 text-center text-white md:p-12`}
          >
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              {jurusan.ctaJudul || `Tertarik dengan Jurusan ${jurusan.singkatan}?`}
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/85">
              {jurusan.ctaTeks || jurusan.deskripsi}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-slate-900 shadow-lg transition-colors hover:bg-slate-100"
              >
                Tanya AI Asisten
                <Rocket className="size-5" aria-hidden />
              </Link>
              <Link
                href="/#jurusan"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Lihat Jurusan Lain
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MitraIndustri accent={AKSEN_MITRA[jurusan.kode] ?? "blue"} />
    </div>
  );
}
