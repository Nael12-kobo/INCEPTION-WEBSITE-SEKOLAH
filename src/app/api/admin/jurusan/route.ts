import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { listJurusanAdmin, validateJurusan } from "@/lib/jurusan-server";
import { revalidateKontenPublik } from "@/lib/revalidate-public";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/** GET /api/admin/jurusan — semua baris untuk tabel admin. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listJurusanAdmin();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Gagal memuat data jurusan:", error);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}

/** POST /api/admin/jurusan — tambah program keahlian baru. */
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = validateJurusan(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const created = await prisma.jurusan.create({
      data: {
        ...result.data,
        kompetensi: result.data.kompetensi as never,
        karir: result.data.karir as never,
      },
    });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.JURUSAN_CREATED,
      targetType: "JURUSAN",
      targetId: created.id,
      detail: `Program keahlian: ${created.nama} (${created.singkatan})`,
      meta: { kode: created.kode },
    });
    revalidateKontenPublik();
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: `Kode "${result.data.kode}" sudah dipakai jurusan lain.` },
        { status: 409 },
      );
    }
    console.error("Gagal menambah jurusan:", error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}
