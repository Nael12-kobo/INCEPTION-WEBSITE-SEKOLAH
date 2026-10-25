import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { listBeritaAdmin, validateBerita } from "@/lib/berita-server";
import { revalidateKontenPublik } from "@/lib/revalidate-public";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}

/** GET /api/admin/berita — semua berita buatan admin untuk tabel admin. */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listBeritaAdmin();
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Gagal memuat berita:", error);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}

/** POST /api/admin/berita — tambah berita buatan admin. */
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

  const result = validateBerita(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  try {
    const created = await prisma.berita.create({ data: result.data });
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.BERITA_CREATED,
      targetType: "BERITA",
      targetId: created.id,
      detail: `Berita: ${created.judul}`,
      meta: { slug: created.slug, kategori: created.kategori },
    });
    revalidateKontenPublik();
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: `Slug "${result.data.slug}" sudah dipakai berita lain.` },
        { status: 409 },
      );
    }
    console.error("Gagal menambah berita:", error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}
