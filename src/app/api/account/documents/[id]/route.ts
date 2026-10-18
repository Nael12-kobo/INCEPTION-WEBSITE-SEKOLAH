import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Satu berkas PPDB milik siswa yang sedang login.
 *
 * GET    — tampilkan isi berkas (pratinjau di tab baru).
 * DELETE — hapus berkas (mis. salah unggah); siswa boleh mengunggah ulang.
 */

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const document = await prisma.ppdbDocument.findFirst({
    where: { id, userId: session.user.id },
    select: { bytes: true, mime: true },
  });

  if (!document) {
    return NextResponse.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(document.bytes), {
    headers: {
      "Content-Type": document.mime,
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const document = await prisma.ppdbDocument.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!document) {
    return NextResponse.json({ message: "Berkas tidak ditemukan." }, { status: 404 });
  }

  await prisma.ppdbDocument.delete({ where: { id: document.id } });
  return NextResponse.json({ ok: true });
}
