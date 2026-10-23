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
import { clientIp, rateLimit } from "@/lib/rate-limit";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

function toTitle(firstUserText: string): string {
  const t = firstUserText.trim().replace(/\s+/g, " ");
  return t.length > 60 ? `${t.slice(0, 57)}...` : t || "Percakapan baru";
}

/** Toleransi salah ketik umum agar "PPBD" tetap mengambil knowledge PPDB. */
function normalizePpdbTerm(text: string): string {
  return text.replace(/\bppbd\b/gi, "ppdb");
}

function isPpdbOverviewRequest(text: string): boolean {
  const normalized = normalizePpdbTerm(text);
  const mentionsPpdb =
    /\b(ppdb|spmb|pendaftaran|pendaftar|mendaftar|daftar ulang)\b/i.test(
      normalized
    );
  const asksForOverview =
    /\b(info|informasi|lengkap|semua|jelaskan|jelasin|apa saja|ringkasan|overview|tentang)\b/i.test(
      normalized
    );
  return mentionsPpdb && asksForOverview;
}

/**
 * Snapshot jumlah pendaftar PPDB per jurusan, diambil dari database
 * (tabel ppdb_registrations) dengan cache singkat. Ditempel ke konteks
 * knowledge agar AI bisa menjawab kuota/ jumlah pendaftar dari data asli,
 * bukan angka statis di markdown yang bisa basi.
 */
const PPDB_CACHE_MS = 5 * 60_000; // 5 menit

/**
 * Jawaban deterministik untuk permintaan "info PPDB" yang luas.
 * Dibuat dari fakta knowledge/06-ppdb.md, 08-berita.md, dan 07-kontak.md
 * agar model tidak mereduksi permintaan ringkasan menjadi 1–2 kalimat atau
 * mengarang tanggal/biaya yang tidak tercatat.
 */
const PPDB_OVERVIEW_REPLY = [
  "**PPDB SMK Telekomunikasi Tunas Harapan — Tahun Ajaran 2026/2027**",
  "",
  "- **Gelombang dan kuota:** Dokumen resmi yang tersedia mencatat Gelombang 1. Situs menyebut kuota 3 kelas per jurusan.",
  "- **Beasiswa dan promo:** 20 pendaftar Gelombang 1 yang berprestasi akademik atau non-akademik berpeluang mendapat beasiswa SPP selama 1 tahun. Dokumen juga mencatat kesempatan gratis biaya pendaftaran, tetapi bagian persyaratan mencantumkan pembayaran biaya pendaftaran. Konfirmasikan promo yang berlaku kepada panitia.",
  "- **Biaya Pendidikan Spesial (Early Registration):** PP Rp3.500.000 (dapat diangsur) dan SPP Rp250.000. Konfirmasikan kepada panitia apakah ada rincian biaya lain.",
  "- **Pilihan jurusan:** Wajib memilih 2 jurusan berbeda. Pilihan pertama menjadi prioritas, sedangkan pilihan kedua menjadi cadangan.",
  "- **Dokumen:** Fotokopi rapor semester 1–5, fotokopi akta kelahiran, fotokopi Kartu Keluarga, dan 5 lembar pas foto ukuran 3×4. Isi data sesuai akta kelahiran dan bawa dokumen asli saat datang ke sekolah.",
  "- **Cara mendaftar:** Login menggunakan akun, isi formulir online, lalu simpan nomor pendaftaran otomatis. Tunggu jadwal tes melalui WhatsApp (SMS menjadi alternatif), datang ke sekolah membawa dokumen asli, lalu selesaikan daftar ulang dan biaya pendidikan. Formulir online merupakan bukti pendaftaran sementara.",
  "- **Materi wawancara:** Biodata calon siswa, bakat dan minat, karakter dan sikap, kesediaan menaati peraturan sekolah, serta kesanggupan orang tua/wali membiayai pendidikan.",
  "- **Tes kesehatan:** Tes buta warna dan pendengaran, pemeriksaan tato/tindik/cacat tubuh, pemeriksaan penyakit keturunan yang tercantum dalam dokumen (misalnya asma, tremor, dan jantung), serta pengukuran tinggi dan berat badan.",
  "- **Tanggal penting:** Dokumen yang tersedia tidak mencantumkan tanggal pasti pembukaan/penutupan gelombang atau tanggal tes. Jadwal tes akan disampaikan kepada pendaftar.",
].join("\n");

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
      ppdbCache = { at: Date.now(), text: "" };
      return "";
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
    // DB gagal → jangan gagalkan chat; lewati saja konteks kuota.
    console.warn("[/api/chat] Gagal mengambil data PPDB live:", error);
    return "";
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
  const perMinute = rateLimit(`chat:min:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });
  const perHour = rateLimit(`chat:hour:${ip}`, {
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
    const query = normalizePpdbTerm(userTurns.slice(-2).join(" "));
    const knowledgeQuery = normalizePpdbTerm(
      query || messages[messages.length - 1]?.content || ""
    );
    ppdbOverviewRequested = isPpdbOverviewRequest(knowledgeQuery);
    const isPpdbQuestion =
      /\b(ppdb|spmb|pendaftaran|pendaftar|mendaftar|daftar|daftar ulang|biaya pendaftaran|berkas pendaftaran)\b/i.test(
        knowledgeQuery
      );
    const isBroadPpdbQuestion =
      isPpdbQuestion &&
      /\b(info|informasi|lengkap|semua|jelaskan|alur|persyaratan|syarat|prosedur|apa saja)\b/i.test(
        knowledgeQuery
      );
    const picked = getKnowledgeContext(knowledgeQuery, {
      maxFiles: isBroadPpdbQuestion ? 1 : 3,
      maxCharsPerFile: 3500,
      maxTotalChars: 9000,
      includeFiles: isBroadPpdbQuestion
        ? ["06-ppdb.md", "08-berita.md", "07-kontak.md"]
        : isPpdbQuestion
          ? ["06-ppdb.md"]
          : [],
    });
    sourceFiles = picked.files;
    knowledge = picked.context;
    knowledgeMatched = picked.matched;

    // Konteks PPDB live dari DB hanya untuk pertanyaan yang menanyakan
    // JUMLAH pendaftar/kuota — pertanyaan lain (biaya, syarat, cara daftar)
    // tidak membutuhkannya, jadi hemat token input DAN tetap cacheable.
    const wantsPpdbCount =
      /\b(pendaftar|mendaftar|terdaftar|kuota|sisa|jumlah)\b/i.test(query);
    if (wantsPpdbCount) {
      const live = await getPpdbLiveContext();
      if (live) {
        knowledge = `${knowledge}\n\n${live}`;
        liveAppended = true;
      }
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
    /\b(ppdb|spmb|pendaftaran|pendaftar|mendaftar|daftar|daftar ulang|biaya pendaftaran)\b/i.test(
      lastQuestion
    );
  // Ganti namespace cache PPDB agar jawaban lama yang terlalu singkat/
  // belum memakai konteks lengkap tidak terpakai selama TTL 24 jam.
  const cacheKey = isSingleTurn && !ppdbOverviewRequested
    ? `${isPpdbCacheEntry ? "ppdb-v2:" : ""}${normalizeQuestion(normalizePpdbTerm(lastQuestion))}`
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
        if (ppdbOverviewRequested) {
          // "Info PPDB" harus selalu lengkap dan akurat; jangan bergantung pada
          // model generatif yang terkadang mereduksinya menjadi satu kalimat.
          reply = PPDB_OVERVIEW_REPLY;
          sourceFiles = ["06-ppdb.md", "08-berita.md", "07-kontak.md"];
          send({ t: "token", v: reply });
        } else if (cached) {
          // Hit cache: satu chunk utuh, langsung selesai (nol panggilan Gemini).
          reply = cached.reply;
          sourceFiles = cached.sources;
          send({ t: "token", v: reply });
        } else {
          await streamGemini(messages, knowledge, (chunk) => {
            // Client putus di tengah → hentikan tarikan Gemini (hemat kuota).
            if (closed) throw new Error("CLIENT_DISCONNECTED");
            reply += chunk;
            send({ t: "token", v: chunk });
          });
          if (!reply.trim()) {
            throw new Error("Gemini mengembalikan respons kosong.");
          }
          // Pertanyaan tunggal tanpa angka live → simpan untuk kunjungan berikutnya.
          if (cacheKey) {
            void setCachedAnswer(cacheKey, reply, sourceFiles);
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
