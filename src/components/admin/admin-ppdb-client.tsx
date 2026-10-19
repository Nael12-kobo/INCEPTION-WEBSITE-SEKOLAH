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
  GraduationCap,
  LogIn,
  Download,
  Eye,
  FileImage,
  FileText,
  FolderOpen,
  AlertCircle,
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
import { cn } from "@/lib/utils";
import {
  PPDB_DOC_KINDS,
  PPDB_DOC_META,
  PPDB_DOC_TOTAL,
  PPDB_PHOTO_META,
  PPDB_REVIEW_NOTE_MAX,
  PPDB_REVIEW_STATUS_LABELS,
} from "@/lib/ppdb-documents";

/** Satu berkas kelengkapan PPDB yang diunggah siswa. */
export type PpdbDocumentRow = {
  id: string;
  kind: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: string;
};

/** Penilaian admin untuk satu item berkas (termasuk pas foto). */
export type PpdbReviewRow = {
  kind: string;
  status: string;
  note: string | null;
};

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
  /** Akun siswa — dipakai untuk membuka foto & berkas di panel admin. */
  userId: string;
  hasPhoto: boolean;
  documents: PpdbDocumentRow[];
  /** Penilaian admin per item (Sesuai / Perlu perbaikan) + catatan. */
  reviews: PpdbReviewRow[];
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

/** Jumlah item berkas lengkap: 4 jenis dokumen (lihat lib/ppdb-documents) + pas foto. */
function berkasDoneCount(row: PpdbRow): number {
  return (
    PPDB_DOC_KINDS.filter((kind) =>
      row.documents.some((d) => d.kind === kind)
    ).length + (row.hasPhoto ? 1 : 0)
  );
}

function fileSizeLabel(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/** Tombol "Berkas" di kolom aksi + lencana ringkasan (mis. 3/5). */
function BerkasButton({
  row,
  onOpen,
}: {
  row: PpdbRow;
  onOpen: (row: PpdbRow) => void;
}) {
  const done = berkasDoneCount(row);
  const complete = done >= PPDB_DOC_TOTAL;
  const needsFix = row.reviews.some((r) => r.status === "PERLU_PERBAIKAN");
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8"
      onClick={() => onOpen(row)}
      title={
        needsFix
          ? "Ada berkas yang perlu diperbaiki siswa — buka detail"
          : "Berkas kelengkapan yang diunggah siswa"
      }
    >
      <FolderOpen className="h-4 w-4" aria-hidden />
      Berkas
      <span
        className={cn(
          "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          needsFix
            ? "bg-amber-100 text-amber-700"
            : complete
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-600"
        )}
      >
        {done}/{PPDB_DOC_TOTAL}
      </span>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Penilaian admin per item berkas (Sesuai / Perlu perbaikan).         */
/* ------------------------------------------------------------------ */

const REVIEW_STATUS_LABELS = PPDB_REVIEW_STATUS_LABELS as Record<string, string>;

const reviewPillBase =
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50";

/** Kontrol penilaian satu item berkas — dipakai di dialog Berkas. */
function ReviewControls({
  userId,
  kind,
  review,
  onSaved,
  onCleared,
}: {
  userId: string;
  kind: string;
  review: PpdbReviewRow | undefined;
  onSaved: (review: PpdbReviewRow) => void;
  onCleared: (kind: string) => void;
}) {
  const [status, setStatus] = React.useState<string>(review?.status ?? "");
  const [note, setNote] = React.useState(review?.note ?? "");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sinkron saat dialog dibuka untuk siswa lain, atau data berubah dari luar
  // (mis. penilaian lain disimpan) — jangan biarkan draft lama menempel.
  React.useEffect(() => {
    setStatus(review?.status ?? "");
    setNote(review?.note ?? "");
    setError(null);
  }, [userId, kind, review?.status, review?.note]);

  const dirty =
    status !== (review?.status ?? "") || note !== (review?.note ?? "");

  const save = async () => {
    if (saving || !status || !dirty) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ppdb/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kind, status, note }),
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; review?: PpdbReviewRow }
        | null;
      if (!res.ok || !data?.review) {
        throw new Error(data?.error ?? "Gagal menyimpan penilaian.");
      }
      onSaved(data.review);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan penilaian.");
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/ppdb/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, kind }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Gagal menghapus penilaian.");
      }
      onCleared(kind);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus penilaian.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2.5 rounded-lg border border-dashed border-slate-200 bg-card px-2.5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Penilaian admin
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setStatus("SESUAI")}
            disabled={saving}
            className={cn(
              reviewPillBase,
              status === "SESUAI"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-card text-slate-500 hover:border-slate-300"
            )}
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
            Sesuai
          </button>
          <button
            type="button"
            onClick={() => setStatus("PERLU_PERBAIKAN")}
            disabled={saving}
            className={cn(
              reviewPillBase,
              status === "PERLU_PERBAIKAN"
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-card text-slate-500 hover:border-slate-300"
            )}
          >
            <AlertCircle className="h-3.5 w-3.5" aria-hidden />
            Perlu perbaikan
          </button>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={PPDB_REVIEW_NOTE_MAX}
          placeholder="Catatan untuk siswa (opsional)"
          className="h-8 text-xs"
          disabled={saving}
        />
        <Button
          type="button"
          size="sm"
          className="h-8 shrink-0"
          onClick={() => void save()}
          disabled={saving || !status || !dirty}
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Simpan
        </Button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {review && !dirty ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold",
              review.status === "SESUAI" ? "text-emerald-600" : "text-amber-600"
            )}
          >
            {review.status === "SESUAI" ? (
              <BadgeCheck className="h-3 w-3" aria-hidden />
            ) : (
              <AlertCircle className="h-3 w-3" aria-hidden />
            )}
            Tersimpan: {REVIEW_STATUS_LABELS[review.status] ?? review.status}
            {review.note ? ` — “${review.note}”` : ""}
          </span>
        ) : dirty ? (
          <span className="text-[11px] font-medium text-amber-600">
            Perubahan belum disimpan.
          </span>
        ) : (
          <span className="text-[11px] text-slate-400">Belum dinilai.</span>
        )}
        {review ? (
          <button
            type="button"
            onClick={() => void clear()}
            disabled={saving}
            className="ml-auto text-[11px] font-medium text-slate-400 underline-offset-2 hover:text-rose-600 hover:underline disabled:opacity-50"
          >
            Hapus penilaian
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1 text-[11px] font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

/** Dialog daftar berkas siswa: pas foto + 4 jenis dokumen, bisa dilihat,
 *  diunduh, dan dinilai per item (Sesuai / Perlu perbaikan + catatan). */
function BerkasDialog({
  target,
  onClose,
  onReviewSaved,
  onReviewCleared,
}: {
  target: PpdbRow | null;
  onClose: () => void;
  onReviewSaved: (userId: string, review: PpdbReviewRow) => void;
  onReviewCleared: (userId: string, kind: string) => void;
}) {
  const reviewOf = (kind: string) =>
    target?.reviews.find((r) => r.kind === kind);
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-sky-600" aria-hidden />
            Berkas — {target?.fullName}
          </DialogTitle>
          <DialogDescription>
            {target
              ? `${target.registrationNo} · ${berkasDoneCount(target)} dari ${PPDB_DOC_TOTAL} berkas lengkap. Siswa dapat menambah/mengganti berkas kapan saja dari dashboard-nya.`
              : null}
          </DialogDescription>
        </DialogHeader>

        {/* Daftar panjang (rapor mis. 5 file) — beri scroll sendiri. */}
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {/* Pas foto — kolom User.photoBytes, endpoint foto yang sudah ada. */}
          <section className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">
                {PPDB_PHOTO_META.label}
              </p>
              <Badge
                variant={target?.hasPhoto ? "secondary" : "outline"}
                className="text-[10px]"
              >
                {target?.hasPhoto ? "Lengkap" : "Belum"}
              </Badge>
            </div>
            {target?.hasPhoto ? (
              <div className="mt-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- foto dari API ber-sesi, bukan aset statis */}
                <img
                  src={`/api/admin/users/${target.userId}/photo`}
                  alt={`Pas foto ${target.fullName}`}
                  className="h-16 w-12 rounded-lg border border-slate-200 object-cover"
                />
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a
                      href={`/api/admin/users/${target.userId}/photo`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      Lihat
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8">
                    <a
                      href={`/api/admin/users/${target.userId}/photo?download=1`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      Unduh
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Belum diunggah siswa.</p>
            )}
            {target ? (
              <ReviewControls
                userId={target.userId}
                kind="FOTO"
                review={reviewOf("FOTO")}
                onSaved={(review) => onReviewSaved(target.userId, review)}
                onCleared={(kind) => onReviewCleared(target.userId, kind)}
              />
            ) : null}
          </section>

          {PPDB_DOC_KINDS.map((kind) => {
            const files =
              target?.documents.filter((d) => d.kind === kind) ?? [];
            return (
              <section
                key={kind}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    {PPDB_DOC_META[kind].label}
                  </p>
                  <Badge
                    variant={files.length > 0 ? "secondary" : "outline"}
                    className="text-[10px]"
                  >
                    {files.length > 0 ? `${files.length} file` : "Belum"}
                  </Badge>
                </div>
                {files.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 bg-card px-2.5 py-1.5"
                      >
                        {file.mime === "application/pdf" ? (
                          <FileText
                            className="h-4 w-4 shrink-0 text-rose-500"
                            aria-hidden
                          />
                        ) : (
                          <FileImage
                            className="h-4 w-4 shrink-0 text-sky-500"
                            aria-hidden
                          />
                        )}
                        <span
                          className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700"
                          title={file.fileName}
                        >
                          {file.fileName}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                          {fileSizeLabel(file.size)}
                        </span>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                        >
                          <a
                            href={`/api/admin/ppdb/documents/${file.id}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Lihat"
                            aria-label={`Lihat ${file.fileName}`}
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                        >
                          <a
                            href={`/api/admin/ppdb/documents/${file.id}?download=1`}
                            target="_blank"
                            rel="noreferrer"
                            title="Unduh"
                            aria-label={`Unduh ${file.fileName}`}
                          >
                            <Download className="h-3.5 w-3.5" aria-hidden />
                          </a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Belum ada berkas.</p>
                )}
                {target ? (
                  <ReviewControls
                    userId={target.userId}
                    kind={kind}
                    review={reviewOf(kind)}
                    onSaved={(review) => onReviewSaved(target.userId, review)}
                    onCleared={(k) => onReviewCleared(target.userId, k)}
                  />
                ) : null}
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
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

  // Dialog berkas: lihat/unduh semua unggahan siswa untuk pendaftar ini.
  const [berkasTarget, setBerkasTarget] = React.useState<PpdbRow | null>(null);

  /** Simpan/hapus penilaian di state lokal agar tabel & dialog langsung sinkron. */
  const applyReview = (
    userId: string,
    review: PpdbReviewRow | null,
    kind?: string
  ) => {
    const replace = (list: PpdbReviewRow[]) =>
      review
        ? [...list.filter((r) => r.kind !== review.kind), review]
        : list.filter((r) => r.kind !== kind);
    setRows((list) =>
      list.map((r) =>
        r.userId === userId ? { ...r, reviews: replace(r.reviews) } : r
      )
    );
    setBerkasTarget((t) =>
      t && t.userId === userId ? { ...t, reviews: replace(t.reviews) } : t
    );
  };

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

  /**
   * Loloskan: jadikan pendaftar siswa aktif (status REGISTERED).
   * Server juga men-verifikasi akun siswanya — portal siswa terbuka penuh.
   */
  const handleLoloskan = async (row: PpdbRow) => {
    const konfirmasi = confirm(
      `Jadikan ${row.fullName} siswa aktif?\n` +
        `Pendaftaran ${row.registrationNo} diloloskan (REGISTERED), akun siswa ` +
        "terverifikasi, dan portal siswanya terbuka penuh."
    );
    if (!konfirmasi) return;
    const prev = rows;
    setRows((list) =>
      list.map((r) => (r.id === row.id ? { ...r, status: "REGISTERED" } : r))
    );
    try {
      const res = await fetch(`/api/admin/ppdb/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REGISTERED" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal meloloskan pendaftar");
      }
      setRows((list) => {
        const next = list.map((r) =>
          r.id === row.id ? { ...r, status: "REGISTERED" } : r
        );
        recomputeCounts(next);
        return next;
      });
    } catch (error: unknown) {
      setRows(prev);
      recomputeCounts(prev);
      alert(
        error instanceof Error ? error.message : "Gagal meloloskan pendaftar."
      );
    }
  };

  /** Pindah sesi ke akun siswa pendaftar ini (mode "masuk sebagai siswa"). */
  const handleSwitchToStudent = async (row: PpdbRow) => {
    try {
      const res = await fetch(`/api/admin/users/${row.userId}/impersonate`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "");
      }
      // Muat ulang penuh: semua halaman memakai sesi siswa hasil pindah.
      window.location.assign("/dashboard");
    } catch (error) {
      alert(
        error instanceof Error && error.message
          ? error.message
          : "Gagal masuk sebagai siswa ini."
      );
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
                            className="h-10 sm:h-8 rounded-lg border border-slate-200 bg-card px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/60"
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
                          <BerkasButton row={r} onOpen={setBerkasTarget} />
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
                          {r.status !== "REGISTERED" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800"
                              title="Loloskan — jadikan siswa aktif (REGISTERED)"
                              onClick={() => handleLoloskan(r)}
                            >
                              <GraduationCap className="h-4 w-4" aria-hidden />
                              Loloskan
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                              title="Masuk sebagai siswa ini"
                              onClick={() => handleSwitchToStudent(r)}
                            >
                              <LogIn className="h-4 w-4" aria-hidden />
                              Masuk Siswa
                            </Button>
                          )}
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
                berkas: `${berkasDoneCount(r)}/${PPDB_DOC_TOTAL}`,
                createdAt: r.createdAt,
              }))}
              columns={[
                { key: "registrationNo", label: "No. Reg" },
                { key: "fullName", label: "Nama" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Telepon" },
                { key: "majorFirst", label: "Jurusan" },
                { key: "status", label: "Status" },
                { key: "berkas", label: "Berkas" },
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
              className="w-full rounded-xl border border-slate-200 bg-card px-3.5 py-2.5 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
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

      {/* Dialog berkas: semua unggahan siswa (pas foto + dokumen). */}
      <BerkasDialog
        target={berkasTarget}
        onClose={() => setBerkasTarget(null)}
        onReviewSaved={(userId, review) => applyReview(userId, review)}
        onReviewCleared={(userId, kind) => applyReview(userId, null, kind)}
      />
    </>
  );
}
