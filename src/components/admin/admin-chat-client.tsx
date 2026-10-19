"use client";

import * as React from "react";
import {
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Users,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ChatFeedbackRow = {
  id: string;
  question: string;
  answer: string;
  rating: "UP" | "DOWN";
  comment: string | null;
  userName: string | null;
  userEmail: string | null;
  createdAt: string;
};

export type ChatSummary = {
  totalUp: number;
  totalDown: number;
  total: number;
  helpfulPct: number | null;
  conversationCount: number;
  userCount: number;
};

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

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hint?: string;
  tone: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("rounded-xl p-3", tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminChatClient({
  summary,
  initialRows,
}: {
  summary: ChatSummary;
  initialRows: ChatFeedbackRow[];
}) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"ALL" | "UP" | "DOWN">("ALL");

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialRows.filter((r) => {
      if (filter !== "ALL" && r.rating !== filter) return false;
      if (!q) return true;
      return (
        r.question.toLowerCase().includes(q) ||
        r.answer.toLowerCase().includes(q) ||
        (r.comment ?? "").toLowerCase().includes(q) ||
        (r.userEmail ?? "").toLowerCase().includes(q)
      );
    });
  }, [initialRows, query, filter]);

  return (
    <div className="space-y-6">
      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ThumbsUp}
          label="Jawaban membantu"
          value={
            summary.helpfulPct === null ? "—" : `${summary.helpfulPct}%`
          }
          hint={`${summary.totalUp} dari ${summary.total} penilaian`}
          tone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={ThumbsDown}
          label="Tidak membantu"
          value={String(summary.totalDown)}
          hint="Perlu diperiksa & diperbaiki"
          tone="bg-rose-50 text-rose-600"
        />
        <StatCard
          icon={MessageSquare}
          label="Percakapan tersimpan"
          value={String(summary.conversationCount)}
          hint="Milik user login"
          tone="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={Users}
          label="User pernah chat"
          value={String(summary.userCount)}
          hint="Akun unik"
          tone="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Daftar feedback */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Feedback Pengguna</CardTitle>
              <CardDescription>
                Penilaian 👍/👎 per jawaban AI beserta pertanyaannya — gunakan
                untuk menemukan topik knowledge yang perlu diperbaiki.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-slate-200 p-0.5">
                {(
                  [
                    { value: "ALL", label: "Semua" },
                    { value: "DOWN", label: "👎" },
                    { value: "UP", label: "👍" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilter(opt.value)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      filter === opt.value
                        ? "bg-slate-900 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari pertanyaan…"
                  className="h-9 w-44 pl-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              {initialRows.length === 0
                ? "Belum ada feedback. Muncul setelah user menekan 👍/👎 di chat."
                : "Tidak ada feedback yang cocok dengan pencarian."}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((r) => (
                <li key={r.id} className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        r.rating === "UP"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-rose-200 bg-rose-50 text-rose-600"
                      )}
                    >
                      {r.rating === "UP" ? "👍 Membantu" : "👎 Tidak membantu"}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {formatWib(r.createdAt)}
                    </span>
                    <span className="truncate text-xs text-slate-500">
                      {r.userEmail ?? r.userName ?? "Tamu (belum login)"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Pertanyaan
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      {r.question}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Jawaban AI
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">
                      {r.answer}
                    </p>
                  </div>
                  {r.comment && (
                    <p className="text-sm italic text-slate-500">
                      Komentar: “{r.comment}”
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
