import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import {
  PPDB_DOC_META,
  PPDB_DOC_MAX_BYTES,
  PPDB_DOC_MAX_PER_KIND,
  isPpdbDocKind,
} from "@/lib/ppdb-documents";

/**
 * Berkas kelengkapan PPDB milik akun yang sedang login.
 *
 * POST — unggah satu file (multipart: "file" + "kind"). Gambar dikompres di
 *        browser; server tetap memvalidasi ukuran & tipe dari magic number.
 *
 * Berkas disimpan di tabel ppdb_documents (bytea) dan hanya bisa dibaca
 * lewat endpoint ber-sesi (siswa sendiri / admin).
 */

/** Deteksi tipe dari magic number — jangan percaya MIME dari klien. */
function sniffMime(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return "image/webp";
  }
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d // -
  ) {
    return "application/pdf";
  }
  return null;
}

/** Nama file aman untuk disimpan & ditampilkan (tanpa path/kontrol). */
function safeFileName(name: string, fallbackExt: string): string {
  const cleaned = name.replace(/[\\/\u0000-\u001f\u007f]+/g, "-").trim();
  return cleaned.length > 0 ? cleaned.slice(0, 120) : `berkas.${fallbackExt}`;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Format unggahan tidak valid." },
      { status: 400 }
    );
  }

  const kind = form.get("kind");
  if (!isPpdbDocKind(kind)) {
    return NextResponse.json(
      { message: "Jenis berkas tidak dikenal." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "File tidak ditemukan pada unggahan." },
      { status: 400 }
    );
  }
  if (file.size <= 0) {
    return NextResponse.json({ message: "File kosong." }, { status: 400 });
  }
  if (file.size > PPDB_DOC_MAX_BYTES) {
    return NextResponse.json(
      { message: "Ukuran file maksimal 5 MB." },
      { status: 400 }
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffMime(bytes);
    if (!mime) {
      return NextResponse.json(
        { message: "File harus berupa gambar JPG/PNG/WebP atau PDF." },
        { status: 400 }
      );
    }

    const currentCount = await prisma.ppdbDocument.count({
      where: { userId: session.user.id, kind },
    });
    if (currentCount >= PPDB_DOC_MAX_PER_KIND) {
      return NextResponse.json(
        {
          message: `Maksimal ${PPDB_DOC_MAX_PER_KIND} file per jenis berkas. Hapus file lama terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    const extension = mime === "application/pdf" ? "pdf" : "jpg";
    const fileName = safeFileName(file.name, extension);

    const document = await prisma.ppdbDocument.create({
      data: {
        userId: session.user.id,
        kind,
        fileName,
        mime,
        size: bytes.length,
        bytes: Buffer.from(bytes),
      },
      select: {
        id: true,
        kind: true,
        fileName: true,
        mime: true,
        size: true,
        createdAt: true,
      },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: AUDIT_ACTIONS.DOCUMENT_UPLOADED,
      targetType: "PPDB",
      targetId: document.id,
      detail: `Mengunggah berkas ${PPDB_DOC_META[kind].label}: ${fileName} (${Math.max(
        1,
        Math.round(bytes.length / 1024)
      )} KB)`,
    });

    return NextResponse.json({
      ok: true,
      document: {
        ...document,
        createdAt: document.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error uploading PPDB document:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan berkas. Coba lagi." },
      { status: 500 }
    );
  }
}
