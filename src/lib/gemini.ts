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

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: buildGeminiContents(messages.slice(-20)),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini error ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const reply: string | undefined =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p?.text ?? "")
      .join("")
      .trim();
  if (!reply) throw new Error("Gemini mengembalikan respons kosong.");
  return reply;
}
