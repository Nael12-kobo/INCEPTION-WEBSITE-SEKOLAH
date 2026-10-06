import { GoogleGenAI } from "@google/genai";

export interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `Kamu adalah "Asisten Sekolah" SMK Telekomunikasi Tunas Harapan — sekolah vokasi modern bidang telekomunikasi, jaringan, dan teknologi digital.
Jawab dalam Bahasa Indonesia yang ramah dan ringkas (maksimal 5 kalimat kecuali diminta detail).
Topik yang kamu kuasai: profil sekolah, jurusan (DKV, PPLG, TJKT, TKRO), fasilitas, PPDB 2026/2027, prestasi, kegiatan, berita, dan kontak.
Gunakan HANYA fakta dari "Konteks resmi" di bawah bila tersedia. Jika jawaban tidak ada di konteks, katakan terus terang tidak tahu lalu arahkan ke halaman /ppdb atau kontak sekretariat — jangan mengarang.
Jika ditanya di luar topik sekolah, jawab seadanya lalu arahkan kembali ke info sekolah.
Jangan mengarang nomor pendaftaran, biaya, atau tanggal penting — arahkan ke halaman PPDB / kontak sekretariat bila tidak yakin.
Jurusan otomotif selalu tulis TKRO (TKR hanya alias lama di database, artinya sama).`;

export function buildGeminiContents(
  messages: { role: "user" | "assistant"; content: string }[]
): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function isTransientGeminiError(error: unknown): boolean {
  const status = Number((error as { status?: number })?.status ?? 0);
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    name === "AbortError" ||
    /timeout|timed out|high demand|temporarily unavailable|unavailable/i.test(message)
  );
}

async function generateWithGemini(
  apiKey: string,
  model: string,
  messages: { role: "user" | "assistant"; content: string }[],
  systemInstruction: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model,
    contents: buildGeminiContents(messages.slice(-20)),
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 512,
      httpOptions: { timeout: 30_000 },
    },
  });
  const reply = (res.text ?? "").trim();
  if (!reply) throw new Error("Gemini mengembalikan respons kosong.");
  return reply;
}

export async function askGemini(
  messages: { role: "user" | "assistant"; content: string }[],
  knowledgeContext = ""
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  const fallbackModel =
    process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite";
  const fallbackApiKey = process.env.GEMINI_FALLBACK_API_KEY || apiKey;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diisi di .env");
  }

  const systemInstruction = knowledgeContext
    ? `${SYSTEM_PROMPT}\n\nKonteks resmi (sumber kebenaran, jangan karang di luar ini):\n${knowledgeContext}`
    : SYSTEM_PROMPT;

  try {
    return await generateWithGemini(apiKey, model, messages, systemInstruction);
  } catch (primaryError) {
    if (!isTransientGeminiError(primaryError)) {
      const status = (primaryError as { status?: number })?.status;
      const msg =
        primaryError instanceof Error ? primaryError.message : "unknown error";
      throw new Error(
        `Gemini error${status ? ` ${status}` : ""}: ${msg.slice(0, 300)}`
      );
    }

    console.warn(
      `[Gemini] primary model ${model} gagal sementara; mencoba fallback ${fallbackModel}`
    );

    try {
      return await generateWithGemini(
        fallbackApiKey,
        fallbackModel,
        messages,
        systemInstruction
      );
    } catch (fallbackError) {
      const status = (fallbackError as { status?: number })?.status;
      const msg =
        fallbackError instanceof Error
          ? fallbackError.message
          : "unknown error";
      throw new Error(
        `Gemini fallback error${status ? ` ${status}` : ""}: ${msg.slice(0, 300)}`
      );
    }
  }
}
