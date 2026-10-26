"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, Wifi } from "lucide-react";
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
import {
  IKON_FASILITAS,
  SITE_CONTENT_DEFAULTS,
  type FasilitasKonten,
} from "@/lib/site-content";

function isGroupedFacility(label: string): boolean {
  return (
    /^DAK(?: 2| 3| Studio)?$/i.test(label) ||
    /^(?:Bengkel )?TKRO/i.test(label) ||
    /TKJ/i.test(label) ||
    /^RPS$/i.test(label)
  );
}

function groupFacilityGallery(items: FasilitasCardItem[]): FasilitasCardItem[] {
  const grouped = new Map<string, FasilitasCardItem[]>();
  const result: FasilitasCardItem[] = [];

  for (const item of items) {
    let groupKey: string | null = null;
    if (/^DAK(?: 2| 3| Studio)?$/i.test(item.label)) groupKey = "dak";
    else if (/^(?:Bengkel )?TKRO/i.test(item.label)) groupKey = "tkro";
    else if (/TKJ/i.test(item.label) || /^RPS$/i.test(item.label)) {
      groupKey = "tkj";
    }

    if (!groupKey) {
      result.push(item);
      continue;
    }

    const group = grouped.get(groupKey);
    if (group) group.push(item);
    else grouped.set(groupKey, [item]);
  }

  const groupedItems = new Map<string, FasilitasCardItem>();
  for (const [key, group] of grouped) {
    const first = group.find((item) => item.src) ?? group[0];
    if (!first) continue;

    const slides = group.flatMap((item) =>
      item.slides?.length
        ? item.slides
        : [{ src: item.poster, alt: item.alt }],
    );
    const uniqueSlides = slides.filter(
      (slide, index, all) =>
        all.findIndex((candidate) => candidate.src === slide.src) === index,
    );

    groupedItems.set(key, {
      ...first,
      label: key === "dak" ? "DAK" : key === "tkro" ? "Bengkel TKRO" : "TKJ",
      slides: uniqueSlides.length > 1 ? uniqueSlides : undefined,
    });
  }

  const groupedOrder = ["dak", "tkro", "tkj"];
  return [
    ...result.filter((item) => !isGroupedFacility(item.label)),
    ...groupedOrder.flatMap((key) => {
      const item = groupedItems.get(key);
      return item ? [item] : [];
    }),
  ];
}

const EXPLORE_SLUG_BY_FACILITY: Record<string, string> = {
  "Teaching Factory 2": "tefa-2",
  "Asrama Putra": "asrama-putra",
  "Bengkel TKRO": "bengkel-otomotif",
  DAK: "dak",
  Masjid: "masjid",
};

export function Fasilitas({
  konten = SITE_CONTENT_DEFAULTS.fasilitas,
}: {
  konten?: FasilitasKonten;
}) {
  const ref = useAnimeFlowReveal<HTMLElement>({
    direction: "left",
    distance: 170,
  });
  useTiltHover(ref, { maxTilt: 6, scale: 1.02 });
  const [active, setActive] = useState<string>(konten.tabs[0]?.id ?? "lab");
  const content = konten.tabs.find((t) => t.id === active) ?? konten.tabs[0];
  const galeri = groupFacilityGallery(
    konten.galeri.map((item) => ({
      src: item.src || undefined,
      poster: item.poster,
      label: item.label,
      alt: item.alt,
      description: item.deskripsi,
      slides: item.slides,
      xmin: item.xmin,
      xmid: item.xmid,
      xmax: item.xmax,
    })),
  );
  const [selectedImage, setSelectedImage] =
    useState<FasilitasCardItem | null>(null);

  if (!content) return null;

  return (
    <section id="fasilitas" ref={ref} className="bg-blue-300/15 dark:bg-black/25">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div data-scrub-item className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="glass-chip border-white/60">
            {konten.badge}
          </Badge>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {konten.judul}
          </h2>
          <Button asChild className="mt-5 rounded-full shadow-lg shadow-sky-300/40">
            <Link href="/explore">
              <Boxes aria-hidden />
              Jelajahi Lewat 3D
            </Link>
          </Button>
        </div>

        <div
          data-scrub-item
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {konten.tabs.map((t) => {
            const Icon = IKON_FASILITAS[t.ikon] ?? Wifi;
            return (
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
                  <Icon />
                  {t.label}
                </Button>
              </span>
            );
          })}
        </div>

        <Card
          data-scrub-item
          data-tilt
          className="glass glass-glare mt-8 overflow-hidden"
        >
          <CardContent className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {content.judul}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {content.deskripsi}
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
              key={g.src || g.label}
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
        exploreHref={
          selectedImage
            ? EXPLORE_SLUG_BY_FACILITY[selectedImage.label]
              ? `/explore/${EXPLORE_SLUG_BY_FACILITY[selectedImage.label]}`
              : undefined
            : undefined
        }
        // videoSrc={isDesktop ? selectedImage?.src : undefined}
        // poster={selectedImage?.poster}
      />
    </section>
  );
}
