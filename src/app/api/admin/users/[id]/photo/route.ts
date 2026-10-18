import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";

/**
 * Foto siswa untuk admin panel.
 *
 * GET /api/admin/users/[id]/photo          → tampilkan foto (inline)
 * GET /api/admin/users/[id]/photo?download=1 → unduh sebagai lampiran
 *
 * Hanya ADMIN/SUPER_ADMIN (requireAdmin).
 */

function extensionOf(mime: string | null): string {
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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      name: true,
      email: true,
      photoBytes: true,
      photoMime: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!user.photoBytes) {
    return NextResponse.json(
      { error: "User ini belum mengunggah foto." },
      { status: 404 }
    );
  }

  const download = request.nextUrl.searchParams.get("download") === "1";
  const extension = extensionOf(user.photoMime);
  const filename = `foto-${slugify(user.name ?? user.email ?? id)}.${extension}`;

  const headers: Record<string, string> = {
    "Content-Type": user.photoMime ?? "image/jpeg",
    "Cache-Control": "private, no-store",
  };
  if (download) {
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new NextResponse(new Uint8Array(user.photoBytes), { headers });
}
