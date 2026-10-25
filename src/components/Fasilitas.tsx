"use client";

import { useState } from "react";
import { BookOpen, FlaskConical, Trophy, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { cn } from "@/lib/utils";
import { ImageModal } from "@/components/ImageModal";
import {
  FasilitasVideoCard,
  type FasilitasCardItem,
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
 * Dokumentasi kartu fasilitas.
 * - `src`: klip WebM opsional di `/public/animated/facility/`.
 * - `poster`: JPG lama di `/public/images/fasilitas/` sebagai poster + fallback.
 * - `slides`: kumpulan foto yang dibuka sebagai galeri geser di modal.
 * - `xmin` / `xmid` / `xmax`: patokan detik timeline untuk cursor
 *   di tepi kiri / tengah (netral) / tepi kanan card.
 *   Nilai di-clamp otomatis ke durasi aktual saat metadata siap.
 */
const galeri: FasilitasCardItem[] = [
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
    src: "/animated/facility/tefa2.webm",
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
    poster: "/images/fasilitas/gedung-tkj.jpg",
    label: "TKJ",
    alt: "Fasilitas Teknik Komputer dan Jaringan",
    description:
      "Gedung dan laboratorium TKJ dengan perangkat jaringan untuk mendukung kegiatan praktik siswa.",
    slides: [
      {
        src: "/images/fasilitas/gedung-tkj.jpg",
        alt: "Gedung Teknik Komputer dan Jaringan",
      },
      {
        src: "/images/fasilitas/tkj-lab.jpg",
        alt: "Laboratorium Teknik Komputer dan Jaringan",
      },
    ],
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    poster: "/images/fasilitas/tkro-1.jpg",
    label: "TKRO",
    alt: "Fasilitas Teknik Kendaraan Ringan Otomotif",
    description:
      "Bengkel TKRO dengan fasilitas praktik untuk mendukung pembelajaran perbaikan kendaraan ringan.",
    slides: [
      {
        src: "/images/fasilitas/tkro-1.jpg",
        alt: "Bengkel TKRO 1",
      },
      {
        src: "/images/fasilitas/tkro-2.jpg",
        alt: "Bengkel TKRO 2",
      },
      {
        src: "/images/fasilitas/tkro-4.jpg",
        alt: "Fasilitas bengkel TKRO 4",
      },
    ],
    xmin: 0,
    xmid: 1.5,
    xmax: 2.9,
  },
  {
    src: "/animated/facility/perpustakaan.webm",
    poster: "/images/fasilitas/perpustakaan.jpg",
    label: "Perpustakaan",
    alt: "Perpustakaan SMK Telekomunikasi Tunas Harapan",
    description:
      "Perpustakaan yang menyediakan berbagai jurnal,  dan fasilitas baca yang nyaman untuk mendukung kegiatan belajar siswa.",
    // "Perpustakaan sekolah, merupakan pusat sumber belajar yang menyediakan koleksi buku, jurnal, dan berbagai bahan bacaan untuk menunjang kebutuhan akademik serta memperluas wawasan siswa. Dengan fasilitas membaca yang nyaman, tenang, dan tertata, perpustakaan ini mendukung siswa dalam belajar mandiri, mengerjakan tugas, melakukan riset, dan membangun kebiasaan membaca Koleksinya mencakup beragam bahan bacaan yang dapat dimanfaatkan untuk menunjang pembelajaran maupun memenuhi minat baca siswa. Suasana yang kondusif membantu siswa berkonsentrasi, sementara penataan ruang yang rapi membuat kegiatan membaca dan belajar terasa lebih menyenangkan. Perpustakaan juga menjadi ruang yang mendorong rasa ingin tahu, kreativitas, dan semangat untuk terus belajar Melalui layanan dan fasilitas yang tersedia, perpustakaan diharapkan dapat menjadi bagian penting dari lingkungan pendidikan: tempat siswa memperoleh informasi, mengembangkan kemampuan berpikir, serta menumbuhkan kecintaan terhadap ilmu pengetahuan dan literasi.",
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
    alt: "Fasilitas DAK sekolah",
    description:
      "Ruang belajar dan studio DAK yang dilengkapi fasilitas multimedia untuk mendukung kegiatan desain, produksi konten, dan rekaman.",
    slides: [
      {
        src: "/images/fasilitas/dak.jpg",
        alt: "Ruang DAK 1",
      },
      {
        src: "/images/fasilitas/dak-2.jpg",
        alt: "Ruang DAK 2",
      },
      {
        src: "/images/fasilitas/dak-3.jpg",
        alt: "Ruang DAK 3",
      },
      {
        src: "/images/fasilitas/dak-studio.jpg",
        alt: "Studio DAK",
      },
    ],
    xmin: 2.9,
    xmid: 1.5,
    xmax: 0,
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
              key={g.src ?? g.label}
              item={g}
              onOpen={() => setSelectedImage(g)}
            />
          ))}
        </div>
      </div>

      <ImageModal
        key={selectedImage?.label ?? "closed"}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        src={selectedImage?.poster || ""}
        alt={selectedImage?.alt || ""}
        title={selectedImage?.label}
        description={selectedImage?.description}
        slides={selectedImage?.slides}
        // videoSrc={isDesktop ? selectedImage?.src : undefined}
        // poster={selectedImage?.poster}
      />
    </section>
  );
}
