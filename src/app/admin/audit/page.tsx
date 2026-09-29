import { redirect } from "next/navigation";
import { requireAdmin, canViewAudit } from "@/lib/role-utils";
import { ForbiddenPage } from "@/components/admin/forbidden-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export const metadata = {
  title: "Audit Log — Admin Panel | SMK Tunas Harapan",
  description: "Riwayat aktivitas admin.",
};

export default async function AdminAuditPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/audit");
  }

  if (!canViewAudit(session.user.role)) {
    return <ForbiddenPage />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Audit Log</h1>
        <p className="font-body text-slate-500">
          Riwayat perubahan dan aktivitas admin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-violet-600" />
            Aktivitas Terbaru
          </CardTitle>
          <CardDescription>
            Pencatatan audit belum diaktifkan di database. Halaman ini siap untuk dihubungkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-caption text-slate-400 text-center py-12">
            Belum ada entri audit.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
