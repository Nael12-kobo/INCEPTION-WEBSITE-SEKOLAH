"use client";

import Image from "next/image";
import { useAnimeFlowReveal } from "@/hooks/useAnimeFlowReveal";
import { useTiltHover } from "@/hooks/useTiltHover";
import { guruKaryawan } from "@/lib/guru-karyawan";

/**
 * Grid foto guru & karyawan di /guru-karyawan.
 *
 * Memakai sistem effect yang sama dengan section homepage:
 * - reveal masuk viewport (useAnimeFlowReveal) — stagger kecil karena
 *   ada 50 kartu, biar tidak animasinya kepanjangan.
 * - tilt 3D + glare mengikuti kursor (useTiltHover + glass/glare),
 *   mati otomatis di touch device & prefers-reduced-motion.
 */
export function GuruKaryawanGrid() {
  const ref = useAnimeFlowReveal<HTMLElement>({
    direction: "center",
    distance: 60,
    staggerMs: 18,
    duration: 500,
  });
  useTiltHover(ref, { maxTilt: 6, scale: 1.02 });

  return (
    <section ref={ref}>
      <div className="tilt-scene grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {guruKaryawan.map((p) => (
          <figure
            key={p.src}
            data-scrub-item
            data-tilt
            className="glass glass-glare overflow-hidden rounded-2xl"
          >
            <div className="relative aspect-square w-full bg-white/60">
              <Image
                src={p.src}
                alt={p.nama ? `Foto ${p.nama}` : "Foto guru dan karyawan"}
                fill
                sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* min-h supaya kartu tanpa nama (DSC_0077/0135) tingginya sama */}
            <figcaption className="z-10 flex min-h-12 items-center justify-center px-2.5 py-3 text-center text-sm font-semibold leading-snug text-slate-800">
              {p.nama}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
