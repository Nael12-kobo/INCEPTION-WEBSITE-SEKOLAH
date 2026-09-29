import { redirect } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  AdminUsersClient,
  type AdminUserRow,
} from "@/components/admin/admin-users-client";

export const metadata = {
  title: "Manajemen Pengguna — Admin Panel | SMK Tunas Harapan",
  description: "Kelola akun pengguna, peran, dan status verifikasi.",
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/users");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const initialUsers: AdminUserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-h1 text-slate-900">Manajemen Pengguna</h1>
          <p className="font-body text-slate-500">
            Kelola akun pengguna, peran, dan status verifikasi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled title="Gunakan tombol Export di tabel">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" disabled title="Segera hadir">
            <Plus className="h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </div>

      <AdminUsersClient
        currentUserId={session.user.id}
        currentUserRole={session.user.role}
        initialUsers={initialUsers}
      />
    </div>
  );
}
