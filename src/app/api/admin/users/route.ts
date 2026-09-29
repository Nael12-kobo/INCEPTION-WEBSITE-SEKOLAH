import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import {
  requireAdmin,
  hasPermission,
  isUserRole,
  canChangeRole,
  getAccessibleRoles,
  UserRole,
} from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { EMAIL_RE } from "@/lib/ppdb";

/** GET — daftar semua user (Admin & Super Admin). */
export async function GET() {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users,
      accessibleRoles: getAccessibleRoles(session.user.role),
      currentUserRole: session.user.role,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

/**
 * POST — tambah user baru (Admin & Super Admin).
 * - Admin hanya boleh membuat akun USER.
 * - Super Admin boleh membuat USER & ADMIN (SUPER_ADMIN dilarang lewat form
 *   demi keamanan; role itu hanya lewat ubah role).
 */
export async function POST(request: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.user.role, "admin.users.create")) {
    return NextResponse.json(
      { error: "Forbidden: Anda tidak punya izin menambah user" },
      { status: 403 }
    );
  }

  let body: {
    name?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role : UserRole.USER;

  const fieldErrors: Record<string, string> = {};
  if (name.length < 3) fieldErrors.name = "Nama minimal 3 karakter.";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Format email tidak valid.";
  if (password.length < 8) {
    fieldErrors.password = "Password minimal 8 karakter.";
  } else if (password.length > 72) {
    fieldErrors.password = "Password maksimal 72 karakter.";
  }
  if (!isUserRole(role)) {
    fieldErrors.role = "Role tidak valid.";
  } else if (role === UserRole.SUPER_ADMIN) {
    fieldErrors.role = "Akun SUPER_ADMIN tidak dapat dibuat dari sini.";
  }

  if (role === UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN) {
    fieldErrors.role = "Hanya Super Admin dapat membuat akun ADMIN.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ errors: fieldErrors }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role as UserRole,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.USER_CREATED,
      targetType: "USER",
      targetId: user.id,
      detail: `Menambahkan user baru ${user.email} dengan role ${user.role}`,
      meta: { newRole: user.role },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { errors: { email: "Email sudah terdaftar." } },
        { status: 409 }
      );
    }
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

/** PUT — ubah role user (Super Admin only). */
export async function PUT(request: NextRequest) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, newRole } = body;

    if (!userId || !newRole) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!isUserRole(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canChangeRole(session.user.role, targetUser.role, newRole as UserRole)) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can change roles" },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      targetType: "USER",
      targetId: userId,
      detail: `Role ${updatedUser.email ?? userId}: ${targetUser.role} → ${newRole}`,
      meta: { oldRole: targetUser.role, newRole },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
