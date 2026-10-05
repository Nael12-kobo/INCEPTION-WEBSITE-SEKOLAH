/**
 * Placeholder dekorasi hero PPLG versi mobile.
 * Dibuat otomatis agar build lolos — ganti dengan desain asli bila sudah ada.
 */
export default function PPLGHeroDecorationsMobile() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 md:hidden">
      <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
    </div>
  );
}
