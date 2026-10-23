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
const SECURE_COOKIE = "__Secure-authjs.session-token";
const PLAIN_COOKIE = "authjs.session-token";

/**
 * Apakah Auth.js memakai cookie ber-prefix `__Secure-`?
 *
 * Auth.js menurunkannya dari protokol request aktif (x-forwarded-proto /
 * AUTH_URL — lihat @auth/core createActionURL + defaultCookies), BUKAN dari
 * NODE_ENV. Kita tiru aturan yang sama dari request yang sedang dilayani
 * supaya nama cookie & flag `secure` tidak divergen dengan yang dibaca
 * Auth.js (C15).
 */
function wantsSecureCookie(request?: Request): boolean {
  if (request) {
    const envUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;
    if (envUrl) {
      try {
        return new URL(envUrl).protocol === "https:";
      } catch {
        /* env rusak → jatuh ke aturan proto request */
      }
    }
    // Default Auth.js kalau header kosong = "https".
    const proto = (
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https"
    ).replace(/:$/, "");
    return proto === "https";
  }
  return process.env.NODE_ENV === "production";
}

/**
 * Nama cookie sesi untuk `request` ini.
 *
 * Urutan: bila request sudah membawa satu dari kedua nama cookie, pakai yang
 * ada (bukti nyata nama yang dipakai Auth.js untuk membaca sesi ini);
 * selain itu ikuti aturan proto seperti Auth.js; NODE_ENV hanya fallback
 * terakhir saat tidak ada request.
 */
export function sessionCookieName(request?: Request): string {
  if (request) {
    const header = request.headers.get("cookie") ?? "";
    const pairs = header.split(/;\s*/);
    const securePresent = pairs.some((c) => c.startsWith(`${SECURE_COOKIE}=`));
    const plainPresent = pairs.some((c) => c.startsWith(`${PLAIN_COOKIE}=`));
    const derived = wantsSecureCookie(request) ? SECURE_COOKIE : PLAIN_COOKIE;
    if (derived === SECURE_COOKIE && !securePresent && plainPresent) {
      return PLAIN_COOKIE;
    }
    if (derived === PLAIN_COOKIE && !plainPresent && securePresent) {
      return SECURE_COOKIE;
    }
    return derived;
  }
  return process.env.NODE_ENV === "production" ? SECURE_COOKIE : PLAIN_COOKIE;
}

export function sessionCookieOptions(request?: Request) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: sessionCookieName(request).startsWith("__Secure-"),
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
  /** Snapshot nama & email akun target — klaim `name`/`email` di JWT (S12)
   *  dipakai Auth.js untuk session.user.name/email (audit & header UI). */
  name?: string | null;
  email?: string | null;
  impersonatorId?: string;
  /** Salt JWT = nama cookie sesi; isi dari request agar cocok dengan Auth.js. */
  cookieName?: string;
}): Promise<string> {
  const cookieName = params.cookieName ?? sessionCookieName();
  const token: JWT = {
    sub: params.userId,
    role: params.role,
    ...(params.name ? { name: params.name } : {}),
    ...(params.email ? { email: params.email } : {}),
    // 0 → memaksa callback jwt menyinkronkan role dari DB segera.
    roleSyncedAt: 0,
    ...(params.impersonatorId ? { impersonatorId: params.impersonatorId } : {}),
  };
  return encode({ token, secret: authSecret(), salt: cookieName });
}

/** Baca & decode token sesi dari request masuk; null bila tidak ada/rusak. */
export async function readSessionPayload(request: Request): Promise<JWT | null> {
  const name = sessionCookieName(request);
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
