import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserSettingsClient } from "@/components/user/user-settings-client";
import { SessionProvider } from "next-auth/react";

export const metadata = {
  title: "Pengaturan Akun — SMK Tunas Harapan",
  description: "Kelola profil dan keamanan akun Anda.",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/settings");
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
    redirect("/auth/login?callbackUrl=/settings");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Pengaturan Akun</h1>
        <p className="font-body text-slate-500 break-words">
          Kelola profil dan keamanan akun {user.email}.
        </p>
      </div>

      <SessionProvider>
      <UserSettingsClient
        initialName={user.name ?? ""}
        initialEmail={user.email ?? ""}
        role={user.role}
        hasPassword={Boolean(user.passwordHash)}
      />
      </SessionProvider>
    </div>
  );
}
