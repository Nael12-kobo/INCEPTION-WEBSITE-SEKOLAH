import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamGemini } from "@/lib/gemini";
import { getKnowledgeContext } from "@/lib/knowledge";
import {
  getCachedAnswer,
  normalizeQuestion,
  recordMissedQuestion,
  setCachedAnswer,
} from "@/lib/chat-cache";
import { clientIp, rateLimitAsync } from "@/lib/rate-limit";
import { asksPpdbApplicantCount, isPpdbOverviewRequest, isPpdbQuestion, normalizePpdbTerm } from "@/lib/ai-query";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

function toTitle(firstUserText: string): string {
  const t = firstUserText.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}...` : t || "Percakapan baru";
}

/**
 * Snapshot jumlah pendaftar PPDB per jurusan, diambil dari database
 * (tabel ppdb_registrations) dengan cache singkat. Ditempel ke konteks
 * knowledge agar AI bisa menjawab kuota/ jumlah pendaftar dari data asli,
 * bukan angka statis di markdown yang bisa basi.
 */
const PPDB_CACHE_MS = 5 * 60_000; // 5 menit
let ppdbCache: { at: number; text: string } | null = null;

async function getPpdbLiveContext(): Promise<string> {
  if (ppdbCache && Date.now() - ppdbCache.at < PPDB_CACHE_MS) {
    return ppdbCache.text;
  }
  try {
    const byMajor = await prisma.ppdbRegistration.groupBy({
      by: ["majorFirst"],
      _count: { _all: true },
    });
    const total = byMajor.reduce((sum, r) => sum + r._count._all, 0);
    if (total === 0) {
      const text = "Data live database PPDB saat ini menunjukkan 0 pendaftaran tercatat. Ini hanya jumlah baris pendaftaran yang tercatat saat pemeriksaan, BUKAN jumlah kuota atau sisa kursi. Jangan menyimpulkan kuota habis atau masih tersedia dari angka ini.";
      ppdbCache = { at: Date.now(), text };
      return text;
    }
    const label: Record<string, string> = {
      DKV: "DKV",
      PPLG: "PPLG",
      TJKT: "TJKT",
      TKR: "TKRO",
    };
    const parts = byMajor.map(
      (r) => `${label[r.majorFirst] ?? r.majorFirst}: ${r._count._all}`
    );
    const text =
      `📊 Data pendaftar PPDB dari sistem (baru dihitung, sumber database):\n` +
      `- Total pendaftar tercatat: ${total} orang\n` +
      `- Per pilihan pertama jurusan: ${parts.join(", ")}\n` +
      `Angka ini jumlah pendaftar tercatat, BUKAN sisa kuota. Jangan mengklaim sisa kuota/ pendaftar tersisa.`;
    ppdbCache = { at: Date.now(), text };
    return text;
  } catch (error) {
    // Chat tetap berjalan, tetapi jangan biarkan AI mengira angka live sudah diverifikasi.
    console.warn("[/api/chat] Gagal mengambil data PPDB live:", error);
    return "Data live jumlah pendaftar PPDB sedang tidak dapat diverifikasi. Jangan menebak total, sisa kuota, atau jumlah pendaftar; sarankan pengguna mengonfirmasi ke panitia.";
  }
}

/**
 * Berapa banyak pesan di awal `thread` yang sudah identik (role + isi)
 * dengan pesan di akhir `existing`.
 *
 * Client sengaja mengirim ulang window percakapan tiap giliran
 * (chat-store: `messages: history.slice(-20)`), jadi `fullThread` selalu
 * berisi sebagian percakapan yang SUDAH tersimpan. Tanpa fungsi ini,
 * `merged = [...prev, ...fullThread]` menduplikasi ±20 pesan setiap kali
 * user mengirim chat → riwayat tampil 2–4 kali lipat dan payload JSON
 * membengkak kuadratik sampai terpotong `slice(-100)`.
 */
function countTrailingOverlap(
  existing: { role: string; content: string }[],
  thread: { role: string; content: string }[]
): number {
  const max = Math.min(existing.length, thread.length);
  // Cari k terbesar: ekor `existing` sepanjang k == kepala `thread` sepanjang k.
  // Descending karena irisan tidak harus mulai dari k=1 (mis. ekor thread
  // lama sudah kepotong window slice(-20) di client).
  for (let k = max; k >= 1; k--) {
    const tail = existing.slice(existing.length - k);
    const identical = tail.every(
      (p, i) => p.role === thread[i].role && p.content === thread[i].content
    );
    if (identical) return k;
  }
  return 0;
}

/**
 * Simpan thread ke chat_conversations (hanya user login).
 * Return { conversationId, stored } — DB gagal tetap stored:false tanpa
 * menggagalkan balasan (sudah terkirim ke user lewat stream).
 */
async function persistConversation(
  userId: string | undefined,
  messages: { role: "user" | "assistant"; content: string }[],
  reply: string,
  sourceFiles: string[],
  conversationId: string | undefined
): Promise<{ conversationId: string | null; stored: boolean }> {
  if (!userId) return { conversationId: null, stored: false };

  const now = new Date().toISOString();
  const fullThread = [
    ...messages.map((m) => ({ ...m, createdAt: now })),
    {
      role: "assistant" as const,
      content: reply,
      createdAt: now,
      // Sumber ikut disimpan agar riwayat (loadConversation) tetap
      // menampilkan chip "Sumber" seperti chat baru.
      ...(sourceFiles.length ? { sources: sourceFiles } : {}),
    },
  ];

  try {
    if (conversationId) {
      const existing = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (existing) {
        const prev = Array.isArray(existing.messages)
          ? (existing.messages as { role: string; content: string; createdAt?: string }[])
          : [];
        const overlap = countTrailingOverlap(prev, fullThread);
        const merged = [...prev, ...fullThread.slice(overlap)].slice(-100);
        const updated = await prisma.chatConversation.update({
          where: { id: existing.id },
          data: { messages: merged, updatedAt: new Date() },
        });
        return { conversationId: updated.id, stored: true };
      }
    }
    const firstUser = messages.find((m) => m.role === "user");
    const created = await prisma.chatConversation.create({
      data: {
        userId,
        title: toTitle(firstUser?.content ?? ""),
        messages: fullThread,
      },
    });
    return { conversationId: created.id, stored: true };
  } catch (error) {
    // DB gagal → tetap kembalikan balasan agar UX tidak rusak.
    console.error("[/api/chat] Gagal menyimpan histori:", error);
    return { conversationId: conversationId ?? null, stored: false };
  }
}

/** Pesan ramah untuk kegagalan Gemini (dikirim sebagai event error SSE). */
function geminiFailureMessage(error: unknown): string {
  return error instanceof Error && error.message.includes("GEMINI_API_KEY")
    ? "Layanan AI belum dikonfigurasi (GEMINI_API_KEY kosong). Hubungi admin."
    : "Maaf, asisten AI sedang sibuk. Coba lagi sebentar ya.";
}

/**
 * POST /api/chat
 * Body: { messages: [{role, content}], conversationId?: string }
 *
 * Respons 200 = SSE (`text/event-stream`):
 *   data: {"t":"token","v":"..."}        potongan teks (streaming)
 *   data: {"t":"done","reply","sources","conversationId","stored"}
 *   data: {"t":"error","message"}        kegagalan setelah stream dibuka
 *
 * Error sebelum stream (validasi 400 / rate limit 429 / invalid JSON)
 * tetap JSON error biasa seperti sebelumnya.
 *
 * - Guest (belum login): tidak disimpan ke DB, hanya balasan Gemini.
 * - Login: conversation dibuat / dilanjutkan di chat_conversations.
 * - Cache (chat_qa_cache): pertanyaan tunggal yang sudah pernah dijawab
 *   dilayani tanpa memanggil Gemini — hemat kuota.
 */
export async function POST(request: Request) {
  let body: { messages?: IncomingMessage[]; conversationId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter((m) => m && typeof m.content === "string" && m.content.trim())
        .slice(-20)
        .map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content.trim().slice(0, 500),
        }))
    : [];

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json(
      { message: "Kirim minimal satu pesan user." },
      { status: 400 }
    );
  }

  // Batasi sebelum memanggil Gemini — endpoint ini terbuka untuk guest,
  // tanpa ini satu script bisa menghabiskan seluruh kuota GEMINI_API_KEY.
  // Dihitung per IP; lihat catatan batasan serverless di lib/rate-limit.
  const ip = clientIp(request);
  const perMinute = await rateLimitAsync(`chat:min:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });
  const perHour = await rateLimitAsync(`chat:hour:${ip}`, {
    limit: 150,
    windowMs: 3_600_000,
  });
  if (!perMinute.ok || !perHour.ok) {
    const retryAfter = Math.max(
      perMinute.ok ? perHour.retryAfterSec : perMinute.retryAfterSec,
      1
    );
    return NextResponse.json(
      {
        message:
          "Terlalu banyak permintaan. Tunggu sebentar lalu kirim lagi ya.",
        retryAfterSec: retryAfter,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      }
    );
  }

  // Sumber knowledge yang dipakai untuk menjawab — diteruskan ke client
  // sebagai chip "Sumber" di bubble jawaban (lihat Fase: sumber jawaban).
  let sourceFiles: string[] = [];
  let knowledge = "";
  let knowledgeMatched = true;
  let ppdbOverviewRequested = false;
  // Konteks PPDB live ikut menempel → jawaban memuat angka berubah-ubah,
  // sehingga TIDAK boleh masuk cache (angka live bisa basi 24 jam).
  let liveAppended = false;

  try {
    // Retrieval keyword: ambil 2-3 file knowledge paling relevan. Query =
    // gabungan pesan user terakhir + giliran user sebelumnya (multi-turn),
    // supaya pertanyaan lanjutan seperti "yang kedua berapa?" tetap punya
    // konteks topik sebelumnya. Gagal baca file tidak boleh menggagalkan
    // chat → fallback string kosong.
    const userTurns = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content);
    const currentQuestion = messages[messages.length - 1]?.content ?? "";
    const query = normalizePpdbTerm(userTurns.slice(-2).join(" "));
    const knowledgeQuery = normalizePpdbTerm(query || currentQuestion);
    ppdbOverviewRequested = isPpdbOverviewRequest(currentQuestion, knowledgeQuery);
    const ppdbQuestion = isPpdbQuestion(currentQuestion, knowledgeQuery);
    const isBroadPpdbQuestion = ppdbOverviewRequested;
    const picked = getKnowledgeContext(knowledgeQuery, {
      maxFiles: 3,
      maxCharsPerFile: ppdbQuestion ? 10500 : 3500,
      maxTotalChars: ppdbQuestion ? 14000 : 9000,
      includeFiles: isBroadPpdbQuestion
        ? ["06-ppdb.md", "08-berita.md", "07-kontak.md"]
        : ppdbQuestion
          ? ["06-ppdb.md"]
          : [],
    });
    sourceFiles = picked.files;
    knowledge = picked.context;
    knowledgeMatched = picked.matched;

    // Konteks PPDB live dari DB hanya untuk pertanyaan yang menanyakan
    // JUMLAH pendaftar/kuota — pertanyaan lain (biaya, syarat, cara daftar)
    // tidak membutuhkannya, jadi hemat token input DAN tetap cacheable.
    const wantsPpdbCount = asksPpdbApplicantCount(currentQuestion, knowledgeQuery);
    if (wantsPpdbCount) {
      const live = await getPpdbLiveContext();
      knowledge = knowledge + "\n\n" + live;
      // Zero/error results also bypass cache; counts are time-sensitive.
      liveAppended = true;
    }
  } catch {
    knowledge = "";
  }

  // Pertanyaan di luar materi knowledge (nol keyword cocok) → catat sebagai
  // miss; hitung frekuensinya di /admin/chat sebagai bahan isi knowledge.
  const lastUserText = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserText && !knowledgeMatched) {
    recordMissedQuestion(lastUserText.content);
  }

  // Cache hanya untuk pertanyaan TUNGGAL (percakapan baru): jawaban
  // pertanyaan lanjutan bergantung riwayat ("yang tadi berapa?") sehingga
  // tidak boleh dipakai ulang lintas user.
  const isSingleTurn =
    messages.filter((m) => m.role === "user").length === 1 && !liveAppended;
  const lastQuestion = messages[messages.length - 1]?.content ?? "";
  const isPpdbCacheEntry =
    /\b(ppdb|spmb|pendaftaran|pendaftar|mendaftar|daftar|daftar ulang|biaya pendaftaran|biaya pendidikan|beasiswa|spp|asrama|seragam|mpls|sepatu|zonasi)\b|bina lingkungan|early registration/i.test(
      normalizePpdbTerm(lastQuestion)
    );
  // Ganti namespace cache PPDB agar jawaban lama yang terlalu singkat/
  // belum memakai konteks lengkap tidak terpakai selama TTL 24 jam.
  const cacheKey = isSingleTurn && !ppdbOverviewRequested
    ? "school-ai-v3:" + (isPpdbCacheEntry ? "ppdb:" : "general:") + normalizeQuestion(normalizePpdbTerm(lastQuestion))
    : "";
  const cached = cacheKey ? await getCachedAnswer(cacheKey) : null;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (payload: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch {
          // Client putus (abort/navigasi) → stream sudah tertutup sendiri.
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* stream sudah ditutup */
        }
      };

      let reply = "";
      try {
        if (cached) {
          // Hit cache: satu chunk utuh, langsung selesai (nol panggilan Gemini).
          reply = cached.reply;
          sourceFiles = cached.sources;
          send({ t: "token", v: reply });
        } else {
          await streamGemini(
            messages,
            knowledge,
            (chunk) => {
              // Client putus di tengah → hentikan tarikan Gemini (hemat kuota).
              if (closed) throw new Error("CLIENT_DISCONNECTED");
              reply += chunk;
              send({ t: "token", v: chunk });
            },
            { maxOutputTokens: ppdbOverviewRequested ? 2400 : 800 }
          );
          if (!reply.trim()) {
            throw new Error("Gemini mengembalikan respons kosong.");
          }
          // Pertanyaan tunggal tanpa angka live → simpan untuk kunjungan berikutnya.
          if (cacheKey) {
            void setCachedAnswer(cacheKey, reply, sourceFiles, isPpdbCacheEntry ? 60 * 60_000 : undefined);
          }
        }

        const session = await auth().catch(() => null);
        const persisted = await persistConversation(
          session?.user?.id,
          messages,
          reply,
          sourceFiles,
          body.conversationId
        );
        send({
          t: "done",
          reply,
          sources: sourceFiles,
          conversationId: persisted.conversationId,
          stored: persisted.stored,
        });
      } catch (error) {
        // Putus oleh client sendiri → bukan kegagalan, jangan log error.
        if (error instanceof Error && error.message === "CLIENT_DISCONNECTED") {
          return;
        }
        console.error("[/api/chat] Gemini gagal:", error);
        const message = geminiFailureMessage(error);
        // Belum ada teks terkirim → bubble error penuh.
        // Sudah terpotong di tengah → tampilkan teks parsial + keterangan.
        send(
          reply
            ? { t: "error", message, partial: reply }
            : { t: "error", message }
        );
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Balasan tidak boleh di-buffer proxy depan (Vercel/CDN) sampai penuh.
      "X-Accel-Buffering": "no",
    },
  });
}
