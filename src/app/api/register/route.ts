import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { EMAIL_RE } from "@/lib/ppdb";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Endpoint pendaftaran akun — tersambung ke PostgreSQL via Prisma.
 *
 * Kontrak dengan RegisterForm:
 * - 201 → sukses
 * - 4xx/5xx → tampilkan `message` sebagai inline error
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, password } = (payload ?? {}) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password) {
    return NextResponse.json(
      { message: "name, email, dan password wajib diisi." },
      { status: 400 }
    );
  }

  // Validasi konsisten dengan reset-password & account (password 8–72).
  // Sebelumnya register menerima password 1 karakter dan email apa pun,
  // padahal endpoint reset/reset-password mensyaratkan >= 8.
  if (!EMAIL_RE.test(trimmedEmail)) {
    return NextResponse.json(
      { message: "Format email tidak valid." },
      { status: 400 }
    );
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { message: "Password harus 8–72 karakter." },
      { status: 400 }
    );
  }
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return NextResponse.json(
      { message: "Nama harus 2–100 karakter." },
      { status: 400 }
    );
  }

  // Rate limit per IP — mencegah pembuatan akun massal.
  const rl = rateLimit(`register:${clientIp(request)}`, {
    limit: 5,
    windowMs: 3_600_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { message: "Terlalu banyak percobaan pendaftaran. Coba lagi nanti." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const created = await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        role: UserRole.USER, // Default role for new registrations
      },
    });
    await logAudit({
      actorId: created.id,
      actorEmail: created.email,
      action: AUDIT_ACTIONS.ACCOUNT_REGISTERED,
      targetType: "USER",
      targetId: created.id,
      detail: `Akun baru mendaftar mandiri: ${created.email}`,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }
    console.error("Gagal membuat user:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
