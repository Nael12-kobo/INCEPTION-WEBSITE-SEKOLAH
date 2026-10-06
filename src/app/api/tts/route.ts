import { NextResponse } from "next/server";
import { FishAudioClient, RealtimeEvents } from "fish-audio";
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
    return NextResponse.json(
      { message: "Teks TTS kosong setelah normalisasi." },
      { status: 400 }
    );
  }

  const isExcited =
    text.includes("!") ||
    /\b(wah|mantap|keren|bagus|selamat|senang|yuk|ayo|tertarik)\b/i.test(text);
  const direction = isExcited
    ? "[cheerful][excited]"
    : "[warm][cheerful]";
  const speechText = `${direction} ${text}`;
  const fish = new FishAudioClient({ apiKey });
  const textStream = (async function* () {
    yield speechText.slice(0, 5000);
  })();

  try {
    const connection = await fish.textToSpeech.convertRealtime(
      {
        text: "",
        reference_id: referenceId,
        chunk_length: 100,
        normalize: false,
        format: "mp3",
        sample_rate: 44100,
        latency: "balanced",
        temperature: 0.6,
        top_p: 0.8,
        prosody: {
          speed: 1.1,
          volume: 1.08,
        },
      },
      textStream,
      model as never
    );

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let closed = false;

        const close = () => {
          if (closed) return;
          closed = true;
          try {
            controller.close();
          } catch {
            /* stream sudah ditutup */
          }
        };

        const onAudio = (audio: unknown) => {
          if (closed) return;
          let bytes: Uint8Array | null = null;
          if (audio instanceof Uint8Array) {
            bytes = audio;
          } else if (typeof Buffer !== "undefined" && Buffer.isBuffer(audio)) {
            bytes = new Uint8Array(audio.buffer, audio.byteOffset, audio.byteLength);
          }
          if (bytes?.byteLength) {
            controller.enqueue(bytes);
          }
        };

        const onError = (error: unknown) => {
          if (closed) return;
          closed = true;
          console.error("[/api/tts] Fish Audio WebSocket error:", error);
          try {
            controller.error(
              error instanceof Error ? error : new Error("Fish Audio streaming error")
            );
          } catch {
            /* stream sudah ditutup */
          }
        };

        connection.on(RealtimeEvents.AUDIO_CHUNK, onAudio);
        connection.on(RealtimeEvents.ERROR, onError);
        connection.on(RealtimeEvents.CLOSE, close);

        request.signal.addEventListener(
          "abort",
          () => {
            try {
              connection.close();
            } catch {
              /* abaikan */
            }
            close();
          },
          { once: true }
        );
      },
      cancel() {
        try {
          connection.close();
        } catch {
          /* abaikan */
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("[/api/tts] Request Fish Audio gagal:", error);
    return NextResponse.json(
      { message: "Tidak bisa memulai streaming Fish Audio." },
      { status: 502 }
    );
  }
}
