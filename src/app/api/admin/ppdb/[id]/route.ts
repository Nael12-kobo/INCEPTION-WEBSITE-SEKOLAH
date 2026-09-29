import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canManagePpdb } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

const VALID_STATUSES = ["PENDING", "CONTACTED", "REGISTERED", "REJECTED"] as const;

/** PATCH — update status PPDB (Admin & Super Admin, semua pendaftaran). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;
    const { id: registrationId } = await params;

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const registration = await prisma.ppdbRegistration.findUnique({
      where: { id: registrationId },
      select: { id: true, status: true, registrationNo: true, fullName: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const updatedRegistration = await prisma.ppdbRegistration.update({
      where: { id: registrationId },
      data: { status },
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
        status: true,
      },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.PPDB_STATUS_UPDATED,
      targetType: "PPDB",
      targetId: registrationId,
      detail: `Status ${registration.registrationNo} (${registration.fullName}): ${registration.status} → ${status}`,
      meta: { oldStatus: registration.status, newStatus: status },
    });

    return NextResponse.json({ registration: updatedRegistration });
  } catch (error) {
    console.error("Error updating PPDB status:", error);
    return NextResponse.json({ error: "Failed to update PPDB status" }, { status: 500 });
  }
}

/** DELETE — hapus pendaftaran PPDB (Admin & Super Admin). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: registrationId } = await params;

    const registration = await prisma.ppdbRegistration.findUnique({
      where: { id: registrationId },
      select: { id: true, registrationNo: true, fullName: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    await prisma.ppdbRegistration.delete({
      where: { id: registrationId },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.PPDB_DELETED,
      targetType: "PPDB",
      targetId: registrationId,
      detail: `Menghapus pendaftaran ${registration.registrationNo} (${registration.fullName})`,
    });

    return NextResponse.json({ message: "Registration deleted successfully" });
  } catch (error) {
    console.error("Error deleting PPDB registration:", error);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}
