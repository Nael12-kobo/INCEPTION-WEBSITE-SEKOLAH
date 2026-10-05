/**
 * Rate limiter in-memory sederhana (fixed window per key).
 *
 * Kapan dipakai:
 * - POST /api/chat → menjaga kuota GEMINI_API_KEY (kuota habis = biaya nyata)
 * - login credentials → meredam brute-force password
 * - POST /api/register & /api/forgot-password → mencegah spam
 *
 * Batasan yang harus dipahami: state-nya per-proses. Di Vercel (serverless)
 * tiap instance hitung sendiri, jadi batas efektifnya = limit × jumlah
 * instance. Ini mitigasi, BUKAN pengaman mutlak — untuk batas keras
 * dibutuhkan store terpisah (mis. Upstash Redis), yang belum dipakai
 * proyek ini. Masih cukup untuk meredam script tunggal yang berulang.
 *
 * Tidak ada dependensi eksternal supaya tidak menambah bundle/biaya.
 */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

/** Buang entri yang sudah kedaluwarsa agar Map tidak membengkak. */
function prune(now: number): void {
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  /** Sisa kuota pada window berjalan. */
  remaining: number;
  /** Berapa detik lagi window direset (untuk header Retry-After). */
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  // Safety valve: kalau kunci unik menumpuk (mis. banyak IP berbeda),
  // bersihkan yang kadaluarsa sebelum menambah baru.
  if (store.size > 5_000) prune(now);

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const ok = entry.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)),
  };
}

/** Lupakan hitungan (dipanggil saat login berhasil, dsb). */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * IP client.
 *
 * `x-real-ip` diprioritaskan karena di-set oleh platform proxy (Vercel)
 * dan tidak bisa ditulis client. `x-forwarded-for` hanya fallback; nilainya
 * bisa berisi beberapa hop, jadi ambil yang terakhir (paling dekat dengan
 * proxy) bukan yang pertama (rawan disisipi client).
 */
export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real?.trim()) return real.trim();

  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd
      .split(",")
      .map((h) => h.trim())
      .filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return request.headers.get("x-forwarded-host") ?? "unknown";
}
