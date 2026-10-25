import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { isSiteContentKey } from "@/lib/site-content";
import { getSiteContent, simpanSiteContent } from "@/lib/site-content-server";
import { revalidateKontenPublik } from "@/lib/revalidate-public";

type Ctx = { params: Promise<{ key: string }> };

/**
 * PATCH /api/admin/site-content/<key> — simpan satu bagian konten halaman
 * publik. Data divalidasi di `normalizeSiteContent` (src/lib/site-content.ts),
 * lalu cache halaman publik dibersihkan supaya perubahan langsung terlihat.
 */
export async function PATCH(request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  if (!isSiteContentKey(key)) {
    return NextResponse.json(
      { error: "Bagian konten tidak dikenal." },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const raw =
    typeof body === "object" && body !== null && "content" in body
      ? (body as { content: unknown }).content
      : body;

  try {
    const content = await simpanSiteContent(key, raw, session.user.id);
    await logAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: AUDIT_ACTIONS.SITE_CONTENT_UPDATED,
      targetType: "SITE_CONTENT",
      targetId: key,
      detail: `Bagian konten: ${key}`,
      meta: { key },
    });
    revalidateKontenPublik();
    return NextResponse.json({ key, content });
  } catch (error) {
    console.error(`Gagal menyimpan konten "${key}":`, error);
    return NextResponse.json({ error: "Gagal menyimpan data." }, { status: 500 });
  }
}

/** GET /api/admin/site-content/<key> — satu bagian konten. */
export async function GET(_request: Request, { params }: Ctx) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  if (!isSiteContentKey(key)) {
    return NextResponse.json(
      { error: "Bagian konten tidak dikenal." },
      { status: 404 },
    );
  }

  const content = await getSiteContent(key);
  return NextResponse.json({ key, content });
}
