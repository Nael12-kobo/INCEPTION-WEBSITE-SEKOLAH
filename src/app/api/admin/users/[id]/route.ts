import { NextRequest, NextResponse } from "next/server";
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
    const { name, email, role } = body;

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

    const updateData: { name?: string; email?: string; role?: UserRole } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

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
