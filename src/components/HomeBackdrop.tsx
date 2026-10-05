/**
 * Background mesh vivid + orbs untuk Home.
 * Murni CSS float loop yang jalan sendiri — tidak ada nilai animasi
 * yang dihitung dari scroll (trigger-only).
 *
 * Di layar kecil orb dibuat lebih kecil + blur lebih ringan: 4 lapisan
 * blur-3xl berukuran penuh adalah raster paling boros di halaman ini
 * (compositing & memori GPU, terasa di HP kelas menengah).
 */
export function HomeBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-sky-200/70 via-sky-100/50 to-cyan-100/60" />
      <div className="absolute inset-0 bg-grid-sky opacity-70 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-0">
        <div className="orb-float absolute -top-28 left-[6%] h-96 w-96 rounded-full bg-sky-400/40 blur-3xl max-sm:h-56 max-sm:w-56 max-sm:blur-2xl" />
        <div className="orb-float-delayed absolute right-[4%] top-[22%] h-[28rem] w-[28rem] rounded-full bg-cyan-300/50 blur-3xl max-sm:h-64 max-sm:w-64 max-sm:blur-2xl" />
      </div>
      <div className="absolute inset-0">
        <div className="orb-float-delayed absolute -left-28 top-[46%] h-96 w-96 rounded-full bg-cyan-200/45 blur-3xl max-sm:h-56 max-sm:w-56 max-sm:blur-2xl" />
        <div className="orb-float absolute bottom-[-6rem] right-[16%] h-80 w-80 rounded-full bg-sky-500/60 blur-3xl max-sm:h-56 max-sm:w-56 max-sm:blur-2xl" />
      </div>
    </div>
  );
}
