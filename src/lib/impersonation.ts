import { encode, decode } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

/**
 * Helper sesi untuk fitur "Masuk sebagai user lain" (impersonasi admin).
 *
 * Cara kerja: menerbitkan token JWT yang sama persis dengan yang diterbitkan
 * Auth.js untuk akun target, plus klaim `impersonatorId` (id admin asli).
 * Callback `jwt` di auth.ts men-sinkronkan role dari DB untuk SEMUA token,
 * sehingga token hasil "tempelan" ini selalu mendapat data segar dan otomatis
 * hangus bila akun target dihapus.
 *
 * Server-only — jangan diimpor dari komponen client.
 */

/** Nama cookie sesi mengikuti konvensi Auth.js (lib/utils/cookie.js). */
export function sessionCookieName(): string {
  // useSecureCookies Auth.js default = NODE_ENV production (https).
  return process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET belum diset — sesi tidak bisa diterbitkan.");
  }
  return secret;
}

/** Terbitkan token sesi untuk `userId` (dengan `impersonatorId` opsional). */
export async function mintSessionToken(params: {
  userId: string;
  role: string;
  impersonatorId?: string;
}): Promise<string> {
  const token: JWT = {
    sub: params.userId,
    role: params.role,
    // 0 → memaksa callback jwt menyinkronkan role dari DB segera.
    roleSyncedAt: 0,
    ...(params.impersonatorId ? { impersonatorId: params.impersonatorId } : {}),
  };
  return encode({ token, secret: authSecret(), salt: sessionCookieName() });
}

/** Baca & decode token sesi dari request masuk; null bila tidak ada/rusak. */
export async function readSessionPayload(request: Request): Promise<JWT | null> {
  const name = sessionCookieName();
  const header = request.headers.get("cookie") ?? "";
  const pair = header.split(/;\s*/).find((c) => c.startsWith(`${name}=`));
  if (!pair) return null;
  const raw = decodeURIComponent(pair.slice(name.length + 1));
  if (!raw) return null;
  try {
    return await decode({ token: raw, secret: authSecret(), salt: name });
  } catch {
    return null;
  }
}
