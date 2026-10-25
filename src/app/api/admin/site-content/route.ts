import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { getSemuaSiteContent } from "@/lib/site-content-server";

/**
 * GET /api/admin/site-content — semua bagian konten halaman publik
 * (sudah divalidasi & digabung default) untuk form Admin Panel.
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const content = await getSemuaSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Gagal memuat konten situs:", error);
    return NextResponse.json({ error: "Gagal memuat data." }, { status: 500 });
  }
}
