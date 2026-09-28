import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken, verifyResetToken, consumeResetToken } from "@/lib/reset-token";

/**
 * Endpoint reset password (set kata sandi baru).
 *
 * Kontrak dengan ResetPasswordForm:
 * - 200 → sukses, token dipakai (sekali pakai)
 * - 400 → payload tidak valid
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

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email: record.identifier },
      data: { passwordHash },
    });
    await consumeResetToken(record.identifier, token);
  } catch (error) {
    console.error("Gagal mereset kata sandi:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
