"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldX,
  LogOut,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UserDropdownUser {
  name: string;
  email: string;
  image?: string | null;
  initials?: string;
  role?: string;
  twoFactorEnabled?: boolean;
}

export interface UserDropdownItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export interface UserDropdownProps {
  user: UserDropdownUser;
  items?: UserDropdownItem[];
  onLogout?: () => void;
  className?: string;
  showCaret?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({
  user,
  size = "md",
}: {
  user: UserDropdownUser;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg"
      ? "h-12 w-12 text-sm"
      : size === "sm"
      ? "h-8 w-8 text-[10px]"
      : "h-9 w-9 text-xs";
  const initials = user.initials ?? getInitials(user.name);

  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name}
        width={48}
        height={48}
        unoptimized
        className={cn(
          "rounded-full object-cover ring-2 ring-sky-100",
          cls
        )}
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
      {initials}
    </span>
  );
}

export function UserDropdown({
  user,
  items = [],
  onLogout,
  className,
  showCaret = true,
}: UserDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const handleItem = (item: UserDropdownItem) => {
    setOpen(false);
    item.onClick?.();
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group inline-flex items-center gap-2 rounded-full p-1 pr-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 hover:bg-sky-50 sm:gap-2.5 sm:pl-1.5 sm:pr-3 sm:py-1"
      >
        <Avatar user={user} size="md" />
        <div className="hidden min-w-0 flex-col items-start text-left sm:flex">
          <span className="truncate font-caption text-xs font-semibold text-slate-800 max-w-[8rem]">
            {user.name}
          </span>
          {user.role && (
            <span className="truncate text-[10px] font-medium text-sky-600 max-w-[8rem]">
              {user.role}
            </span>
          )}
        </div>
        {showCaret && (
          <ChevronDown
            className={cn(
              "hidden h-3.5 w-3.5 text-slate-400 transition-transform duration-150 sm:block",
              open ? "rotate-180 text-sky-600" : "group-hover:text-slate-600"
            )}
            strokeWidth={2.25}
          />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "animate-fade-in elevation-4 absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-sky-100 bg-white py-1.5 shadow-xl shadow-sky-100/40",
            "left-0 sm:left-auto sm:right-0"
          )}
        >
          <div className="space-y-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Avatar user={user} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-h4 text-sm font-bold text-slate-900">
                  {user.name}
                </p>
                <p className="truncate font-caption text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {user.role && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 font-caption text-[10px] font-semibold text-sky-700">
                  {user.role}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-caption text-[10px] font-semibold",
                  user.twoFactorEnabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                )}
              >
                {user.twoFactorEnabled ? (
                  <>
                    <ShieldCheck className="h-3 w-3" strokeWidth={2.25} />
                    2FA Aktif
                  </>
                ) : (
                  <>
                    <ShieldX className="h-3 w-3" strokeWidth={2.25} />
                    2FA Belum
                  </>
                )}
              </span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="py-1">
              {items.map((item, idx) => {
                const Icon = item.icon;
                const content = (
                  <>
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          item.danger ? "text-rose-500" : "text-slate-500"
                        )}
                        strokeWidth={2}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </>
                );
                const baseClass = cn(
                  "flex w-full items-center gap-3 px-3.5 py-2.5 font-body text-sm font-medium transition-colors focus:outline-none",
                  item.danger
                    ? "text-rose-700 hover:bg-rose-50 focus:bg-rose-50"
                    : "text-slate-700 hover:bg-sky-50 hover:text-sky-800 focus:bg-sky-50 focus:text-sky-800"
                );
                if (item.href) {
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setOpen(false)}
                      className={baseClass}
                      style={{ textDecoration: "none" }}
                    >
                      {content}
                    </Link>
                  );
                }
                if (idx > 0 && items[idx - 1]?.danger !== item.danger && item.danger) {
                  return (
                    <React.Fragment key={item.key}>
                      <div className="mx-2 my-1 h-px bg-slate-100" />
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleItem(item)}
                        className={baseClass}
                      >
                        {content}
                      </button>
                    </React.Fragment>
                  );
                }
                return (
                  <button
                    key={item.key}
                    type="button"
                    role="menuitem"
                    onClick={() => handleItem(item)}
                    className={baseClass}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          )}

          {onLogout && (
            <>
              <div className="mx-2 h-px bg-slate-100" />
              <div className="py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-3.5 py-2.5 font-body text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus:bg-rose-50"
                >
                  <LogOut
                    className="h-4 w-4 shrink-0 text-rose-500"
                    strokeWidth={2}
                  />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
