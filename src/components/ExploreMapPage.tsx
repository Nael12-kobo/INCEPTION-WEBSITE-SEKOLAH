"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LocateFixed, MapPin, Minus, Plus } from "lucide-react";
import { EXPLORE_LOCATIONS, EXPLORE_MAP_SRC } from "@/lib/explore-map";

const MAP_ASPECT_RATIO = 2000 / 1375;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

type Point = { x: number; y: number };
type Size = { width: number; height: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getMapSize(viewport: Size): Size {
  if (viewport.width <= 0 || viewport.height <= 0) {
    return { width: 0, height: 0 };
  }

  if (viewport.width / viewport.height > MAP_ASPECT_RATIO) {
    return {
      width: viewport.width,
      height: viewport.width / MAP_ASPECT_RATIO,
    };
  }

  return {
    width: viewport.height * MAP_ASPECT_RATIO,
    height: viewport.height,
  };
}

export function ExploreMapPage({
  mapAvailable,
  availableLocationSlugs,
}: {
  mapAvailable: boolean;
  availableLocationSlugs: string[];
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const [viewport, setViewport] = useState<Size>({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const availableLocations = new Set(availableLocationSlugs);
  const locations = EXPLORE_LOCATIONS.filter((location) =>
    availableLocations.has(location.slug),
  );
  const mapSize = getMapSize(viewport);

  const clampPan = (nextPan: Point, nextZoom = zoom): Point => {
    const maxX = Math.max(0, (mapSize.width * nextZoom - viewport.width) / 2);
    const maxY = Math.max(0, (mapSize.height * nextZoom - viewport.height) / 2);
    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  };

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return;

    const updateSize = () => {
      setViewport({
        width: viewportElement.clientWidth,
        height: viewportElement.clientHeight,
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(viewportElement);
    return () => observer.disconnect();
  }, []);

  const changeZoom = (delta: number) => {
    setZoom((currentZoom) => {
      const nextZoom = clamp(currentZoom + delta, MIN_ZOOM, MAX_ZOOM);
      setPan((currentPan) => clampPan(currentPan, nextZoom));
      return nextZoom;
    });
  };

  const resetView = () => {
    setZoom(MIN_ZOOM);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType !== "touch") return;
    draggingRef.current = true;
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = pan;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    setPan(
      clampPan({
        x: panStartRef.current.x + deltaX,
        y: panStartRef.current.y + deltaY,
      }),
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const displayPan = clampPan(pan);
  const mapTransform = `translate3d(calc(-50% + ${displayPan.x}px), calc(-50% + ${displayPan.y}px), 0) scale(${zoom})`;

  return (
    <main className="fixed inset-0 overflow-hidden bg-background text-foreground">
      {!mapAvailable ? (
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
          Peta lokasi belum tersedia.
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="relative h-full w-full select-none touch-none overflow-hidden"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={(event) => {
            event.preventDefault();
            changeZoom(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP);
          }}
        >
          <div
            className="absolute left-1/2 top-1/2 origin-center will-change-transform"
            style={{
              width: mapSize.width || "100vw",
              height: mapSize.height || "100vh",
              transform: mapTransform,
            }}
          >
            <Image
              src={EXPLORE_MAP_SRC}
              alt="Peta udara kawasan SMK Telekomunikasi Tunas Harapan"
              fill
              priority
              sizes="100vw"
              className="pointer-events-none object-cover"
              draggable={false}
            />
          </div>

          {locations.map((location) => (
            <Link
              key={location.slug}
              href={`/explore/${location.slug}`}
              aria-label={`Lihat photosphere ${location.label}`}
              style={{
                left:
                  viewport.width / 2 +
                  displayPan.x +
                  (mapSize.width * (location.x / 100 - 0.5)) * zoom,
                top:
                  viewport.height / 2 +
                  displayPan.y +
                  (mapSize.height * (location.y / 100 - 0.5)) * zoom,
              }}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerMove={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
            >
              <span className="flex items-center gap-1.5 rounded-full border border-white/80 bg-blue-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-sky-600 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
                <MapPin className="size-4 shrink-0" aria-hidden />
                {location.label}
              </span>
            </Link>
          ))}

          <Link
            href="/"
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
            onPointerUp={(event) => event.stopPropagation()}
            className="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card/90 px-3 py-2.5 text-sm font-semibold text-foreground shadow-xl backdrop-blur transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:left-6 sm:top-6"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Beranda
          </Link>

          <div className="absolute right-4 top-4 z-20 flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-xl backdrop-blur sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={() => changeZoom(ZOOM_STEP)}
              aria-label="Perbesar peta"
              className="flex size-11 items-center justify-center border-b border-border text-foreground transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <Plus className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => changeZoom(-ZOOM_STEP)}
              aria-label="Perkecil peta"
              className="flex size-11 items-center justify-center border-b border-border text-foreground transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <Minus className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset posisi dan zoom peta"
              className="flex size-11 items-center justify-center text-foreground transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              <LocateFixed className="size-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
