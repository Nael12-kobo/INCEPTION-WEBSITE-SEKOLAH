"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  BarChart3,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Menu,
  Network,
  Newspaper,
  UserRound,
  Shield,
  ShieldCheck,
  Bell,
  ChevronRight,
  Megaphone as MegaphoneIcon,
  UserCheck,
  ClipboardList,
  LogIn,
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

export type DashboardActivityItem = {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

type NavSection = {
  title: string;
  badge?: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Dashboard",
    items: [
      { href: "/dashboard#ringkasan", label: "Ringkasan", icon: LayoutDashboard },
      { href: "/dashboard#statistik", label: "Statistik", icon: BarChart3 },
    ],
  },
  {
    title: "Akademik",
    items: [
      { href: "/academic", label: "Portal Akademik", icon: GraduationCap },
      { href: "/dashboard#agenda", label: "Agenda", icon: CalendarDays },
      { href: "/dashboard#jurusan", label: "Jurusan", icon: Network },
      { href: "/dashboard#berita", label: "Berita", icon: Newspaper },
      { href: "/ppdb", label: "PPDB", icon: Megaphone },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/profile", label: "Profil Saya", icon: UserRound },
      { href: "/settings", label: "Pengaturan", icon: ShieldCheck },
    ],
  },
  {
    title: "Administrasi",
    badge: "KHUSUS ADMIN",
    items: [
      { href: "/admin", label: "Admin Panel", icon: Shield, adminOnly: true },
    ],
  },
];

export type DashboardUser = {
  name: string;
  email: string;
  image: string | null;
  initials: string;
  providerLabel: string;
  emailVerified: boolean;
  joinedLabel: string;
  role: string;
};

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

function getFragmentFromHash(): string {
  if (typeof window === "undefined") return "";
  return window.location.hash || "";
}

function isNavActive(href: string, pathname: string, fragment: string): boolean {
  if (href.includes("#")) {
    const [hrefPath, hrefHash] = href.split("#");
    if (pathname === hrefPath) {
      if (!fragment && hrefHash === "ringkasan") return true;
      return fragment === hrefHash;
    }
    return false;
  }
  return pathname === href;
}

function NavSectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between px-3 mb-1">
      <span className="font-overline text-slate-400">{title}</span>
      {badge && (
        <span className="font-overline text-[9px] px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-600">
          {badge}
        </span>
      )}
    </div>
  );
}

function NavLinkItem({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      key={item.href}
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        active
          ? "bg-sky-100 text-sky-800"
          : "text-slate-600 hover:bg-sky-50 hover:text-sky-800"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          active ? "text-sky-700" : "text-sky-500"
        )}
        aria-hidden
      />
      {item.label}
    </Link>
  );
}

const ACTIVITY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  PPDB_REGISTERED: { icon: MegaphoneIcon, tone: "bg-emerald-50 text-emerald-600" },
  ACCOUNT_REGISTERED: { icon: UserCheck, tone: "bg-sky-50 text-sky-600" },
  PPDB_STATUS_UPDATED: { icon: ClipboardList, tone: "bg-sky-50 text-sky-600" },
  LOGIN_SUCCESS: { icon: LogIn, tone: "bg-emerald-50 text-emerald-600" },
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

function NotificationBell({ activities }: { activities: DashboardActivityItem[] }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifikasi"
        className="relative"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {activities.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
            {activities.length > 9 ? "9+" : activities.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="animate-fade-in elevation-4 absolute top-full right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 p-0 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h4 className="font-h4 text-slate-900">Aktivitas Terbaru</h4>
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
                    className="flex items-start gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        meta.tone
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
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

export function DashboardShell({
  user,
  activities = [],
  children,
}: {
  user: DashboardUser;
  activities?: DashboardActivityItem[];
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [fragment, setFragment] = React.useState<string>(() =>
    typeof window !== "undefined" ? getFragmentFromHash() : ""
  );
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = checkIsAdmin(user.role) || checkIsAdmin(session?.user?.role);

  React.useEffect(() => {
    const onHash = () => setFragment(getFragmentFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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
        icon: Shield,
        href: "/admin",
      });
    }
    return items;
  }, [isAdmin]);

  const renderNavLinks = (onNavigate?: () => void) =>
    navSections.map((section) => {
      const filteredItems = section.items.filter(
        (item) => !item.adminOnly || isAdmin
      );
      if (filteredItems.length === 0) return null;
      return (
        <div key={section.title} className="py-3 first:pt-0 last:pb-0">
          <NavSectionHeader title={section.title} badge={section.badge} />
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <NavLinkItem
                key={item.href}
                item={item}
                active={isNavActive(item.href, pathname, fragment.replace("#", ""))}
                onClick={onNavigate}
              />
            ))}
          </div>
        </div>
      );
    });

  const userBlock = (
    <div className="flex items-center gap-3">
      <DashboardAvatar user={user} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {user.name}
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
          {/* Brand = tautan ke situs publik. Wajib karena Navbar global
              tidak dirender di /dashboard (lihat SiteChrome), jadi tanpa
              link ini pengguna tidak punya jalan kembali ke beranda. */}
          <Link
            href="/"
            className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200 px-5 transition-colors hover:bg-sky-50"
          >
            <AuthLogo width={36} height={36} />
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900">
                Portal Sekolah
              </span>
              <span className="block text-xs font-medium text-sky-600">
                Tunas Harapan
              </span>
            </span>
          </Link>

          <nav className="flex-1 space-y-6 overflow-y-auto subtle-scroll px-3 py-4">
            {renderNavLinks()}
          </nav>
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
                      {/* Tautan balik ke beranda (Navbar global tidak
                          dirender di /dashboard) */}
                      <Link href="/" className="flex items-center gap-2.5">
                        <AuthLogo width={32} height={32} />
                        Portal Sekolah
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="mt-4 flex flex-col space-y-0 overflow-y-auto subtle-scroll flex-1">
                    {renderNavLinks(() => setMenuOpen(false))}
                  </nav>
                  <div className="mt-auto border-t border-slate-100 pt-4">
                    {userBlock}
                    <div className="mt-3">
                      <UserDropdown
                        user={{
                          name: user.name,
                          email: user.email,
                          image: user.image,
                          initials: user.initials,
                          role: user.role,
                          statusLabel: { text: formatRoleLabel(user.role), tone: "neutral" as const },
                        }}
                        items={userDropdownItems}
                        onLogout={handleLogout}
                        showCaret={false}
                        className="w-full"
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

            <div className="flex items-center gap-1.5 text-sm">
              {pathname === "/dashboard" ? (
                <>
                  <span className="font-semibold text-slate-900">Dashboard</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-500">Ringkasan</span>
                </>
              ) : pathname === "/profile" ? (
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
              ) : pathname === "/admin" ? (
                <>
                  <span className="font-semibold text-slate-900">Admin</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-500">Panel</span>
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
              <NotificationBell activities={activities} />
              <UserDropdown
                user={{
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  initials: user.initials,
                  role: user.role,
                  statusLabel: { text: formatRoleLabel(user.role), tone: "neutral" as const },
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
