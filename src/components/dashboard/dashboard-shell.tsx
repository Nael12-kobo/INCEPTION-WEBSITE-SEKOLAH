"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Network,
  Newspaper,
  UserRound,
} from "lucide-react";
import { AuthLogo } from "@/components/auth/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard#ringkasan", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/dashboard#statistik", label: "Statistik", icon: BarChart3 },
  { href: "/dashboard#agenda", label: "Agenda", icon: CalendarDays },
  { href: "/dashboard#akun", label: "Akun Saya", icon: UserRound },
  { href: "/dashboard#jurusan", label: "Jurusan", icon: Network },
  { href: "/dashboard#berita", label: "Berita", icon: Newspaper },
  { href: "/dashboard#ppdb", label: "PPDB", icon: Megaphone },
];

export type DashboardUser = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  /** Label metode masuk, mis. "Google, Email & kata sandi". */
  providerLabel: string;
  emailVerified: boolean;
  /** Tanggal bergabung, sudah diformat (id-ID). */
  joinedLabel: string;
};

/** Avatar user: foto (OAuth) atau inisial pada lingkaran gradien. */
export function DashboardAvatar({
  user,
  size = "md",
}: {
  user: DashboardUser;
  size?: "md" | "lg";
}) {
  const cls = size === "lg" ? "h-14 w-14 text-base" : "h-9 w-9 text-xs";
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name}
        width={56}
        height={56}
        unoptimized
        className={cn("rounded-full object-cover ring-2 ring-sky-100", cls)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 font-bold text-white ring-2 ring-sky-100",
        cls
      )}
    >
      {user.initials}
    </span>
  );
}

function SignOutButton({
  onPending,
  className,
  children,
}: {
  onPending?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      variant="ghost"
      disabled={loading}
      aria-busy={loading}
      className={className}
      onClick={async () => {
        setLoading(true);
        onPending?.();
        try {
          await signOut({ redirectTo: "/" });
        } finally {
          setLoading(false);
        }
      }}
    >
      <LogOut aria-hidden />
      {children}
    </Button>
  );
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = (onNavigate?: () => void) =>
    navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-50 hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
      >
        <item.icon className="h-4 w-4 text-sky-500" aria-hidden />
        {item.label}
      </Link>
    ));

  const userBlock = (
    <>
      <DashboardAvatar user={user} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh bg-sky-50/60">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sky-100 bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sky-100/80 px-5">
          <AuthLogo width={34} height={34} />
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900">Portal Sekolah</span>
            <span className="block text-xs font-medium text-sky-600">Tunas Harapan</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">{navLinks()}</nav>

        <div className="border-t border-sky-100/80 p-4">
          <div className="flex items-center gap-3">{userBlock}</div>
          <SignOutButton className="mt-3 w-full justify-start text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600">
            Keluar
          </SignOutButton>
        </div>
      </aside>

      {/* Kolom konten */}
      <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-sky-100 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            {/* Menu mobile */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Buka menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2.5">
                    <AuthLogo width={32} height={32} />
                    Portal Sekolah
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 flex flex-col gap-1">
                  {navLinks(() => setMenuOpen(false))}
                </nav>
                <div className="mt-auto border-t border-sky-100 pt-4">
                  <div className="flex items-center gap-3">{userBlock}</div>
                  <SignOutButton
                    onPending={() => setMenuOpen(false)}
                    className="mt-3 w-full justify-start text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    Keluar
                  </SignOutButton>
                </div>
              </SheetContent>
            </Sheet>

            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">Dashboard</p>
              <p className="hidden text-xs font-medium text-sky-600 sm:block">
                SMK Telekomunikasi Tunas Harapan
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home aria-hidden />
              Beranda
            </Link>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>

        <footer className="border-t border-sky-100 bg-white/60 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SMK Telekomunikasi Tunas Harapan — Portal internal.
        </footer>
      </div>
    </div>
  );
}
