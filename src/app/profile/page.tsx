import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserProfileClient } from "@/components/user/user-profile-client";

export const metadata = {
  title: "Profil Saya — SMK Tunas Harapan",
  description: "Lihat detail profil dan informasi akun Anda.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const [user, ppdbRegistration, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.ppdbRegistration.findUnique({
      where: { userId: session.user.id },
      select: {
        registrationNo: true,
        status: true,
        majorFirst: true,
        majorSecond: true,
        fullName: true,
        birthDate: true,
        gender: true,
        phone: true,
        address: true,
        previousSchool: true,
        parentName: true,
        parentPhone: true,
        createdAt: true,
      },
    }),
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { provider: true, createdAt: true },
      distinct: ["provider"],
    }),
  ]);

  if (!user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  const providerLabels: Record<string, string> = {
    credentials: "Email & kata sandi",
    google: "Google",
    github: "GitHub",
  };
  const providerLabel =
    accounts.map((a) => providerLabels[a.provider] ?? a.provider).join(", ") ||
    "Email & kata sandi";

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Profil Saya</h1>
        <p className="font-body text-slate-500">
          Lihat detail profil dan informasi akun Anda.
        </p>
      </div>

      <UserProfileClient
        user={{
          id: user.id,
          name: user.name ?? "",
          email: user.email ?? "",
          image: user.image,
          emailVerified: user.emailVerified?.toISOString() ?? null,
          role: user.role,
          createdAt: user.createdAt.toISOString(),
          providerLabel,
        }}
        ppdb={ppdbRegistration}
      />
    </div>
  );
}
