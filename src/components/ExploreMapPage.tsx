import Image from "next/image";
import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { EXPLORE_LOCATIONS, EXPLORE_MAP_SRC } from "@/lib/explore-map";

export function ExploreMapPage({
  mapAvailable,
  availableLocationSlugs,
}: {
  mapAvailable: boolean;
  availableLocationSlugs: string[];
}) {
  const availableLocations = new Set(availableLocationSlugs);
  const locations = EXPLORE_LOCATIONS.filter((location) =>
    availableLocations.has(location.slug),
  );

  return (
    <main className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="bg-slate-950 px-4 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">
            <Compass className="size-4" aria-hidden />
            Jelajahi kampus
          </p>
          <h1 className="text-3xl font-bold sm:text-5xl">Explore Sekolah</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Pilih penanda pada peta untuk melihat fasilitas sekolah dalam
            photosphere 360°.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8 sm:py-12">
        {mapAvailable ? (
          <div className="relative isolate aspect-[3/2] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-xl">
            <Image
              src={EXPLORE_MAP_SRC}
              alt="Peta udara kawasan SMK Telekomunikasi Tunas Harapan"
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 1152px"
              className="object-cover"
            />
            {locations.map((location) => (
              <Link
                key={location.slug}
                href={`/explore/${location.slug}`}
                aria-label={`Lihat photosphere ${location.label}`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-500"
              >
                <span className="flex items-center gap-1.5 rounded-full border border-white/80 bg-sky-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-sky-600 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
                  <MapPin className="size-4 shrink-0" aria-hidden />
                  {location.label}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div
            role="status"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950"
          >
            Peta lokasi belum tersedia. Pilih fasilitas di bawah untuk
            membuka photosphere.
          </div>
        )}

        <section aria-labelledby="explore-locations-title">
          <div className="mb-4">
            <h2 id="explore-locations-title" className="text-xl font-bold">
              Lokasi yang tersedia
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Photosphere 360° fasilitas sekolah.
            </p>
          </div>
          {locations.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <li key={location.slug}>
                  <Link
                    href={`/explore/${location.slug}`}
                    className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold shadow-sm transition hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <MapPin
                      className="size-5 shrink-0 text-sky-700"
                      aria-hidden
                    />
                    {location.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              Photosphere belum tersedia.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
