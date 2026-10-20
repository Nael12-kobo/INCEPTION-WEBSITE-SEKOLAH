import { prisma } from "@/lib/prisma";

/**
 * Cache jawaban chat (chat_qa_cache) + log pertanyaan yang tidak ketemu
 * knowledge (chat_miss_logs). Keduanya dipakai route /api/chat:
 *
 * - Cache: pertanyaan populer berulang ("Berapa biaya PPDB?") dilayani dari
 *   DB tanpa memanggil Gemini → hemat kuota GEMINI_API_KEY.
 * - Miss log: pertanyaan tanpa kecocokan keyword knowledge dicatat per
 *   pertanyaan ternormalisasi (count++) → bahan admin isi knowledge baru.
 *
 * Semua operasi best-effort: kegagalan DB TIDAK boleh menggagalkan chat.
 */

/** TTL cache jawaban biasa: 24 jam. */
const CACHE_TTL_MS = 24 * 60 * 60_000;

/**
 * Normalisasi pertanyaan jadi kunci cache:
 * huruf kecil, spasi dirapikan, tanda baca kanan dibuang, maks 300 char.
 * "  Berapa BIAYA  ppdb? " → "berapa biaya ppdb"
 */
export function normalizeQuestion(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[?.!,;:]+\s*$/g, "")
    .trim()
    .slice(0, 300);
}

interface CachedAnswer {
  reply: string;
  sources: string[];
}

/** Ambil jawaban dari cache. null = miss / kadaluarsa / DB gagal. */
export async function getCachedAnswer(
  key: string
): Promise<CachedAnswer | null> {
  try {
    const row = await prisma.chatQACache.findUnique({ where: { key } });
    if (!row) return null;
    if (row.expiresAt.getTime() < Date.now()) {
      // Kadaluarsa → hapus async, anggap miss.
      void prisma.chatQACache
        .delete({ where: { id: row.id } })
        .catch(() => undefined);
      return null;
    }
    const reply = typeof row.reply === "string" ? row.reply : "";
    if (!reply.trim()) return null;
    const sources = Array.isArray(row.sources)
      ? row.sources.filter((s): s is string => typeof s === "string")
      : [];
    return { reply, sources };
  } catch (error) {
    console.warn("[chat-cache] Gagal baca cache:", error);
    return null;
  }
}

/** Simpan jawaban ke cache (upsert) + prune entri kadaluarsa (opportunistic). */
export async function setCachedAnswer(
  key: string,
  reply: string,
  sources: string[]
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
    await prisma.chatQACache.upsert({
      where: { key },
      create: { key, reply, sources, expiresAt },
      update: { reply, sources, expiresAt },
    });
    // Prune ~1% tulisan: buang entri lewat TTL agar tabel tidak menumpuk.
    if (Math.random() < 0.01) {
      void prisma.chatQACache
        .deleteMany({ where: { expiresAt: { lt: new Date() } } })
        .catch(() => undefined);
    }
  } catch (error) {
    console.warn("[chat-cache] Gagal tulis cache:", error);
  }
}

/**
 * Catat pertanyaan miss (retrieval nol kecocokan) — count++ per
 * pertanyaan ternormalisasi. Tanpa await agar tidak menahan balasan.
 */
export function recordMissedQuestion(question: string): void {
  const key = normalizeQuestion(question);
  if (key.length < 3) return;
  void prisma.chatMissLog
    .upsert({
      where: { question: key },
      create: { question: key },
      update: { count: { increment: 1 }, lastAt: new Date() },
    })
    .catch((error) => console.warn("[chat-cache] Gagal catat miss:", error));
}
