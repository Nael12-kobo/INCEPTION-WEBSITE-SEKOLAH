import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

/**
 * Foto siswa (syarat PPDB) untuk akun yang sedang login.
 *
 * POST — unggah/ganti foto (multipart, field "photo"). Foto dikompres di
 *        browser sebelum dikirim; server tetap memvalidasi ukuran & tipe asli.
 * GET  — pratinjau foto sendiri.
 *
 * Foto disimpan langsung di DB (kolom bytea "User.photoBytes") supaya tidak
 * perlu storage eksternal; akses selalu lewat endpoint ber-sesi.
 */

/** Batas ukuran file yang diterima server. */
const MAX_BYTES = 3 * 1024 * 1024;

/** Deteksi tipe gambar dari magic number — jangan percaya MIME dari klien. */
function sniffImageMime(bytes: Uint8Array): string | null {
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
  return null;
}

function extensionOf(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
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

  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "File foto tidak ditemukan pada unggahan." },
      { status: 400 }
    );
  }
  if (file.size <= 0) {
    return NextResponse.json(
      { message: "File foto kosong." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "Ukuran foto maksimal 3 MB." },
      { status: 400 }
    );
  }

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = sniffImageMime(bytes);
    if (!mime) {
      return NextResponse.json(
        { message: "File harus berupa gambar JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    const updatedAt = new Date();
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        photoBytes: Buffer.from(bytes),
        photoMime: mime,
        photoUpdatedAt: updatedAt,
      },
    });

    // Foto diganti → penilaian admin atas pas foto tidak berlaku lagi.
    await prisma.ppdbDocumentReview
      .deleteMany({ where: { userId: session.user.id, kind: "FOTO" } })
      .catch((error) =>
        console.warn("[ppdb] gagal mereset penilaian foto:", error)
      );

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: AUDIT_ACTIONS.PHOTO_UPDATED,
      targetType: "USER",
      targetId: session.user.id,
      detail: `Memperbarui foto siswa (${extensionOf(mime).toUpperCase()}, ${Math.max(
        1,
        Math.round(bytes.length / 1024)
      )} KB)`,
    });

    return NextResponse.json({
      ok: true,
      updatedAt: updatedAt.toISOString(),
      mime,
    });
  } catch (error) {
    console.error("Error uploading student photo:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan foto. Coba lagi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { photoBytes: true, photoMime: true },
  });

  if (!user?.photoBytes) {
    return NextResponse.json({ message: "Belum ada foto." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(user.photoBytes), {
    headers: {
      "Content-Type": user.photoMime ?? "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
