import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import { AdminShellClient } from "./admin-shell-client";

export const metadata = {
  title: {
    default: "Admin Panel — SMK Telekomunikasi Tunas Harapan",
    template: "%s — Admin Panel | SMK Tunas Harapan",
  },
  description: "Panel administrasi untuk pengelolaan sistem SMK Telekomunikasi Tunas Harapan.",
};

type AdminCurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const currentUser: AdminCurrentUser | null = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!currentUser) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <AdminShellClient currentUser={currentUser}>{children}</AdminShellClient>
  );
}
