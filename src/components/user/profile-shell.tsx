"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  UserRound,
  ShieldCheck,
  Menu,
  ChevronRight,
  LogOut,
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
import { ToastProvider } from "@/components/ui/toast";
import {
  UserDropdown,
  type UserDropdownItem,
} from "@/components/ui/user-dropdown";
import { cn } from "@/lib/utils";
import { isAdmin as checkIsAdmin, formatRoleLabel } from "@/lib/roles";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { href: "/profile", label: "Profil", icon: UserRound },
  { href: "/settings", label: "Pengaturan", icon: ShieldCheck },
];

export function ProfileShell({
  user,
  children,
}: {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = checkIsAdmin(user.role);

  const initials = React.useMemo(() => {
    const name = user.name || user.email || "?";
    const parts = name.split(/[\s._-]+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }, [user.name, user.email]);

  const handleLogout = React.useCallback(async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  }, [router]);

  const userDropdownItems: UserDropdownItem[] = React.useMemo(() => {
    const items: UserDropdownItem[] = [
      {
        key: "profile",
        label: "Lihat Profil",
        icon: UserRound,
        href: "/profile",
      },
      {
        key: "settings",
        label: "Pengaturan",
        icon: ShieldCheck,
        href: "/settings",
      },
    ];
    if (isAdmin) {
      items.push({
        key: "admin",
        label: "Admin Panel",
        icon: ShieldCheck,
        href: "/admin",
      });
    }
    // items.push({
    //   key: "logout",
    //   label: "Keluar",
    //   icon: LogOut,
    //   onClick: handleLogout,
    //   danger: true,
    // });
    return items;
  }, [isAdmin, handleLogout]);

  const renderNavLinks = (onNavigate?: () => void) =>
    navItems.map((item) => {
      const active = pathname === item.href;
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            active
              ? "bg-sky-100 text-sky-800"
              : "text-slate-600 hover:bg-sky-50 hover:text-sky-800"
          )}
        >
          <Icon
            className={cn("h-4 w-4", active ? "text-sky-700" : "text-sky-500")}
            aria-hidden
          />
          {item.label}
        </Link>
      );
    });

  const userBlock = (
    <div className="flex items-center gap-3">
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || "User"}
          width={56}
          height={56}
          unoptimized
          className="h-14 w-14 rounded-full object-cover ring-2 ring-sky-100"
        />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-cyan-500 text-base font-bold text-white ring-2 ring-sky-100">
          {initials}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user.name || "Pengguna"}
        </p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
        <p className="truncate text-xs font-medium text-sky-600">{formatRoleLabel(user.role)}</p>
      </div>
    </div>
  );

  return (
    <ToastProvider>
      <div className="flex min-h-dvh bg-sky-50/60">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5">
            <AuthLogo width={36} height={36} />
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900">
                Portal Sekolah
              </span>
              <span className="block text-xs font-medium text-sky-600">
                Tunas Harapan
              </span>
            </span>
          </div>

          <nav className="flex-1 space-y-6 overflow-y-auto subtle-scroll px-3 py-4">
            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between px-3 mb-1">
                <span className="font-overline text-slate-400">Akun</span>
              </div>
              <div className="space-y-1">{renderNavLinks()}</div>
            </div>
          </nav>

          <div className="border-t border-slate-100 p-4">
            {userBlock}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </aside>

        <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col lg:pl-72">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-2">
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="lg:hidden"
                    aria-label="Buka menu"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2.5">
                      <AuthLogo width={32} height={32} />
                      Portal Sekolah
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 flex flex-col space-y-0 overflow-y-auto subtle-scroll flex-1">
                    <div className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between px-3 mb-1">
                        <span className="font-overline text-slate-400">Akun</span>
                      </div>
                      <div className="space-y-1">{renderNavLinks(() => setMenuOpen(false))}</div>
                    </div>
                  </nav>
                  <div className="mt-auto border-t border-slate-100 pt-4">
                    {userBlock}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="mt-3 w-full gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-1.5 text-sm">
                {pathname === "/profile" ? (
                  <>
                    <span className="font-semibold text-slate-900">Akun</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-500">Profil</span>
                  </>
                ) : pathname === "/settings" ? (
                  <>
                    <span className="font-semibold text-slate-900">Akun</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-500">Pengaturan</span>
                  </>
                ) : (
                  <span className="font-semibold text-slate-900">
                    {(() => {
                      const segment = pathname.split("/").pop();
                      if (!segment) return "Portal";
                      return segment.charAt(0).toUpperCase() + segment.slice(1);
                    })()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <UserDropdown
                user={{
                  name: user.name || "Pengguna",
                  email: user.email || "",
                  image: user.image,
                  initials,
                  role: user.role,
                  statusLabel: { text: user.role, tone: "neutral" as const },
                }}
                items={userDropdownItems}
                onLogout={handleLogout}
              />
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="border-t border-slate-200 bg-white/60 py-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} SMK Telekomunikasi Tunas Harapan — Portal
            internal.
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}
