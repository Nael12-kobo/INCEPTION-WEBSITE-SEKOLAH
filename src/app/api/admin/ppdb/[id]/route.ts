import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canManagePpdb } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

const VALID_STATUSES = ["PENDING", "CONTACTED", "REGISTERED", "REJECTED"] as const;
const VALID_MAJORS = ["DKV", "PPLG", "TJKT", "TKR"] as const;
type PpdbStatus = (typeof VALID_STATUSES)[number];
type PpdbJurusan = (typeof VALID_MAJORS)[number];

interface PpdbPatchInput {
  status?: unknown;
  majorFirst?: unknown;
  majorSecond?: unknown;
  fullName?: unknown;
  email?: unknown;
  notes?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * PATCH — update pendaftaran PPDB.
 * Admin & Super Admin bisa update: status, majorFirst, majorSecond, fullName,
 * email, notes. Setidaknya satu field harus dikirim.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();

  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PpdbPatchInput;
    const { id: registrationId } = await params;

    const existing = await prisma.ppdbRegistration.findUnique({
      where: { id: registrationId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // -------- Validasi & bentuk `data` update ----------------------------
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) {
      if (
        typeof body.status !== "string" ||
        !(VALID_STATUSES as readonly string[]).includes(body.status)
      ) {
        return NextResponse.json(
          { error: "Invalid status. Use: " + VALID_STATUSES.join(", ") },
          { status: 400 }
        );
      }
      data.status = body.status as PpdbStatus;
    }

    if (body.majorFirst !== undefined) {
      if (
        typeof body.majorFirst !== "string" ||
        !(VALID_MAJORS as readonly string[]).includes(body.majorFirst)
      ) {
        return NextResponse.json(
          { error: "Invalid majorFirst. Use: " + VALID_MAJORS.join(", ") },
          { status: 400 }
        );
      }
      data.majorFirst = body.majorFirst as PpdbJurusan;
    }

    if (body.majorSecond !== undefined) {
      if (
        typeof body.majorSecond !== "string" ||
        !(VALID_MAJORS as readonly string[]).includes(body.majorSecond)
      ) {
        return NextResponse.json(
          { error: "Invalid majorSecond. Use: " + VALID_MAJORS.join(", ") },
          { status: 400 }
        );
      }
      data.majorSecond = body.majorSecond as PpdbJurusan;
    }

    if (body.fullName !== undefined) {
      if (typeof body.fullName !== "string" || body.fullName.trim().length < 2) {
        return NextResponse.json(
          { error: "Invalid fullName (min 2 chars)" },
          { status: 400 }
        );
      }
      data.fullName = body.fullName.trim();
    }

    if (body.email !== undefined) {
      if (
        typeof body.email !== "string" ||
        !EMAIL_RE.test(body.email.trim())
      ) {
        return NextResponse.json(
          { error: "Invalid email" },
          { status: 400 }
        );
      }
      data.email = body.email.trim();
    }

    if (body.notes !== undefined) {
      if (typeof body.notes !== "string") {
        return NextResponse.json(
          { error: "Invalid notes (string)" },
          { status: 400 }
        );
      }
      data.notes = body.notes;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.ppdbRegistration.update({
      where: { id: registrationId },
      data,
    });

    // -------- Audit log --------------------------------------------------
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    for (const k of Object.keys(data)) {
      const oldVal = (existing as Record<string, unknown>)[k] ?? null;
      const newVal = (updated as Record<string, unknown>)[k] ?? null;
      if (oldVal !== newVal) changes[k] = { old: oldVal, new: newVal };
    }

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.PPDB_STATUS_UPDATED,
      targetType: "PPDB",
      targetId: registrationId,
      detail: `Update ${existing.registrationNo} (${existing.fullName}): ${Object.keys(changes).join(", ") || "no effective changes"}`,
      meta: { changes },
    });

    return NextResponse.json({ registration: updated });
  } catch (error) {
    console.error("Error updating PPDB registration:", error);
    return NextResponse.json(
      { error: "Failed to update PPDB registration" },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    await prisma.ppdbRegistration.delete({ where: { id: registrationId } });

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
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 }
    );
  }
}
