import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { listBeritaAdmin } from "@/lib/berita-server";
import { ambilBerita } from "@/lib/blog";
import { BeritaAdminClient } from "@/components/admin/berita-admin-client";

export const metadata = {
  title: "Berita — Admin Panel | SMK Tunas Harapan",
  description:
    "Tambah berita manual dan pantau berita otomatis dari situs resmi sekolah.",
};

export default async function AdminBeritaPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/berita");
  }

  // Dua sumber berita: buatan admin (database) + tarikan otomatis WordPress
  // (hanya ditampilkan, tidak bisa disunting dari panel ini).
  const [rows, web] = await Promise.all([
    listBeritaAdmin(),
    ambilBerita(6),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-h1 text-slate-900">Berita</h1>
          <p className="font-body text-slate-500">
            Tulis berita sendiri untuk kebutuhan pengumuman — berita dari situs
            resmi tetap ditarik otomatis.
          </p>
        </div>
      </div>

      <BeritaAdminClient
        initialRows={rows}
        initialWeb={web.filter(
          (item) =>
            !rows.some((row) => row.published && row.sourceUrl === item.url),
        )}
      />
    </div>
  );
}
