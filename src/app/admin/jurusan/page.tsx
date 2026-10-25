import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { listJurusanAdmin } from "@/lib/jurusan-server";
import { JurusanAdminClient } from "@/components/admin/jurusan-admin-client";

export const metadata = {
  title: "Program Keahlian — Admin Panel | SMK Tunas Harapan",
  description:
    "Tambah dan kelola program keahlian (jurusan) yang tampil di situs publik.",
};

export default async function AdminJurusanPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/jurusan");
  }

  const rows = await listJurusanAdmin();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-h1 text-slate-900">Program Keahlian</h1>
          <p className="font-body text-slate-500">
            Kelola jurusan yang tampil di homepage, daftar /jurusan, dan
            halaman detailnya masing-masing.
          </p>
        </div>
      </div>

      <JurusanAdminClient initialRows={rows} />
    </div>
  );
}
