import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { ACADEMIC_META, isAcademicDomain } from "@/lib/academic";
import {
  academicCaption,
  createAcademic,
  listAcademic,
  validateAcademic,
} from "@/lib/academic-server";

type Ctx = { params: Promise<{ domain: string }> };

/** GET /api/admin/academic/[domain] — daftar baris untuk tabel admin. */
export async function GET(_request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain } = await params;
  if (!isAcademicDomain(domain)) {
    return NextResponse.json({ error: "Domain tidak dikenal." }, { status: 404 });
  }

  try {
    const rows = await listAcademic(domain);
    return NextResponse.json({ rows });
  } catch (error) {
    console.error("Gagal memuat data akademik:", error);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}

/** POST /api/admin/academic/[domain] — tambah data (form admin). */
export async function POST(request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { domain } = await params;
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
    const created = await createAcademic(domain, result.data);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.ACADEMIC_CREATED,
      targetType: "ACADEMIC",
      detail: `${ACADEMIC_META[domain].title}: ${academicCaption(domain, result.data)}`,
      meta: { domain },
    });
    return NextResponse.json({ row: created }, { status: 201 });
  } catch (error) {
    console.error("Gagal menambah data akademik:", error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}
