import { NextResponse } from "next/server";
import { normalizeForSpeech } from "@/lib/tts-normalizer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.FISH_AUDIO_API_KEY;
  const model = process.env.FISH_AUDIO_MODEL || "s2.1-pro-free";
  const referenceId = process.env.FISH_AUDIO_REFERENCE_ID;

  if (!apiKey) {
    return NextResponse.json(
      { message: "FISH_AUDIO_API_KEY belum diisi di .env." },
      { status: 503 }
    );
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const rawText = typeof body.text === "string" ? body.text.trim() : "";
  if (!rawText) {
    return NextResponse.json({ message: "Teks TTS kosong." }, { status: 400 });
  }

  const text = normalizeForSpeech(rawText);
  if (!text) {
    return NextResponse.json({ message: "Teks TTS kosong setelah normalisasi." }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
    text: text.slice(0, 5000),
    format: "mp3",
  };

  if (referenceId) {
    payload.reference_id = referenceId;
  }

  try {
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[/api/tts] Fish Audio gagal:", response.status, detail.slice(0, 500));
      return NextResponse.json(
        { message: `Fish Audio gagal (${response.status}).` },
        { status: 502 }
      );
    }

    const audio = await response.arrayBuffer();

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[/api/tts] Request Fish Audio gagal:", error);
    return NextResponse.json(
      { message: "Tidak bisa menghubungi Fish Audio." },
      { status: 502 }
    );
  }
}
