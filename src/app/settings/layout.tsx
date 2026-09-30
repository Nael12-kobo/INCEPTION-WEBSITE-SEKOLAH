import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileShell } from "@/components/user/profile-shell";
import { SessionProvider } from "next-auth/react";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/auth/login?callbackUrl=/settings");
  }

  return (
    <SessionProvider>
      <ProfileShell user={user}>{children}</ProfileShell>
    </SessionProvider>
  );
}
