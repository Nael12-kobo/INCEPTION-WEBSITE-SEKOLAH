import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell, type DashboardUser } from "@/components/dashboard/dashboard-shell";
import { WelcomeSection } from "@/components/dashboard/welcome-section";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { AccountSection } from "@/components/dashboard/account-section";
import { ProgramsSection } from "@/components/dashboard/programs-section";

export const metadata = {
  title: "Dashboard — SMK Telekomunikasi Tunas Harapan",
  description: "Portal internal siswa: agenda, pengumuman, dan profil akun.",
};

const WIB_TZ = "Asia/Jakarta";

/** Fallback apabila user tidak memiliki nama (mis. OAuth tanpa nama). */
function initialsFrom(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "?";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

export default async function DashboardPage() {
  // Guard: semua route dashboard hanya untuk user yang sudah login.
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard");

  const userId = session.user.id;

  // Ambil data akun terbaru langsung dari database (session bisa basi).
  // "Bergabung sejak" memakai Account.createdAt paling lama — model User
  // tidak memiliki timestamp pendaftaran (lihat catatan di bawah halaman ini).
  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    }),
    prisma.account.findMany({
      where: { userId },
      select: { provider: true, createdAt: true },
      distinct: ["provider"],
    }),
  ]);

  // User bisa saja terhapus setelah session dibuat.
  if (!user) redirect("/auth/login?callbackUrl=/dashboard");

  const providerLabels: Record<string, string> = {
    credentials: "Email & kata sandi",
    google: "Google",
    github: "GitHub",
  };
  const providerLabel =
    accounts.map((a) => providerLabels[a.provider] ?? a.provider).join(", ") ||
    "Email & kata sandi";

  const earliestAccount = accounts.reduce<Date | null>(
    (min, a) => (min === null || a.createdAt < min ? a.createdAt : min),
    null
  );

  const dashboardUser: DashboardUser = {
    name: user.name ?? user.email ?? "Pengguna",
    email: user.email ?? "—",
    image: user.image,
    initials: initialsFrom(user.name ?? "", user.email ?? ""),
    providerLabel,
    emailVerified: user.emailVerified !== null,
    joinedLabel: earliestAccount
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: WIB_TZ,
        }).format(earliestAccount)
      : "Tidak tercatat",
  };

  // Tanggal & jam "sekarang" dibuat di server (WIB) agar render server ==
  // render client hydration tidak salah sapa.
  const nowInWib = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: WIB_TZ,
  }).format(new Date());
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: WIB_TZ,
    }).format(new Date())
  );

  return (
    <DashboardShell user={dashboardUser}>
      <WelcomeSection userName={dashboardUser.name} todayLabel={nowInWib} hour={hour} />
      <DashboardStats />
      <AccountSection user={dashboardUser} />
      <ProgramsSection />
    </DashboardShell>
  );
}
