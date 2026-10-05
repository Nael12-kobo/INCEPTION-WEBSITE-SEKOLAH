import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken } from "@/lib/reset-token";
import { sendPasswordResetEmail } from "@/lib/reset-email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Bangun URL dasar aplikasi TANPA mempercayai header host secara buta.
 *
 * Kenapa: kalau base dibentuk dari `x-forwarded-host`/`host`, penyerang
 * bisa mengirim `Host: domain-jahat` → link reset (yang berisi token)
 * dikirim menuju domain milik penyerang (host-header poisoning).
 *
 * Urutan kepercayaan:
 * 1. env eksplisit (NEXT_PUBLIC_APP_URL / AUTH_URL / NEXTAUTH_URL)
 * 2. origin request bila hostname-nya localhost (mode pengembangan)
 * 3. allowlist hostname deployment (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL)
 * 4. fallback: URL produksi resmi, baru terakhir origin request
 */
function resolveBaseUrl(request: Request): string {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  let origin = "";
  try {
    origin = new URL(request.url).origin;
  } catch {
    /* abaikan — jatuh ke fallback */
  }

  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (isLocalhost) return origin;

  const allowed = new Set<string>();
  for (const host of [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ]) {
    if (host) {
      allowed.add(`https://${host}`);
      allowed.add(`http://${host}`);
    }
  }
  if (origin && allowed.has(origin)) return origin;

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  return origin || "http://localhost:3000";
}

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

  // Endpoint ini memicu email keluar → batasi per IP agar tidak dipakai
  // untuk spam relay (5x / 15 menit).
  const rl = rateLimit(`forgot:${clientIp(request)}`, {
    limit: 5,
    windowMs: 900_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        message:
          "Terlalu banyak permintaan reset kata sandi. Coba lagi beberapa menit lagi.",
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const rawToken = await createResetToken(email);
      const base = resolveBaseUrl(request);
      const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

      const sent = await sendPasswordResetEmail(email, resetUrl);
      if (!sent) {
        // JANGAN cetak resetUrl — isinya token reset yang masih berlaku,
        // dan log server bisa dibaca pihak lain.
        console.warn(
          `[reset-password] Email gagal dikirim ke ${email} (link reset tidak dicetak ke log).`
        );
      }
    }
  } catch (error) {
    // Tetap 200 — jangan bocorkan kondisi internal ke caller.
    console.error("Gagal memproses forgot-password:", error);
  }

  return NextResponse.json({ ok: true, message: genericMessage });
}
