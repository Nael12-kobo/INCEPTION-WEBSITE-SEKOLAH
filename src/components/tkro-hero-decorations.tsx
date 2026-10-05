/**
 * Placeholder dekorasi hero TKRO.
 * Dibuat otomatis agar build lolos — ganti dengan desain asli bila sudah ada.
 */
export default function TKROHeroDecorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
    </div>
  );
}
