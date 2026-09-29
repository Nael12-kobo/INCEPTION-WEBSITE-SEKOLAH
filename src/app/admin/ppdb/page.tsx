import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import {
  AdminPpdbClient,
  type PpdbRow,
} from "@/components/admin/admin-ppdb-client";

export const metadata = {
  title: "Manajemen PPDB — Admin Panel | SMK Tunas Harapan",
  description: "Kelola pendaftaran PPDB dan alur seleksi.",
};

export default async function AdminPpdbPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/ppdb");
  }

  const registrations = await prisma.ppdbRegistration.findMany({
    select: {
      id: true,
      registrationNo: true,
      fullName: true,
      email: true,
      phone: true,
      majorFirst: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const initialRegistrations: PpdbRow[] = registrations.map((r) => ({
    id: r.id,
    registrationNo: r.registrationNo,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    majorFirst: r.majorFirst,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  const statusCounts = {
    PENDING: 0,
    CONTACTED: 0,
    REGISTERED: 0,
    REJECTED: 0,
  };
  for (const r of registrations) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-h1 text-slate-900">Manajemen PPDB</h1>
          <p className="font-body text-slate-500">
            Kelola pendaftaran PPDB dan alur seleksi.
          </p>
        </div>
      </div>

      <AdminPpdbClient
        initialRegistrations={initialRegistrations}
        statusCounts={statusCounts}
      />
    </div>
  );
}
