"use client";

import * as React from "react";
import {
  ScrollText,
  Search,
  LogIn,
  LogOut,
  UserPlus,
  UserCog,
  ShieldAlert,
  KeyRound,
  FileSpreadsheet,
  ClipboardList,
  Trash2,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { cn } from "@/lib/utils";

export type AuditRow = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  detail: string | null;
  createdAt: string;
};

const PAGE_SIZE = 15;

const ACTION_META: Record<string, { label: string; icon: LucideIcon; tone: string }> = {
  LOGIN_SUCCESS: { label: "Login", icon: LogIn, tone: "bg-emerald-50 text-emerald-600" },
  LOGIN_FAILED: { label: "Login Gagal", icon: ShieldAlert, tone: "bg-rose-50 text-rose-600" },
  LOGOUT: { label: "Logout", icon: LogOut, tone: "bg-slate-100 text-slate-500" },
  ACCOUNT_REGISTERED: { label: "Akun Baru", icon: UserPlus, tone: "bg-sky-50 text-sky-600" },
  ACCOUNT_PROFILE_UPDATED: { label: "Profil", icon: UserCog, tone: "bg-sky-50 text-sky-600" },
  PASSWORD_CHANGED: { label: "Password", icon: KeyRound, tone: "bg-amber-50 text-amber-600" },
  USER_CREATED: { label: "User Baru", icon: UserPlus, tone: "bg-emerald-50 text-emerald-600" },
  USER_UPDATED: { label: "Edit User", icon: UserCog, tone: "bg-sky-50 text-sky-600" },
  USER_ROLE_CHANGED: { label: "Ubah Role", icon: ShieldAlert, tone: "bg-violet-50 text-violet-600" },
  USER_DELETED: { label: "Hapus User", icon: Trash2, tone: "bg-rose-50 text-rose-600" },
  PPDB_STATUS_UPDATED: { label: "Status PPDB", icon: ClipboardList, tone: "bg-sky-50 text-sky-600" },
  PPDB_DELETED: { label: "Hapus PPDB", icon: Trash2, tone: "bg-rose-50 text-rose-600" },
  PPDB_REGISTERED: { label: "PPDB Baru", icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600" },
};

const FILTER_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "AUTH", label: "Autentikasi" },
  { value: "USER", label: "Pengguna" },
  { value: "PPDB", label: "PPDB" },
] as const;

function formatWib(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function AdminAuditClient({ initialRows }: { initialRows: AuditRow[] }) {
  const [query, setQuery] = React.useState("");
  const [targetFilter, setTargetFilter] = React.useState<string>("ALL");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialRows.filter((r) => {
      if (targetFilter !== "ALL" && r.targetType !== targetFilter) return false;
      if (!q) return true;
      return (
        (r.detail ?? "").toLowerCase().includes(q) ||
        (r.actorEmail ?? "").toLowerCase().includes(q) ||
        (r.actorName ?? "").toLowerCase().includes(q) ||
        r.action.toLowerCase().includes(q)
      );
    });
  }, [initialRows, query, targetFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Clamp otomatis: saat filter menyempit, halaman menyesuaikan tanpa reset manual.
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-violet-600" />
              Riwayat Aktivitas Sistem
            </CardTitle>
            <CardDescription>
              {initialRows.length} aktivitas tercatat — setiap aksi penting otomatis
              dicatat oleh sistem.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari aktivitas..."
                className="pl-9 h-9 text-sm w-full sm:w-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {/* flex-wrap: 4 tombol ≈ 290px > 280px konten card di HP 360px. */}
            <div className="flex flex-wrap rounded-xl border border-slate-200 bg-white p-0.5">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetFilter(opt.value)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    targetFilter === opt.value
                      ? "bg-violet-600 text-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">
              <ScrollText className="h-8 w-8 text-slate-300" />
            </span>
            <p className="font-body text-sm text-slate-400">
              {initialRows.length === 0
                ? "Belum ada aktivitas tercatat. Aktivitas akan muncul setelah ada aksi di sistem."
                : "Tidak ada aktivitas yang cocok dengan filter."}
            </p>
          </div>
        ) : (
          <ol className="relative space-y-1">
            {pageRows.map((row) => {
              const meta = ACTION_META[row.action] ?? {
                label: row.action,
                icon: ScrollText,
                tone: "bg-slate-100 text-slate-500",
              };
              const Icon = meta.icon;
              return (
                <li
                  key={row.id}
                  className="flex items-start gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-slate-50/80"
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      meta.tone
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-sm font-semibold text-slate-900">
                        {meta.label}
                      </span>
                      {row.targetType && row.targetType !== "AUTH" && (
                        <Badge variant="outline" className="text-[10px]">
                          {row.targetType}
                        </Badge>
                      )}
                    </div>
                    {row.detail && (
                      <p className="mt-0.5 font-caption text-xs leading-relaxed text-slate-500">
                        {row.detail}
                      </p>
                    )}
                    <p className="mt-1 font-caption text-[11px] text-slate-400">
                      {row.actorEmail ?? "Sistem"} · {formatWib(row.createdAt)} WIB
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="font-caption text-[11px] text-slate-400">
              Halaman {safePage} dari {totalPages} · {filtered.length} aktivitas
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman sebelumnya"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Halaman berikutnya"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <ExportButton
            filename="audit-log"
            data={filtered.map((r) => ({
              waktu: formatWib(r.createdAt),
              aktor: r.actorEmail ?? "Sistem",
              aksi: ACTION_META[r.action]?.label ?? r.action,
              target: r.targetType ?? "",
              detail: r.detail ?? "",
            }))}
            columns={[
              { key: "waktu", label: "Waktu (WIB)" },
              { key: "aktor", label: "Aktor" },
              { key: "aksi", label: "Aksi" },
              { key: "target", label: "Target" },
              { key: "detail", label: "Detail" },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}
