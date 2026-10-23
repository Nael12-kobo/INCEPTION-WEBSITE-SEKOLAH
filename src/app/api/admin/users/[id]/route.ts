import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  requireAdmin,
  canEditUser,
  canChangeRole,
  canDeleteUser,
  isUserRole,
  UserRole,
} from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { EMAIL_RE } from "@/lib/ppdb";

/** PATCH — edit data user (nama/email/role sesuai permission). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { name, email, role } = body ?? {};

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot edit your own account" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canEditUser(session.user.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Forbidden: Cannot edit this user" },
        { status: 403 }
      );
    }

    // S9/C7: validasi & normalisasi sebelum menulis — email wajib format
    // valid dan diseragamkan huruf kecil (semua lookup login/reset memakai
    // lowercase, email `SOME@Example.COM` = akun yang tak bisa login lagi),
    // nama ≥ 2 karakter (C13, seragam dengan register & account).
    const updateData: { name?: string; email?: string; role?: UserRole } = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim() || name.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama minimal 2 karakter.", errors: { name: "Nama minimal 2 karakter." } },
          { status: 400 }
        );
      }
      if (name.trim().length > 100) {
        return NextResponse.json(
          { error: "Nama maksimal 100 karakter.", errors: { name: "Nama maksimal 100 karakter." } },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (email !== undefined) {
      const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
      if (!EMAIL_RE.test(normalized)) {
        return NextResponse.json(
          { error: "Format email tidak valid.", errors: { email: "Format email tidak valid." } },
          { status: 400 }
        );
      }
      updateData.email = normalized;
    }

    const roleChanged = role !== undefined && role !== targetUser.role;
    if (roleChanged) {
      if (!isUserRole(role) || !canChangeRole(session.user.role, targetUser.role, role)) {
        return NextResponse.json(
          { error: "Forbidden: Only Super Admin can change roles" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    // C7: tidak ada field yang berubah → 400, bukan memanggil update({}).
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan untuk disimpan." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      action: roleChanged ? AUDIT_ACTIONS.USER_ROLE_CHANGED : AUDIT_ACTIONS.USER_UPDATED,
      targetType: "USER",
      targetId: userId,
      detail: roleChanged
        ? `Role ${updatedUser.email ?? userId}: ${targetUser.role} → ${role}`
        : `Mengubah data user ${updatedUser.email ?? userId}`,
      meta: roleChanged ? { oldRole: targetUser.role, newRole: role } : { name, email },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    // C7: email duplikat → 409 (bukan 500).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "Email sudah dipakai akun lain.",
          errors: { email: "Email sudah dipakai akun lain." },
        },
        { status: 409 }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Error editing user:", error);
    return NextResponse.json({ error: "Failed to edit user" }, { status: 500 });
  }
}

/** DELETE — hapus user (Super Admin only). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: userId } = await params;

    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canDeleteUser(session.user.role, targetUser.role)) {
      return NextResponse.json(
        { error: "Forbidden: Only Super Admin can delete users" },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.USER_DELETED,
      targetType: "USER",
      targetId: userId,
      detail: `Menghapus user ${targetUser.role === "ADMIN" ? "ADMIN" : "USER"} ${userId}`,
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
