import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { EMAIL_RE } from "@/lib/ppdb";
import { rateLimit, resetRateLimit } from "@/lib/rate-limit";

/**
 * Endpoint akun sendiri (user yang sedang login).
 *
 * PATCH  — ubah nama/email sendiri (email baru wajib konfirmasi password).
 * PUT    — ganti kata sandi sendiri (wajib password lama).
 */

/**
 * Guard verifikasi kata sandi (S10): bcrypt cost 12 per percobaan → wajib
 * dibatasi rate limit, kalau tidak endpoint ini jadi oracle brute-force.
 * Key per user id; percobaan berhasil melepas hitungan.
 */
function verifyCurrentPasswordRate(userId: string) {
  return rateLimit(`account:pw:${userId}`, { limit: 5, windowMs: 5 * 60_000 });
}

function tooManyAttempts(retryAfterSec: number): NextResponse {
  const message =
    "Terlalu banyak percobaan konfirmasi kata sandi. Tunggu beberapa menit lalu coba lagi.";
  return NextResponse.json(
    {
      message,
      errors: { currentPassword: message },
      retryAfterSec,
    },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });
  return user;
}

/** PATCH — perbarui profil sendiri. */
export async function PATCH(request: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." },{ status: 401 });
  }

  let body: { name?: unknown; email?: unknown; currentPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";

  const fieldErrors: Record<string, string> = {};
  // C13: ambang nama seragam (≥2) dengan register & admin/users.
  if (name !== undefined && name.length < 2) {
    fieldErrors.name = "Nama minimal 2 karakter.";
  }

  let emailChanged = false;
  if (email !== undefined && email !== user.email) {
    if (!EMAIL_RE.test(email)) {
      fieldErrors.email = "Format email tidak valid.";
    } else if (!user.passwordHash) {
      // S5: akun OAuth tanpa kata sandi TIDAK boleh mengganti email hanya
      // dengan sesi — sesi curian bisa mengalihkan email akun diam-diam.
      // Wajib set kata sandi dulu (menu Keamanan Akun, form memang
      // membolehkannya untuk akun OAuth), baru email boleh diganti.
      fieldErrors.email =
        "Akun Anda belum memiliki kata sandi. Atur kata sandi dulu di menu Keamanan Akun, lalu ulangi perubahan email.";
    } else if (!currentPassword) {
      fieldErrors.currentPassword =
        "Konfirmasi kata sandi saat ini untuk mengubah email.";
    } else {
      const rl = verifyCurrentPasswordRate(user.id);
      if (!rl.ok) return tooManyAttempts(rl.retryAfterSec);
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (valid) {
        resetRateLimit(`account:pw:${user.id}`);
      } else {
        fieldErrors.currentPassword = "Kata sandi saat ini salah.";
      }
    }
    emailChanged = true;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  const data: { name?: string; email?: string } = {};
  if (name !== undefined) data.name = name;
  if (emailChanged && email) data.email = email;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ message: "Tidak ada perubahan." }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, name: true, email: true, role: true },
    });

    await logAudit({
      actorId: user.id,
      actorEmail: updated.email,
      action: AUDIT_ACTIONS.ACCOUNT_PROFILE_UPDATED,
      targetType: "USER",
      targetId: user.id,
      detail: emailChanged
        ? `Memperbarui profil sendiri (email diganti ke ${updated.email})`
        : "Memperbarui profil sendiri",
      meta: emailChanged ? { emailChanged: true } : null,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { errors: { email: "Email sudah dipakai akun lain." } },
        { status: 409 }
      );
    }
    console.error("Error updating own profile:", error);
    return NextResponse.json({ message: "Gagal memperbarui profil." }, { status: 500 });
  }
}

/** PUT — ganti kata sandi sendiri. */
export async function PUT(request: NextRequest) {
  const user = await requireSession();
  if (!user) {
    return NextResponse.json({ message: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const currentPassword =
    typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  const fieldErrors: Record<string, string> = {};
  if (newPassword.length < 8) {
    fieldErrors.newPassword = "Password baru minimal 8 karakter.";
  } else if (newPassword.length > 72) {
    fieldErrors.newPassword = "Password baru maksimal 72 karakter.";
  }

  if (user.passwordHash) {
    if (!currentPassword) {
      fieldErrors.currentPassword = "Masukkan kata sandi saat ini.";
    } else {
      // S10: pembatas laju tebakan kata sandi (bcrypt cost 12 per request).
      const rl = verifyCurrentPasswordRate(user.id);
      if (!rl.ok) return tooManyAttempts(rl.retryAfterSec);
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (valid) {
        resetRateLimit(`account:pw:${user.id}`);
      } else {
        fieldErrors.currentPassword = "Kata sandi saat ini salah.";
      }
    }
  }
  // Catatan: akun OAuth tanpa passwordHash melewati verifikasi password lama
  // karena ini justru proses SET password pertama kali (satu-satunya jalan
  // mereka mengaktifkan login credentials).

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await logAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: AUDIT_ACTIONS.PASSWORD_CHANGED,
      targetType: "USER",
      targetId: user.id,
      detail: "Mengganti kata sandi akun sendiri",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ message: "Gagal mengganti kata sandi." }, { status: 500 });
  }
}
