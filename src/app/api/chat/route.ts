import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { askGemini } from "@/lib/gemini";

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
 * POST /api/chat
 * Body: { messages: [{role, content}], conversationId?: string }
 * - Guest (belum login): tidak disimpan ke DB, hanya balasan Gemini.
 * - Login: conversation dibuat / dilanjutkan di chat_conversations (Supabase via Prisma).
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
          content: m.content.trim().slice(0, 4000),
        }))
    : [];

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return NextResponse.json(
      { message: "Kirim minimal satu pesan user." },
      { status: 400 }
    );
  }

  let reply: string;
  try {
    reply = await askGemini(messages);
  } catch (error) {
    console.error("[/api/chat] Gemini gagal:", error);
    const msg =
      error instanceof Error && error.message.includes("GEMINI_API_KEY")
        ? "Layanan AI belum dikonfigurasi (GEMINI_API_KEY kosong). Hubungi admin."
        : "Maaf, asisten AI sedang sibuk. Coba lagi sebentar ya.";
    return NextResponse.json({ message: msg }, { status: 502 });
  }

  const session = await auth().catch(() => null);
  const userId = session?.user?.id;

  // Guest → tanpa penyimpanan.
  if (!userId) {
    return NextResponse.json({ reply, conversationId: null, stored: false });
  }

  const now = new Date().toISOString();
  const fullThread = [
    ...messages.map((m) => ({ ...m, createdAt: now })),
    { role: "assistant" as const, content: reply, createdAt: now },
  ];

  try {
    if (body.conversationId) {
      const existing = await prisma.chatConversation.findFirst({
        where: { id: body.conversationId, userId },
      });
      if (existing) {
        const prev = Array.isArray(existing.messages)
          ? (existing.messages as { role: string; content: string; createdAt?: string }[])
          : [];
        const merged = [...prev, ...fullThread].slice(-100);
        const updated = await prisma.chatConversation.update({
          where: { id: existing.id },
          data: { messages: merged, updatedAt: new Date() },
        });
        return NextResponse.json({
          reply,
          conversationId: updated.id,
          stored: true,
        });
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
    return NextResponse.json({
      reply,
      conversationId: created.id,
      stored: true,
    });
  } catch (error) {
    // DB gagal → tetap kembalikan balasan agar UX tidak rusak.
    console.error("[/api/chat] Gagal menyimpan histori:", error);
    return NextResponse.json({
      reply,
      conversationId: body.conversationId ?? null,
      stored: false,
    });
  }
}
