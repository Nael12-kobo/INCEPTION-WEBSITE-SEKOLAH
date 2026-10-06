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
  UserPlus,
  ClipboardList,
  KeyRound,
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

export type AdminActivityItem = {
  id: string;
  action: string;
  detail: string | null;
  actorEmail: string | null;
  createdAt: string;
};

const ACTIVITY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  PPDB_REGISTERED: { icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600" },
  USER_CREATED: { icon: UserPlus, tone: "bg-sky-50 text-sky-600" },
  USER_ROLE_CHANGED: { icon: Shield, tone: "bg-violet-50 text-violet-600" },
  PASSWORD_CHANGED: { icon: KeyRound, tone: "bg-amber-50 text-amber-600" },
  ACCOUNT_REGISTERED: { icon: UserPlus, tone: "bg-sky-50 text-sky-600" },
  PPDB_STATUS_UPDATED: { icon: ClipboardList, tone: "bg-sky-50 text-sky-600" },
};

function timeAgoLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" }).format(
    new Date(iso)
  );
}

function NotificationBell({
  activities,
  isSuperAdmin,
}: {
  activities: AdminActivityItem[];
  isSuperAdmin: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label={`Notifikasi (${activities.length} aktivitas terbaru)`}
        // h-11: target sentuh nyaman di HP; kembali 32px (icon-sm) di ≥sm.
        className="relative h-11 w-11 sm:h-8 sm:w-8"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell className="h-4 w-4 text-slate-600" aria-hidden />
        {activities.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {activities.length > 9 ? "9+" : activities.length}
          </span>
        )}
      </Button>

      {open && (
        // max-w-[75vw]: bell tidak di pojok kanan header, jadi w-80 bisa keluar
        // layar di HP 360px — batasi agar tepi kirinya tetap terlihat.
        <div className="animate-fade-in elevation-4 absolute right-0 top-full z-50 mt-2 w-80 max-w-[75vw] overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h4 className="font-h4 text-sm text-slate-900">Aktivitas Terbaru</h4>
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push("/admin/audit");
                }}
                className="text-xs font-medium text-sky-600 hover:underline"
              >
                Lihat semua
              </button>
            )}
          </div>
          {activities.length === 0 ? (
            <p className="px-4 py-8 text-center font-caption text-xs text-slate-400">
              Belum ada aktivitas terbaru.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto subtle-scroll">
              {activities.map((a) => {
                const meta = ACTIVITY_META[a.action] ?? {
                  icon: Bell,
                  tone: "bg-slate-100 text-slate-500",
                };
                const Icon = meta.icon;
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 border-b border-slate-100 px-4 py-3 last:border-0 transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        meta.tone
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-slate-800">
                        {a.detail ?? a.action}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {timeAgoLabel(a.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
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
  activities,
  children,
}: {
  currentUser: AdminCurrentUser;
  activities: AdminActivityItem[];
  children: React.ReactNode;
}) {
  const viewerIsSuperAdmin = checkIsSuperAdmin(currentUser.role);
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
    statusLabel: { text: "Akun Admin", tone: "positive" as const },
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
        {/* top-[env(safe-area-inset-top)]: viewportFit=cover → header harus
            turun di bawah status bar iPhone (env=0 di perangkat lain). */}
        <header className="sticky top-[env(safe-area-inset-top)] z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  // h-11: hamburger = kontrol utama di HP; 32px di ≥sm.
                  className="h-11 w-11 sm:h-8 sm:w-8 lg:hidden"
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

            {/* min-w-0 + truncate: label breadcrumb tak boleh mendorong header
                melebihi 360px (keluar viewport / bikin scroll horizontal). */}
            <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
              {/* Prefix "Admin ›" hanya di ≥sm — di HP hanya judul halaman
                  yang ditampilkan agar baris header tetap muat di 360px. */}
              <span className="hidden text-slate-700 font-semibold sm:inline">Admin</span>
              <ChevronRight className="hidden h-3 w-3 text-slate-400 sm:block" />
              <span className="truncate text-slate-900 font-semibold">
                {breadcrumbSection}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="h-11 sm:h-8">
              <Link href="/">
                <Home className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Beranda</span>
              </Link>
            </Button>
            {/* Sembunyikan di <sm: header 360px muat hamburger + breadcrumb +
                tombol lain tanpa overflow (label dashboard sudah ada di drawer). */}
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">Dashboard User</span>
              </Link>
            </Button>
            <NotificationBell activities={activities} isSuperAdmin={viewerIsSuperAdmin} />
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
  activities = [],
  children,
}: {
  currentUser: AdminCurrentUser;
  activities?: AdminActivityItem[];
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminShellInner currentUser={currentUser} activities={activities}>
        {children}
      </AdminShellInner>
    </ToastProvider>
  );
}
