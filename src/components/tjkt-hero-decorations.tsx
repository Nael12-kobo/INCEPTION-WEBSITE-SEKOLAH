/**
 * Placeholder dekorasi hero TJKT.
 * Dibuat otomatis agar build lolos — ganti dengan desain asli bila sudah ada.
 */
export default function TJKTHeroDecorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
    </div>
  );
}
