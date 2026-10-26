"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExploreLocation } from "@/lib/explore-map";

const ExplorePhotosphereViewer = dynamic(
  () =>
    import("@/components/ExplorePhotosphereViewer").then(
      (module) => module.ExplorePhotosphereViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
        Menyiapkan photosphere...
      </div>
    ),
  },
);

export function ExplorePhotospherePage({
  location,
}: {
  location: ExploreLocation;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePanorama = location.panoramas[activeIndex];

  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-4 sm:px-8">
        <Button asChild variant="secondary" className="gap-2">
          <Link href="/explore">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Explore
          </Link>
        </Button>
        <h1 className="text-lg font-bold text-foreground sm:text-2xl">{location.label}</h1>
      </header>

      <section
        className="relative min-h-[65dvh] flex-1 overflow-hidden"
        aria-label={`Photosphere ${location.label}`}
      >
        <ExplorePhotosphereViewer
          key={activePanorama.slug}
          src={activePanorama.src}
          alt={activePanorama.alt}
        />
        <p className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-full bg-black/60 px-3 py-2 text-xs text-white/90 backdrop-blur sm:bottom-6 sm:left-6 sm:text-sm">
          Geser untuk melihat sekeliling · cubit atau scroll untuk zoom
        </p>
      </section>

      {location.panoramas.length > 1 && (
        <nav
          aria-label={`Pilihan photosphere ${location.label}`}
          className="flex shrink-0 items-center justify-center gap-3 border-t border-border bg-card px-4 py-4"
        >
          {location.panoramas.map((panorama, index) => (
            <button
              key={panorama.slug}
              type="button"
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={`group flex items-center gap-3 rounded-xl border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${activeIndex === index ? "border-primary bg-primary/10" : "border-border hover:border-primary/60 hover:bg-muted"}`}
            >
              <span className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-14 sm:w-24">
                <Image
                  src={panorama.src}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </span>
              <span className="text-sm font-semibold text-foreground">
                {panorama.label}
              </span>
            </button>
          ))}
        </nav>
      )}
    </main>
  );
}
