import { GoogleGenAI } from "@google/genai";

export interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

const SYSTEM_PROMPT = `Kamu adalah "Asisten Sekolah" SMK Telekomunikasi Tunas Harapan — sekolah vokasi modern bidang telekomunikasi, jaringan, dan teknologi digital.
Jawab dalam Bahasa Indonesia yang ramah dan ringkas (maksimal 5 kalimat kecuali diminta detail).
Topik yang kamu kuasai: profil sekolah, jurusan (DKV, PPLG, TJKT, TKR), fasilitas, PPDB 2026/2027, berita, dan kontak.
Jika ditanya di luar topik sekolah, jawab seadanya lalu arahkan kembali ke info sekolah.
Jangan mengarang nomor pendaftaran, biaya, atau tanggal penting — arahkan ke halaman PPDB / kontak sekretariat bila tidak yakin.`;

export function buildGeminiContents(
  messages: { role: "user" | "assistant"; content: string }[]
): GeminiContent[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

export async function askGemini(
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diisi di .env");
  }

  const ai = new GoogleGenAI({ apiKey });

  let reply: string;
  try {
    const res = await ai.models.generateContent({
      model,
      contents: buildGeminiContents(messages.slice(-20)),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        maxOutputTokens: 512,
        // Tanpa timeout, request yang menggantung membuat `isTyping` di
        // client terkunci (tombol kirim & input disabled) sampai user
        // reload halaman.
        httpOptions: { timeout: 30_000 },
      },
    });
    reply = (res.text ?? "").trim();
  } catch (e) {
    const status = (e as { status?: number })?.status;
    const msg = e instanceof Error ? e.message : "unknown error";
    throw new Error(`Gemini error${status ? ` ${status}` : ""}: ${msg.slice(0, 300)}`);
  }
  if (!reply) throw new Error("Gemini mengembalikan respons kosong.");
  return reply;
}
