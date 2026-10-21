"use client";

import { useState } from "react";
import { BookOpen, FlaskConical, Trophy, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { useTiltHover } from "@/hooks/useTiltHover";
import { cn } from "@/lib/utils";
import { ImageModal } from "@/components/ImageModal";
import {
  FasilitasVideoCard,
  type FasilitasVideo,
} from "@/components/FasilitasVideoCard";

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

/**
 * Dokumentasi video fasilitas (WebM, di-scrub mengikuti posisi X cursor).
 * - `src`: klip WebM di `/public/animated/facility/`.
 * - `poster`: JPG lama di `/public/images/fasilitas/` sebagai poster + fallback.
 * - `xmin` / `xmid` / `xmax`: patokan detik timeline untuk cursor
 *   di tepi kiri / tengah (netral) / tepi kanan card.
 *   Nilai di-clamp otomatis ke durasi aktual saat metadata siap.
 */
const galeri: FasilitasVideo[] = [
  {
    src: "/animated/facility/perpustakaan.webm",
    poster: "/images/fasilitas/perpustakaan.jpg",
    label: "Perpustakaan",
    alt: "Perpustakaan SMK Telekomunikasi Tunas Harapan",
    description:
      "Perpustakaan lengkap dengan koleksi buku, jurnal, dan fasilitas baca yang nyaman untuk mendukung kegiatan belajar siswa.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tefa.webm",
    poster: "/images/fasilitas/tefa.jpg",
    label: "Teaching Factory",
    alt: "Teaching Factory (TEFA)",
    description:
      "Teaching Factory sebagai tempat praktik kerja nyata yang mensimulasikan lingkungan industri telekomunikasi.",
    xmin: 2.9,
    xmid: 1.5,
    xmax: 0,
  },
  {
    src: "/animated/facility/gedung-tkj.webm",
    poster: "/images/fasilitas/gedung-tkj.jpg",
    label: "Gedung TKJ",
    alt: "Gedung Teknik Komputer dan Jaringan",
    description:
      "Gedung khusus untuk program keahlian Teknik Komputer dan Jaringan dengan peralatan modern.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkj-lab.webm",
    poster: "/images/fasilitas/tkj-lab.jpg",
    label: "Lab TKJ",
    alt: "Laboratorium Teknik Komputer dan Jaringan",
    description:
      "Laboratorium TKJ dilengkapi dengan perangkat jaringan Cisco, Mikrotik, dan server untuk praktik konfigurasi jaringan.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkro-1.webm",
    poster: "/images/fasilitas/tkro-1.jpg",
    label: "Bengkel TKRO 1",
    alt: "Bengkel Teknik Kendaraan Ringan Otomotif",
    description:
      "Bengkel TKRO dengan peralatan standar industri untuk praktik perbaikan kendaraan ringan.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/tkro-2.webm",
    poster: "/images/fasilitas/tkro-2.jpg",
    label: "Bengkel TKRO 2",
    alt: "Bengkel Teknik Kendaraan Ringan Otomotif",
    description:
      "Bengkel TKRO 2 sebagai pelengkap fasilitas praktik untuk menampung lebih banyak siswa.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/uks.webm",
    poster: "/images/fasilitas/uks.jpg",
    label: "UKS",
    alt: "Unit Kesehatan Sekolah",
    description:
      "Unit Kesehatan Sekolah yang siap melayani siswa untuk pertolongan pertama dan pemeriksaan kesehatan dasar.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/humas.webm",
    poster: "/images/fasilitas/humas.jpg",
    label: "Humas",
    alt: "Unit Humas Sekolah",
    description:
      "Unit Humas Sekolah yang bertugas dalam komunikasi dan promosi kegiatan sekolah.",
    xmin: 1.4,
    xmid: 0.9,
    xmax: 0,
  },
  {
    src: "/animated/facility/dak.webm",
    poster: "/images/fasilitas/dak.jpg",
    label: "DAK",
    alt: "Ruang DAK sekolah",
    description:
      "Ruang DAK yang difungsikan sebagai ruang belajar pada jurusan DKV atau Multi Media di lengkapi dengan fasilitas multimedia yang lengkap.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-2.webm",
    poster: "/images/fasilitas/dak-2.jpg",
    label: "DAK 2",
    alt: "Ruang DAK sekolah",
    description:
      "Ruang DAK 2 sebagai ruang belajar tambahan dengan desain modern untuk mendukung pembelajaran berbasis teknologi.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-3.webm",
    poster: "/images/fasilitas/dak-3.jpg",
    label: "DAK 3",
    alt: "Ruang DAK sekolah",
    description:
      "Ruang DAK 3  sebagai ruang belajar tambahan yang dilengkapi dengan AC dan proyektor.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/dak-studio.webm",
    poster: "/images/fasilitas/dak-studio.jpg",
    label: "DAK Studio",
    alt: "Studio DAK sekolah",
    description:
      "Studio DAK yang difungsikan sebagai ruang produksi multimedia dan studio rekaman untuk kegiatan sekolah.",
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
];

export function Fasilitas() {
  const ref = useAnimeFlowReveal<HTMLElement>({
    direction: "left",
    distance: 170,
  });
  useTiltHover(ref, { maxTilt: 6, scale: 1.02 });
  const [active, setActive] = useState<TabId>("lab");
  const content = data[active];
  const [selectedImage, setSelectedImage] = useState<(typeof galeri)[0] | null>(
    null,
  );
  // Mobile (< lg): modal cukup JPG — webm tidak di-fetch sama sekali.
  const isDesktop = useIsDesktop();

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

        <div
          data-scrub-item
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {tabs.map((t) => (
            <span key={t.id} data-magnetic className="inline-flex">
              <Button
                variant={active === t.id ? "default" : "outline"}
                onClick={() => setActive(t.id)}
                className={cn(
                  // Ukuran dasar dikecilkan supaya 2 pill per baris di 360px
                  // (diukur pakai font Geist 600: text-[13px] masih 3 baris)
                  "rounded-full px-3 text-[12px] sm:px-5 sm:text-sm",
                  active !== t.id && "glass-chip border-white/60 glass-hover",
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
              <h3 className="text-xl font-bold text-slate-900">
                {content.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {content.desc}
              </p>
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

        {/* Galeri video fasilitas — WebM di-scrub mengikuti posisi X cursor */}
        {/* tilt-scene: perspective untuk tilt 3D kartu (data-tilt),
            glare + tilt-nya dijalankan useTiltHover section ini. */}
        <div
          data-scrub-item
          className="tilt-scene mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {galeri.map((g) => (
            <FasilitasVideoCard
              key={g.src}
              item={g}
              onOpen={() => setSelectedImage(g)}
            />
          ))}
        </div>
      </div>

      <ImageModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        src={selectedImage?.poster || ""}
        alt={selectedImage?.alt || ""}
        title={selectedImage?.label}
        description={selectedImage?.description}
        // videoSrc={isDesktop ? selectedImage?.src : undefined}
        // poster={selectedImage?.poster}
      />
    </section>
  );
}
