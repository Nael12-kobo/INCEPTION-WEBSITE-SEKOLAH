import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

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

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
      },
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
