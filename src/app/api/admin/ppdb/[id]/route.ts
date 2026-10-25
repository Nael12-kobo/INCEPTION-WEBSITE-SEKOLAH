import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canManagePpdb } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { getPpdbJurusanOptions } from "@/lib/ppdb-jurusan-server";

const VALID_STATUSES = [
  "PENDING",
  "CONTACTED",
  "APPROVED",
  "REGISTERED",
  "REJECTED",
] as const;
type PpdbStatus = (typeof VALID_STATUSES)[number];

interface PpdbPatchInput {
  status?: unknown;
  majorFirst?: unknown;
  majorSecond?: unknown;
  fullName?: unknown;
  email?: unknown;
  notes?: unknown;
  announcement?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * PATCH — update pendaftaran PPDB.
 * Admin & Super Admin bisa update: status, majorFirst, majorSecond, fullName,
 * email, notes, announcement. Setidaknya satu field harus dikirim.
 * Status APPROVED wajib disertai announcement (pengumuman ACC).
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

    if (body.majorFirst !== undefined || body.majorSecond !== undefined) {
      const options = await getPpdbJurusanOptions();
      const allowed = new Set(options.map((item) => item.value));
      if (body.majorFirst !== undefined) {
        if (typeof body.majorFirst !== "string" || !allowed.has(body.majorFirst)) {
          return NextResponse.json({ error: "Pilihan jurusan pertama tidak valid." }, { status: 400 });
        }
        data.majorFirst = body.majorFirst;
      }
      if (body.majorSecond !== undefined) {
        if (typeof body.majorSecond !== "string" || !allowed.has(body.majorSecond)) {
          return NextResponse.json({ error: "Pilihan jurusan kedua tidak valid." }, { status: 400 });
        }
        data.majorSecond = body.majorSecond;
      }
      const first = (data.majorFirst ?? existing.majorFirst) as string;
      const second = (data.majorSecond ?? existing.majorSecond) as string;
      if (first === second) {
        return NextResponse.json({ error: "Pilihan jurusan pertama dan kedua harus berbeda." }, { status: 400 });
      }
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
      const normalized = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!EMAIL_RE.test(normalized)) {
        return NextResponse.json(
          { error: "Invalid email" },
          { status: 400 }
        );
      }
      data.email = normalized;
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

    if (body.announcement !== undefined) {
      if (typeof body.announcement !== "string") {
        return NextResponse.json(
          { error: "Invalid announcement (string)" },
          { status: 400 }
        );
      }
      data.announcement = body.announcement.trim();
    }

    // ACC: menyetujui pendaftaran wajib menyertakan pengumuman agar siswa
    // tahu langkah daftar ulang berikutnya.
    if (body.status === "APPROVED" && !data.announcement && !existing.announcement) {
      return NextResponse.json(
        { error: "Pengumuman wajib diisi saat ACC (field announcement)" },
        { status: 400 }
      );
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // C12: update pendaftaran + verifikasi akun siswa dalam SATU transaksi —
    // crash di tengah jalan tidak lagi meninggalkan status REGISTERED dengan
    // akun yang emailVerified-nya null (atau sebaliknya).
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.ppdbRegistration.update({
        where: { id: registrationId },
        data,
      });

      // "Meloloskan" (status → REGISTERED): verifikasi juga akun siswanya —
      // portal siswa sudah terbuka penuh, dan badge Verifikasi di Pengguna ikut
      // benar. updateMany agar aman bila akunnya sudah terverifikasi.
      if (data.status === "REGISTERED" && existing.status !== "REGISTERED") {
        await tx.user.updateMany({
          where: { id: existing.userId, emailVerified: null },
          data: { emailVerified: new Date() },
        });
      }
      return row;
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
