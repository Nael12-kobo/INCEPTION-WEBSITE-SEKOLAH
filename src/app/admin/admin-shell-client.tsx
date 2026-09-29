"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Shield,
  ScrollText,
  Settings,
  Home,
  Bell,
  Menu,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { AuthLogo } from "@/components/auth/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  UserDropdown,
  type UserDropdownUser,
} from "@/components/ui/user-dropdown";
import { ToastProvider, useToast, type ToastApi } from "@/components/ui/toast";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/roles";
import { cn } from "@/lib/utils";

type AdminCurrentUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section: "manajemen" | "sistem";
  superAdminOnly?: boolean;
  breadcrumbLabel: string;
};

const navItems: NavItem[] = [
  {
    href: "/admin/overview",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "manajemen",
    breadcrumbLabel: "Overview",
  },
  {
    href: "/admin/users",
    label: "Pengguna",
    icon: Users,
    section: "manajemen",
    breadcrumbLabel: "Pengguna",
  },
  {
    href: "/admin/ppdb",
    label: "PPDB Registrations",
    icon: FileSpreadsheet,
    section: "manajemen",
    breadcrumbLabel: "PPDB",
  },
  {
    href: "/admin/roles",
    label: "Role & Izin",
    icon: Shield,
    section: "sistem",
    breadcrumbLabel: "Role & Izin",
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    icon: ScrollText,
    section: "sistem",
    superAdminOnly: true,
    breadcrumbLabel: "Audit Log",
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    icon: Settings,
    section: "sistem",
    breadcrumbLabel: "Pengaturan",
  },
];

function getInitials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "??";
  const parts = source.split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function SidebarAvatar({ user }: { user: AdminCurrentUser }) {
  const initials = getInitials(user.name, user.email);
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-700 font-bold text-white ring-2 ring-slate-600"
    >
      {initials}
    </span>
  );
}

function NotificationBell() {
  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Notifikasi"
      className="relative"
    >
      <Bell className="h-4 w-4 text-slate-600" aria-hidden />
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
        3
      </span>
    </Button>
  );
}

function SidebarContent({
  user,
  currentPath,
  onNavClick,
  toast,
}: {
  user: AdminCurrentUser;
  currentPath: string;
  onNavClick?: () => void;
  toast: ToastApi;
}) {
  const isSuperAdmin = checkIsSuperAdmin(user.role);

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.superAdminOnly && !isSuperAdmin) {
      e.preventDefault();
      toast.warning(
        `Halaman "${item.label}" hanya dapat diakses oleh Super Admin.`
      );
      return;
    }
    onNavClick?.();
  };

  const manajemenItems = navItems.filter((i) => i.section === "manajemen");
  const sistemItems = navItems.filter((i) => i.section === "sistem");

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = currentPath === item.href || currentPath.startsWith(item.href + "/");
    const disabled = item.superAdminOnly && !isSuperAdmin;

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={(e) => handleNavClick(item, e)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors mx-2 mb-0.5",
          isActive
            ? "bg-sky-600 text-white shadow-lg shadow-sky-900/30"
            : disabled
              ? "text-slate-300/60 hover:bg-slate-800/40 cursor-not-allowed"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-white" : "text-slate-400"
          )}
          aria-hidden
        />
        <span className="flex-1 min-w-0 truncate">{item.label}</span>
        {item.superAdminOnly && (
          <Badge
            className={cn(
              "text-[9px] px-1.5 py-0",
              disabled
                ? "bg-slate-700 text-slate-400 border-slate-600 opacity-70"
                : "bg-violet-900/60 text-violet-200 border-violet-700"
            )}
          >
            SUPER ADMIN
          </Badge>
        )}
      </Link>
    );
  };

  const userBlock = (
    <>
      <SidebarAvatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-100">
          {user.name || "Admin"}
        </p>
        <p className="truncate text-xs text-slate-400">
          {user.email || "-"}
        </p>
      </div>
    </>
  );

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-800 px-5">
        <AuthLogo width={34} height={34} />
        <span className="leading-tight">
          <span className="block text-sm font-bold text-white">Admin Panel</span>
          <span className="block text-xs font-medium text-slate-400">
            SMK Tunas Harapan
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto py-4 subtle-scroll">
        <div className="font-overline text-slate-500 px-4 py-2 uppercase tracking-wider">
          MANAJEMEN
        </div>
        {manajemenItems.map(renderNavItem)}

        <div className="font-overline text-slate-500 px-4 py-2 uppercase tracking-wider mt-4">
          SISTEM
        </div>
        {sistemItems.map(renderNavItem)}
      </nav>

      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">{userBlock}</div>
      </div>
    </>
  );
}

function AdminShellInner({
  currentUser,
  children,
}: {
  currentUser: AdminCurrentUser;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  const currentNav = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  const breadcrumbSection = currentNav?.breadcrumbLabel || "Overview";

  const dropdownUser: UserDropdownUser = {
    name: currentUser.name || "Admin",
    email: currentUser.email || "-",
    image: null,
    initials: getInitials(currentUser.name, currentUser.email),
    role: currentUser.role,
    twoFactorEnabled: false,
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Gagal keluar dari akun.");
    }
  };

  return (
    <div className="flex min-h-dvh bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-900 text-slate-100 lg:flex">
        <SidebarContent user={currentUser} currentPath={pathname} toast={toast} />
      </aside>

      <div className="flex min-h-dvh w-full min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6">
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
              <SheetContent
                side="left"
                className="flex flex-col max-w-[85vw] bg-slate-900 text-slate-100 border-slate-800 p-0"
              >
                <SheetHeader className="p-0">
                  <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full overflow-hidden">
                  <SidebarContent
                    user={currentUser}
                    currentPath={pathname}
                    onNavClick={() => setMenuOpen(false)}
                    toast={toast}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="text-slate-700 font-semibold">Admin</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
              <span className="text-slate-900 font-semibold">
                {breadcrumbSection}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Dashboard User</span>
              </Link>
            </Button>
            <NotificationBell />
            <UserDropdown
              user={dropdownUser}
              onLogout={handleLogout}
              items={[
                {
                  key: "overview",
                  label: "Overview",
                  href: "/admin/overview",
                  icon: LayoutDashboard,
                },
                {
                  key: "dashboard",
                  label: "Dashboard",
                  href: "/dashboard",
                  icon: Home,
                },
                {
                  key: "settings",
                  label: "Pengaturan",
                  href: "/admin/settings",
                  icon: Settings,
                },
              ]}
            />
          </div>
        </header>

        <main className="min-h-[calc(100dvh-4rem)] w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </div>
        </main>

        <footer className="border-t border-slate-200 bg-white/60 py-4 text-center text-xs text-slate-400">
          © 2026 SMK Telekomunikasi Tunas Harapan — Admin Panel
        </footer>
      </div>
    </div>
  );
}

export function AdminShellClient({
  currentUser,
  children,
}: {
  currentUser: AdminCurrentUser;
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminShellInner currentUser={currentUser}>
        {children}
      </AdminShellInner>
    </ToastProvider>
  );
}
