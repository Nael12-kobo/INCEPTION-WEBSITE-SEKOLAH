import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { validateJurusan } from "@/lib/jurusan-server";
import { revalidateKontenPublik } from "@/lib/revalidate-public";

type Ctx = { params: Promise<{ id: string }> };

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/** PATCH /api/admin/jurusan/[id] — ubah program keahlian. */
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

  const existing = await prisma.jurusan.findUnique({
    where: { id },
    select: { kode: true, nama: true, bawaan: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Jurusan tidak ditemukan." },
      { status: 404 },
    );
  }

  const result = validateJurusan(body, { existingKode: existing.kode });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  if (existing.bawaan && result.data.kode !== existing.kode) {
    return NextResponse.json(
      { error: "Kode URL jurusan bawaan tidak dapat diubah." },
      { status: 400 },
    );
  }

  try {
    const updated = await prisma.jurusan.update({
      where: { id },
      data: {
        ...result.data,
        kompetensi: result.data.kompetensi as never,
        karir: result.data.karir as never,
      },
    });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.JURUSAN_UPDATED,
      targetType: "JURUSAN",
      targetId: id,
      detail: `Program keahlian: ${updated.nama} (${updated.singkatan})`,
      meta: { kode: updated.kode },
    });
    revalidateKontenPublik();
    return NextResponse.json({ row: updated });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: `Kode "${result.data.kode}" sudah dipakai jurusan lain.` },
        { status: 409 },
      );
    }
    console.error("Gagal mengubah jurusan:", error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}

/** DELETE /api/admin/jurusan/[id] — hapus jurusan tambahan. */
export async function DELETE(_request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.jurusan.findUnique({
    where: { id },
    select: { nama: true, kode: true, bawaan: true },
  });
  if (!existing) {
    return NextResponse.json(
      { error: "Jurusan tidak ditemukan." },
      { status: 404 },
    );
  }

  if (existing.bawaan) {
    return NextResponse.json(
      { error: "Jurusan bawaan tidak dapat dihapus." },
      { status: 409 },
    );
  }

  try {
    await prisma.jurusan.delete({ where: { id } });
  } catch (error) {
    console.error("Gagal menghapus jurusan:", error);
    return NextResponse.json({ error: "Gagal menghapus data." }, { status: 500 });
  }

  await logAudit({
    actorId: session.user.id,
    actorEmail: session.user.email,
    action: AUDIT_ACTIONS.JURUSAN_DELETED,
    targetType: "JURUSAN",
    targetId: id,
    detail: `Program keahlian dihapus: ${existing.nama} (${existing.kode})`,
    meta: { kode: existing.kode },
  });
  revalidateKontenPublik();

  return NextResponse.json({ ok: true });
}
