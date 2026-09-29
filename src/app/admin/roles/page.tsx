import { redirect } from "next/navigation";
import { requireAdmin, isSuperAdmin } from "@/lib/role-utils";
import { ForbiddenPage } from "@/components/admin/forbidden-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Role & Izin — Admin Panel | SMK Tunas Harapan",
  description: "Kelola hierarki peran dan izin akses.",
};

export default async function AdminRolesPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/roles");
  }

  if (!isSuperAdmin(session.user.role)) {
    return <ForbiddenPage />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Role & Izin</h1>
        <p className="font-body text-slate-500">
          Hierarki peran sistem saat ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-violet-600" />
              SUPER_ADMIN
            </CardTitle>
            <CardDescription>Akses penuh</CardDescription>
          </CardHeader>
          <CardContent className="font-caption text-sm text-slate-600 space-y-1">
            <p>• Ubah role user</p>
            <p>• Hapus user</p>
            <p>• Kelola PPDB</p>
            <p>• Akses Role & Audit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-sky-600" />
              ADMIN
            </CardTitle>
            <CardDescription>Akses terbatas</CardDescription>
          </CardHeader>
          <CardContent className="font-caption text-sm text-slate-600 space-y-1">
            <p>• Lihat semua user</p>
            <p>• Edit data USER</p>
            <p>• Kelola PPDB</p>
            <p>• Tidak bisa ubah role / hapus user</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-slate-500" />
              USER
            </CardTitle>
            <CardDescription>Akses dasar</CardDescription>
          </CardHeader>
          <CardContent className="font-caption text-sm text-slate-600 space-y-1">
            <p>• Dashboard personal</p>
            <p>• Daftar PPDB</p>
            <p>• Tidak ada akses admin</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
