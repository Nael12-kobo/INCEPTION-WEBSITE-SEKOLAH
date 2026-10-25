import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { getSemuaSiteContent } from "@/lib/site-content-server";
import { SiteContentAdminClient } from "@/components/admin/site-content-admin-client";

export const metadata = {
  title: "Konten Situs — Admin Panel | SMK Tunas Harapan",
  description: "Kelola informasi sekolah yang tampil pada halaman publik.",
};

export default async function AdminKontenSitusPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/konten-situs");
  }

  const initialContent = await getSemuaSiteContent();

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Konten Situs</h1>
        <p className="font-body text-slate-500">
          Ubah informasi halaman beranda, profil, fasilitas, PPDB, statistik,
          dan daftar guru yang dilihat siswa serta calon siswa.
        </p>
      </div>
      <SiteContentAdminClient initialContent={initialContent} />
    </div>
  );
}
