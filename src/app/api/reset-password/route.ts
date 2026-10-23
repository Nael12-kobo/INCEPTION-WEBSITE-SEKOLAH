import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteAllResetTokens, hashToken, verifyResetToken } from "@/lib/reset-token";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

/**
 * Endpoint reset password (set kata sandi baru).
 *
 * Kontrak dengan ResetPasswordForm:
 * - 200 → sukses, token dipakai (sekali pakai)
 * - 400 → payload tidak valid (termasuk akun sudah tidak ada — C9)
 * - 422 → token tidak dikenal / kedaluwarsa
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { token, password } = (payload ?? {}) as {
    token?: string;
    password?: string;
  };

  if (!token || !password) {
    return NextResponse.json(
      { message: "Token dan kata sandi baru wajib diisi." },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { message: "Kata sandi minimal 8 karakter." },
      { status: 400 }
    );
  }
  // C13: batas atas 72 karakter diseragamkan dengan register & account
  // (bcrypt mengabaikan input setelah 72 byte — terima lebih = menipu user).
  if (password.length > 72) {
    return NextResponse.json(
      { message: "Kata sandi maksimal 72 karakter." },
      { status: 400 }
    );
  }

  // Cari token berdasarkan hash-nya (identifier = email pemiliknya).
  const record = await prisma.verificationToken.findFirst({
    where: { token: hashToken(token) },
  });

  if (!record) {
    return NextResponse.json(
      { message: "Tautan reset tidak valid atau sudah digunakan." },
      { status: 422 }
    );
  }

  const valid = await verifyResetToken(record.identifier, token);
  if (!valid) {
    return NextResponse.json(
      { message: "Tautan reset sudah kedaluwarsa. Minta tautan baru." },
      { status: 422 }
    );
  }

  let updated;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    updated = await prisma.user.update({
      where: { email: record.identifier },
      data: { passwordHash },
      select: { id: true },
    });
    // S6: cabut SEMUA token reset untuk email ini — tautan lama yang belum
    // terpakai (mis. link curian) ikut mati setelah kata sandi berganti.
    await deleteAllResetTokens(record.identifier);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // C9: akun sudah dihapus → token tetap dikonsumsi supaya tidak
      // menggantung, dan dilaporkan 400, bukan 500.
      await deleteAllResetTokens(record.identifier).catch(() => {
        /* best-effort */
      });
      return NextResponse.json(
        {
          message: "Akun pada tautan ini sudah tidak ditemukan.",
          error: "Akun pada tautan ini sudah tidak ditemukan.",
        },
        { status: 400 }
      );
    }
    console.error("Gagal mereset kata sandi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }

  // C14: jejak audit untuk perubahan keamanan yang berdampak jauh
  // (seluruh sesi/ kredensial lama efektif mati setelah ini).
  await logAudit({
    actorId: updated.id,
    actorEmail: record.identifier,
    action: AUDIT_ACTIONS.PASSWORD_RESET,
    targetType: "AUTH",
    targetId: updated.id,
    detail: `Kata sandi direset lewat tautan email untuk ${record.identifier} (semua token reset dicabut)`,
  });

  return NextResponse.json({ ok: true });
}
