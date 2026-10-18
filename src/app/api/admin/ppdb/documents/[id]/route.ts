import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canManagePpdb } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";

/**
 * Berkas kelengkapan PPDB untuk panel admin (/admin/ppdb).
 *
 * GET /api/admin/ppdb/documents/[id]            → pratinjau (inline)
 * GET /api/admin/ppdb/documents/[id]?download=1 → unduh sebagai lampiran
 *
 * Hanya ADMIN/SUPER_ADMIN (sama dengan pengelolaan PPDB).
 */

function extensionOf(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug.length > 0 ? slug : "siswa";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session || !canManagePpdb(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = await prisma.ppdbDocument.findUnique({
    where: { id },
    select: {
      bytes: true,
      mime: true,
      kind: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!document) {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
  }

  const download = request.nextUrl.searchParams.get("download") === "1";
  const extension = extensionOf(document.mime);
  const filename = `berkas-${document.kind.toLowerCase()}-${slugify(
    document.user.name ?? document.user.email ?? id
  )}.${extension}`;

  const headers: Record<string, string> = {
    "Content-Type": document.mime,
    "Cache-Control": "private, no-store",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new NextResponse(new Uint8Array(document.bytes), { headers });
}
