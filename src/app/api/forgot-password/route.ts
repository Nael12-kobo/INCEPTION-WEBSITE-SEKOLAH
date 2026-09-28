import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/reset-email";

/**
 * Endpoint "lupa kata sandi".
 *
 * Kontrak dengan ForgotPasswordForm:
 * - SELALU 200 (sukses maupun email tak terdaftar) → mencegah user
 *   enumeration (pelaku tidak bisa membedakan email terdaftar/ tidak).
 * - 400 hanya bila payload rusak.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const email = (payload as { email?: string })?.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { message: "Email wajib diisi." },
      { status: 400 }
    );
  }

  const genericMessage =
    "Jika email terdaftar, tautan reset kata sandi telah dikirim. Periksa kotak masuk Anda.";

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = await createResetToken(email);

      // Bangun URL dasar dari header proxy (jika ada) atau origin request.
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      const proto = request.headers.get("x-forwarded-proto") ?? "http";
      const base = process.env.NEXTAUTH_URL ?? (host ? `${proto}://${host}` : new URL(request.url).origin);

      const resetUrl = `${base.replace(/\/$/, "")}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

      const sent = await sendPasswordResetEmail(email, resetUrl);
      if (!sent) {
        // Fallback dev: tampilkan link di terminal server.
        console.warn(`[reset-password] Email gagal dikirim. Link reset untuk ${email}:\n${resetUrl}`);
      }
    }
  } catch (error) {
    // Tetap 200 — jangan bocorkan kondisi internal ke caller.
    console.error("Gagal memproses forgot-password:", error);
  }

  return NextResponse.json({ ok: true, message: genericMessage });
}
