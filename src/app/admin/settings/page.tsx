import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AdminSettingsClient } from "@/components/admin/admin-settings-client";

export const metadata = {
  title: "Pengaturan — Admin Panel | SMK Tunas Harapan",
  description: "Kelola profil dan keamanan akun Anda.",
};

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!user) {
    redirect("/auth/login?callbackUrl=/admin/settings");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Pengaturan</h1>
        <p className="font-body text-slate-500">
          Kelola profil dan keamanan akun {user.email}.
        </p>
      </div>

      <AdminSettingsClient
        initialName={user.name ?? ""}
        initialEmail={user.email ?? ""}
        role={user.role}
        hasPassword={Boolean(user.passwordHash)}
      />
    </div>
  );
}
