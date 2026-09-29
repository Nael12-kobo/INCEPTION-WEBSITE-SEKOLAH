import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  UserRole,
  canChangeRole,
  getAccessibleRoles,
  isUserRole,
} from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";

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
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
