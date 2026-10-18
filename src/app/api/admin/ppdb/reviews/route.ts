import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canManagePpdb } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import {
  PPDB_REVIEW_NOTE_MAX,
  PPDB_REVIEW_STATUS_LABELS,
  isPpdbReviewKind,
  isPpdbReviewStatus,
  ppdbReviewKindLabel,
} from "@/lib/ppdb-documents";

/**
 * Penilaian berkas kelengkapan PPDB oleh admin (/admin/ppdb → dialog Berkas).
 *
 * PUT    — simpan penilaian satu item (mis. RAPOR → SELESAI/perlu perbaikan + catatan).
 * DELETE — hapus penilaian satu item.
 *
 * Penilaian lama otomatis dihapus oleh endpoint siswa saat berkas/foto terkait
 * diganti atau dihapus, jadi status "Sesuai" selalu menempel pada berkas yang
 * benar-benar diperiksa. Hanya ADMIN/SUPER_ADMIN pengelola PPDB.
 */

type ReviewBody = {
  userId?: unknown;
  kind?: unknown;
  status?: unknown;
  note?: unknown;
};

async function parseBody(
  request: NextRequest
): Promise<{ body: ReviewBody } | { error: NextResponse }> {
  try {
    const body = (await request.json()) as ReviewBody;
    return { body: body ?? {} };
  } catch {
    return {
      error: NextResponse.json(
        { error: "Format permintaan tidak valid." },
        { status: 400 }
      ),
    };
  }
}

export async function PUT(request: NextRequest) {
  const session = await requireAdmin();
  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request);
  if ("error" in parsed) return parsed.error;
  const { body } = parsed;

  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) {
    return NextResponse.json({ error: "Siswa tidak valid." }, { status: 400 });
  }
  if (!isPpdbReviewKind(body.kind)) {
    return NextResponse.json({ error: "Jenis berkas tidak dikenal." }, { status: 400 });
  }
  if (!isPpdbReviewStatus(body.status)) {
    return NextResponse.json({ error: "Status penilaian tidak dikenal." }, { status: 400 });
  }

  const note =
    typeof body.note === "string"
      ? body.note.trim().slice(0, PPDB_REVIEW_NOTE_MAX)
      : "";

  const kind = body.kind;
  const status = body.status;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Siswa tidak ditemukan." }, { status: 404 });
  }

  try {
    const review = await prisma.ppdbDocumentReview.upsert({
      where: { userId_kind: { userId, kind } },
      create: {
        userId,
        kind,
        status,
        note: note || null,
        reviewedBy: session.user.email ?? null,
      },
      update: {
        status,
        note: note || null,
        reviewedBy: session.user.email ?? null,
      },
      select: {
        kind: true,
        status: true,
        note: true,
        reviewedBy: true,
        updatedAt: true,
      },
    });

    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? null,
      action: AUDIT_ACTIONS.DOCUMENT_REVIEWED,
      targetType: "USER",
      targetId: userId,
      detail: `Menilai berkas ${ppdbReviewKindLabel(kind)} — ${
        PPDB_REVIEW_STATUS_LABELS[status]
      } (${user.name ?? user.email ?? userId})${note ? ` · "${note}"` : ""}`,
    });

    return NextResponse.json({
      ok: true,
      review: { ...review, updatedAt: review.updatedAt.toISOString() },
    });
  } catch (error) {
    console.error("Error reviewing PPDB document:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan penilaian. Coba lagi." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request);
  if ("error" in parsed) return parsed.error;
  const { body } = parsed;

  const userId = typeof body.userId === "string" ? body.userId : "";
  if (!userId) {
    return NextResponse.json({ error: "Siswa tidak valid." }, { status: 400 });
  }
  if (!isPpdbReviewKind(body.kind)) {
    return NextResponse.json({ error: "Jenis berkas tidak dikenal." }, { status: 400 });
  }

  try {
    await prisma.ppdbDocumentReview.deleteMany({
      where: { userId, kind: body.kind },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error clearing PPDB document review:", error);
    return NextResponse.json(
      { error: "Gagal menghapus penilaian. Coba lagi." },
      { status: 500 }
    );
  }
}
