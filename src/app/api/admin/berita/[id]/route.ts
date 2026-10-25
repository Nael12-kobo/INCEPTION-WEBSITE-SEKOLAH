import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { validateBerita } from "@/lib/berita-server";
import { revalidateKontenPublik } from "@/lib/revalidate-public";

type Ctx = { params: Promise<{ id: string }> };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/** PATCH /api/admin/berita/[id] — ubah berita buatan admin. */
export async function PATCH(request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const existing = await prisma.berita.findUnique({
    where: { id },
    select: { id: true, judul: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
  }

  const result = validateBerita(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const updated = await prisma.berita.update({
      where: { id },
      data: result.data,
    });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.BERITA_UPDATED,
      targetType: "BERITA",
      targetId: id,
      detail: `Berita: ${updated.judul}`,
      meta: { slug: updated.slug },
    });
    revalidateKontenPublik();
    return NextResponse.json({ row: updated });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: `Slug "${result.data.slug}" sudah dipakai berita lain.` },
        { status: 409 },
      );
    }
    console.error("Gagal mengubah berita:", error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}

/** DELETE /api/admin/berita/[id] — hapus berita buatan admin. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.berita.findUnique({
    where: { id },
    select: { judul: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Berita tidak ditemukan." }, { status: 404 });
  }

  try {
    await prisma.berita.delete({ where: { id } });
  } catch (error) {
    console.error("Gagal menghapus berita:", error);
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }

  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: AUDIT_ACTIONS.BERITA_DELETED,
    targetType: "BERITA",
    targetId: id,
    detail: `Berita dihapus: ${existing.judul}`,
  });
  revalidateKontenPublik();

  return NextResponse.json({ ok: true });
}
