import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Token reset password.
 *
 * Desain keamanan:
 * - Token acak 32 byte (base64url) → dikirim ke email user (public).
 * - Yang disimpan di DB hanya hash SHA-256-nya, jadi bocor DB ≠ bocor token.
 * - Kadaluarsa 1 jam, sekali pakai: setelah dipakai/di-request ulang, token
 *   lama dihapus.
 *
 * Model VerificationToken (kontrak Auth.js) dipakai ulang:
 *   identifier = email, token = hash, expires = kadaluarsa.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 jam

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Buat token reset untuk email; menghapus token lama user tsb. */
export async function createResetToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  const token = hashToken(raw);

  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  return raw;
}

/** Validasi token reset: cocok + belum kadaluarsa. */
export async function verifyResetToken(
  email: string,
  rawToken: string
): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({
    where: {
      identifier_token: { identifier: email, token: hashToken(rawToken) },
    },
  });
  if (!record) return false;
  return record.expires > new Date();
}

/** Hapus token setelah dipakai (sekali pakai). */
export async function consumeResetToken(
  email: string,
  rawToken: string
): Promise<void> {
  await prisma.verificationToken.deleteMany({
    where: { identifier: email, token: hashToken(rawToken) },
  });
}
