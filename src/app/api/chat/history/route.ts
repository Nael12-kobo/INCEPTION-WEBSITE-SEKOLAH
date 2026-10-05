import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/chat/history — daftar conversation milik user login.
 * Guest → 401 (client fallback ke localStorage).
 */
export async function GET() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Belum login." }, { status: 401 });
  }
  try {
    const rows = await prisma.chatConversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, updatedAt: true },
    });
    return NextResponse.json({ conversations: rows });
  } catch (error) {
    console.error("[/api/chat/history] GET gagal:", error);
    return NextResponse.json({ message: "Gagal memuat histori." }, { status: 500 });
  }
}

/**
 * POST /api/chat/history — ambil satu conversation + messages.
 * Body: { id }
 */
export async function POST(request: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Belum login." }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ message: "id wajib diisi." }, { status: 400 });
  }
  try {
    const row = await prisma.chatConversation.findFirst({
      where: { id: body.id, userId: session.user.id },
    });
    if (!row) return NextResponse.json({ message: "Tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ conversation: row });
  } catch (error) {
    console.error("[/api/chat/history] POST gagal:", error);
    return NextResponse.json({ message: "Gagal memuat percakapan." }, { status: 500 });
  }
}

/**
 * DELETE /api/chat/history — hapus satu conversation milik user login.
 * Body: { id }
 *
 * `deleteMany` ikut menyaring userId, jadi walau id dipalsukan tetap tidak
 * bisa menghapus riwayat orang lain (anti IDOR).
 */
export async function DELETE(request: Request) {
  const session = await auth().catch(() => null);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Belum login." }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ message: "id wajib diisi." }, { status: 400 });
  }
  try {
    const deleted = await prisma.chatConversation.deleteMany({
      where: { id: body.id, userId: session.user.id },
    });
    if (deleted.count === 0) {
      return NextResponse.json({ message: "Tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[/api/chat/history] DELETE gagal:", error);
    return NextResponse.json(
      { message: "Gagal menghapus percakapan." },
      { status: 500 }
    );
  }
}
