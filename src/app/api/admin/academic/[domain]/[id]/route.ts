import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { ACADEMIC_META, isAcademicDomain } from "@/lib/academic";
import {
  academicCaption,
  deleteAcademic,
  updateAcademic,
  validateAcademic,
} from "@/lib/academic-server";

type Ctx = { params: Promise<{ domain: string; id: string }> };

/**
 * PATCH /api/admin/academic/[domain]/[id] — ubah data.
 * Payload penuh dari form yang sama dengan create (lihat validateAcademic).
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, id } = await params;
  if (!isAcademicDomain(domain)) {
    return NextResponse.json({ error: "Domain tidak dikenal." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await validateAcademic(domain, body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const updated = await updateAcademic(domain, id, result.data);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.ACADEMIC_UPDATED,
      targetType: "ACADEMIC",
      targetId: id,
      detail: `${ACADEMIC_META[domain].title}: ${academicCaption(domain, result.data)}`,
      meta: { domain },
    });
    return NextResponse.json({ row: updated });
  } catch (error) {
    console.error("Gagal mengubah data akademik:", error);
    return NextResponse.json({ error: "Gagal mengubah data." }, { status: 500 });
  }
}

/** DELETE /api/admin/academic/[domain]/[id] — hapus data. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain, id } = await params;
  if (!isAcademicDomain(domain)) {
    return NextResponse.json({ error: "Domain tidak dikenal." }, { status: 404 });
  }

  const deleted = await deleteAcademic(domain, id);
  if (!deleted) {
    return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
  }

  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: AUDIT_ACTIONS.ACADEMIC_DELETED,
    targetType: "ACADEMIC",
    targetId: id,
    detail: `${ACADEMIC_META[domain].title} dihapus`,
    meta: { domain },
  });

  return NextResponse.json({ ok: true });
}
