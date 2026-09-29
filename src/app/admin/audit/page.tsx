import { redirect } from "next/navigation";
import { requireAdmin, canViewAudit } from "@/lib/role-utils";
import { ForbiddenPage } from "@/components/admin/forbidden-page";
import { prisma } from "@/lib/prisma";
import {
  AdminAuditClient,
  type AuditRow,
} from "@/components/admin/admin-audit-client";

export const metadata = {
  title: "Audit Log — Admin Panel | SMK Tunas Harapan",
  description: "Riwayat aktivitas admin dan pengguna tercatat otomatis.",
};

const TAKE = 200;

export default async function AdminAuditPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/audit");
  }

  if (!canViewAudit(session.user.role)) {
    return <ForbiddenPage />;
  }

  // Ambil audit terbaru. actorEmail di-snapshot saat pencatatan, sehingga
  // tetap tampil walaupun akun aktor sudah dihapus (relasi SetNull).
  const logs = prisma.auditLog
    ? await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: TAKE,
        include: {
          actor: { select: { name: true, email: true } },
        },
      })
    : [];

  const rows: AuditRow[] = logs.map((log) => ({
    id: log.id,
    actorName: log.actor?.name ?? null,
    actorEmail: log.actor?.email ?? log.actorEmail ?? null,
    action: log.action,
    targetType: log.targetType,
    targetId: log.targetId,
    detail: log.detail,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Audit Log</h1>
        <p className="font-body text-slate-500">
          Riwayat perubahan dan aktivitas sistem — login, perubahan user, PPDB,
          dan lainnya.
        </p>
      </div>

      <AdminAuditClient initialRows={rows} />
    </div>
  );
}
