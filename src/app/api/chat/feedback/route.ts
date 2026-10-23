import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimitAsync } from "@/lib/rate-limit";

/**
 * POST /api/chat/feedback
 * Body: { messageId, question, answer, rating: "UP"|"DOWN", comment? }
 *
 * Rating 👍/👎 per jawaban AI. Boleh dari user login maupun guest
 * (guest rate-limited per IP; duplikat dicegah unique (messageId, ip)).
 * Hasilnya dibaca admin di /admin/chat untuk menilai & memperbaiki AI.
 */
export async function POST(request: Request) {
  let body: {
    messageId?: unknown;
    question?: unknown;
    answer?: unknown;
    rating?: unknown;
    comment?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const messageId = typeof body.messageId === "string" ? body.messageId.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  const rating = body.rating === "UP" ? "UP" : body.rating === "DOWN" ? "DOWN" : null;
  const comment =
    typeof body.comment === "string" && body.comment.trim()
      ? body.comment.trim().slice(0, 500)
      : null;

  if (!messageId || messageId.length > 100 || !rating || !question || !answer) {
    return NextResponse.json(
      { message: "Data feedback tidak lengkap." },
      { status: 400 }
    );
  }

  // Tameng spam: 10 feedback / menit / IP — cukup longgar untuk user
  // wajar, memblokir script yang menembak tabel berkali-kali.
  const ip = clientIp(request);
  const rl = await rateLimitAsync(`feedback:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { message: "Terlalu banyak feedback. Tunggu sebentar ya." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const session = await auth().catch(() => null);
  const userId = session?.user?.id ?? null;

  try {
    const row = await prisma.chatFeedback.create({
      data: {
        userId,
        messageId,
        question: question.slice(0, 500),
        answer: answer.slice(0, 2000),
        rating,
        comment,
        ip,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    // Unique violation (messageId + ip sudah pernah vote) → bukan error fatal.
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json(
        { ok: false, message: "Sudah pernah dinilai." },
        { status: 409 }
      );
    }
    console.error("[/api/chat/feedback] Gagal menyimpan:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan feedback." },
      { status: 500 }
    );
  }
}
