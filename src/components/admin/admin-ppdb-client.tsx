"use client";

import * as React from "react";
import {
  FileSpreadsheet,
  Search,
  Phone,
  Trash2,
  BadgeCheck,
  Loader2,
  Megaphone,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExportButton } from "@/components/ui/export-button";

export type PpdbRow = {
  id: string;
  registrationNo: string;
  fullName: string;
  email: string;
  phone: string;
  majorFirst: string;
  status: string;
  /** Pengumuman ACC dari admin — tampil di dashboard siswa status APPROVED. */
  announcement: string | null;
  createdAt: string;
};

const PPDB_STATUSES = [
  "PENDING",
  "CONTACTED",
  "APPROVED",
  "REGISTERED",
  "REJECTED",
] as const;

/** Template pengumuman ACC — admin bisa mengubahnya sebelum mengirim. */
function defaultAnnouncement(registrationNo: string) {
  return (
    `Selamat! Pendaftaran PPDB Anda (${registrationNo}) telah kami setujui. ` +
    "Silakan lanjutkan pendaftaran ulang dengan datang ke sekolah membawa berkas asli " +
    "(rapor, KK, akta kelahiran, pas foto) sesuai jadwal yang akan diinformasikan."
  );
}

export function AdminPpdbClient({
  initialRegistrations,
  statusCounts,
}: {
  initialRegistrations: PpdbRow[];
  statusCounts: Record<string, number>;
}) {
  const [rows, setRows] = React.useState(initialRegistrations);
  const [query, setQuery] = React.useState("");
  const [statusUpdating, setStatusUpdating] = React.useState<string | null>(null);
  const [counts, setCounts] = React.useState(statusCounts);

  // Dialog ACC: pendaftar yang sedang ditinjau + teks pengumuman yang diedit.
  const [accTarget, setAccTarget] = React.useState<PpdbRow | null>(null);
  const [accText, setAccText] = React.useState("");
  const [accSaving, setAccSaving] = React.useState(false);
  const [accError, setAccError] = React.useState<string | null>(null);

  const recomputeCounts = (list: PpdbRow[]) => {
    const next: Record<string, number> = {
      PENDING: 0,
      CONTACTED: 0,
      APPROVED: 0,
      REGISTERED: 0,
      REJECTED: 0,
    };
    for (const r of list) {
      next[r.status] = (next[r.status] || 0) + 1;
    }
    setCounts(next);
  };

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.registrationNo.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  /** Buka dialog ACC (approve) — default teks pengumuman bisa diedit admin. */
  const openAccDialog = (row: PpdbRow) => {
    setAccTarget(row);
    setAccText(row.announcement?.trim() || defaultAnnouncement(row.registrationNo));
    setAccError(null);
  };

  /** Simpan ACC: PATCH status APPROVED + announcement. Optimistic + rollback. */
  const handleAccConfirm = async () => {
    if (!accTarget) return;
    const text = accText.trim();
    if (!text) {
      setAccError("Pengumuman wajib diisi.");
      return;
    }
    const prev = rows;
    const { id } = accTarget;
    setAccSaving(true);
    setAccError(null);
    setRows((list) =>
      list.map((r) => (r.id === id ? { ...r, status: "APPROVED", announcement: text } : r))
    );
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED", announcement: text }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyetujui pendaftaran");
      }
      setRows((list) => {
        const next = list.map((r) =>
          r.id === id ? { ...r, status: "APPROVED", announcement: text } : r
        );
        recomputeCounts(next);
        return next;
      });
      setAccTarget(null);
    } catch (error: unknown) {
      setRows(prev);
      recomputeCounts(prev);
      setAccError(error instanceof Error ? error.message : "Gagal menyetujui.");
    } finally {
      setAccSaving(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    // ACC wajib menyertakan pengumuman → buka dialog, jangan langsung PATCH.
    if (status === "APPROVED") {
      const row = rows.find((r) => r.id === id);
      if (row) openAccDialog(row);
      return;
    }
    const prev = rows;
    setStatusUpdating(id);
    setRows((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal mengubah status");
      }
      setRows((list) => {
        const next = list.map((r) => (r.id === id ? { ...r, status } : r));
        recomputeCounts(next);
        return next;
      });
    } catch (error: unknown) {
      setRows(prev);
      recomputeCounts(prev);
      alert(error instanceof Error ? error.message : "Gagal mengubah status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pendaftaran PPDB ini?")) return;
    const prev = rows;
    setRows((list) => list.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/admin/ppdb/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menghapus");
      }
      setRows((list) => {
        const next = list.filter((r) => r.id !== id);
        recomputeCounts(next);
        return next;
      });
    } catch (error: unknown) {
      setRows(prev);
      recomputeCounts(prev);
      alert(error instanceof Error ? error.message : "Gagal menghapus");
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {PPDB_STATUSES.map((status) => (
          <Card key={status}>
            <CardContent className="p-4">
              <p className="font-caption text-[11px] font-medium text-slate-500">{status}</p>
              <p
                className={`font-h2 mt-1 ${
                  status === "PENDING"
                    ? "text-amber-600"
                    : status === "CONTACTED"
                      ? "text-sky-600"
                      : status === "APPROVED"
                        ? "text-teal-600"
                        : status === "REGISTERED"
                          ? "text-emerald-600"
                          : "text-rose-600"
                }`}
              >
                {counts[status] ?? 0}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-sky-600" />
                Daftar Pendaftaran
              </CardTitle>
              <CardDescription>
                {rows.length} pendaftaran PPDB
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Cari nama / no. reg..."
                  className="pl-9 h-9 text-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6">
            {/* min-w 520 di HP: kolom Jurusan/Tanggal sudah hidden, 800px bikin
                scroll horizontal kosong; 800px kembali di ≥sm. */}
            <table className="w-full min-w-[520px] sm:min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    No. Reg
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    Pendaftar
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden sm:table-cell">
                    Jurusan
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    Status
                  </th>
                  <th className="text-left font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3 hidden md:table-cell">
                    Tanggal Daftar
                  </th>
                  <th className="text-right font-overline text-[11px] text-slate-500 uppercase tracking-wider py-3 px-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                      Tidak ada pendaftaran.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <span className="font-caption font-semibold text-sky-600">
                          {r.registrationNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-body text-sm font-semibold text-slate-900">
                          {r.fullName}
                        </div>
                        <div className="font-caption text-[11px] text-slate-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {r.phone}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px]">
                          {r.majorFirst}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={r.status}>{r.status}</StatusBadge>
                          <select
                            value={r.status}
                            disabled={statusUpdating === r.id}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className="h-10 sm:h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
                          >
                            {PPDB_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 hidden md:table-cell">
                        <span className="font-caption text-[11px] text-slate-500">
                          {new Date(r.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status !== "APPROVED" && r.status !== "REJECTED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
                              onClick={() => openAccDialog(r)}
                            >
                              <BadgeCheck className="h-4 w-4" aria-hidden />
                              ACC
                            </Button>
                          ) : r.status === "APPROVED" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-teal-700 hover:bg-teal-50 hover:text-teal-800"
                              onClick={() => openAccDialog(r)}
                            >
                              <Megaphone className="h-4 w-4" aria-hidden />
                              Pengumuman
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost-destructive"
                            size="icon-sm"
                            aria-label="Hapus"
                            onClick={() => handleDelete(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="font-caption text-[11px] text-slate-400">
              Menampilkan {filtered.length} dari {rows.length} pendaftaran.
            </p>
            <ExportButton
              filename="ppdb-registrations"
              data={filtered.map((r) => ({
                registrationNo: r.registrationNo,
                fullName: r.fullName,
                email: r.email,
                phone: r.phone,
                majorFirst: r.majorFirst,
                status: r.status,
                createdAt: r.createdAt,
              }))}
              columns={[
                { key: "registrationNo", label: "No. Reg" },
                { key: "fullName", label: "Nama" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Telepon" },
                { key: "majorFirst", label: "Jurusan" },
                { key: "status", label: "Status" },
                { key: "createdAt", label: "Tanggal" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog ACC: setujui + tulis pengumuman untuk siswa. */}
      <Dialog open={accTarget !== null} onOpenChange={(o) => !o && !accSaving && setAccTarget(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-teal-600" aria-hidden />
              ACC Pendaftaran {accTarget?.registrationNo}
            </DialogTitle>
            <DialogDescription>
              Pendaftar <span className="font-semibold">{accTarget?.fullName}</span> akan
              disetujui dan melihat pengumuman berikut di dashboard-nya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="acc-announcement"
              className="text-sm font-semibold text-slate-700"
            >
              Pengumuman untuk siswa
            </label>
            <textarea
              id="acc-announcement"
              rows={5}
              value={accText}
              onChange={(e) => setAccText(e.target.value)}
              placeholder="Tulis pengumuman hasil ACC…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
            />
            {accError ? (
              <p role="alert" className="text-sm font-medium text-rose-600">
                {accError}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={accSaving}
              onClick={() => setAccTarget(null)}
            >
              Batal
            </Button>
            <Button type="button" disabled={accSaving} onClick={handleAccConfirm}>
              {accSaving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  Menyimpan…
                </>
              ) : accTarget?.status === "APPROVED" ? (
                "Simpan Pengumuman"
              ) : (
                <>
                  <BadgeCheck aria-hidden />
                  Setujui &amp; Umumkan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
