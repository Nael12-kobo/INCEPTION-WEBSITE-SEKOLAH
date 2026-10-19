"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ACADEMIC_DOMAINS,
  ACADEMIC_META,
  ATTENDANCE_LABELS,
  ATTENDANCE_STATUSES,
  ATTENDANCE_TONES,
  DAY_OPTIONS,
  GRADE_KINDS,
  formatDueAt,
  formatDateOnly,
  scorePredicate,
  type AcademicDomain,
  type AttendanceStatus,
} from "@/lib/academic";
import { JURUSAN_OPTIONS, JurusanLabel, type JurusanValue } from "@/lib/ppdb";
import type { ReactNode } from "react";

export type StudentOption = {
  id: string;
  name: string | null;
  email: string | null;
};

export type AcademicRow = {
  id: string;
  user?: { id: string; name: string | null; email: string | null };
  [key: string]: unknown;
};

export type AcademicRows = Record<AcademicDomain, AcademicRow[]>;

type FieldDef = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "time"
    | "date"
    | "datetime-local"
    | "number"
    | "select"
    | "student";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

type ColumnDef = {
  key: string;
  label: string;
  render?: (row: AcademicRow) => ReactNode;
};

type DomainConfig = {
  addLabel: string;
  fields: FieldDef[];
  defaults: Record<string, string>;
  columns: ColumnDef[];
};

/** Tanggal hari ini (zona lokal) dalam format input date. */
function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const JURUSAN_SELECT: { value: string; label: string }[] = [
  { value: "", label: "Semua jurusan" },
  ...JURUSAN_OPTIONS.map((j) => ({ value: j.value, label: j.nama })),
];

function UserCell({ row }: { row: AcademicRow }) {
  const u = row.user;
  if (!u) return <span className="text-slate-400">—</span>;
  return (
    <span className="block leading-tight">
      <span className="block text-sm font-semibold text-slate-800">
        {u.name ?? "—"}
      </span>
      <span className="block text-xs text-slate-500">{u.email ?? ""}</span>
    </span>
  );
}

function dash(value: unknown): ReactNode {
  if (value === null || value === undefined || value === "")
    return <span className="text-slate-400">—</span>;
  return <>{String(value)}</>;
}

const DOMAIN_CONFIG: Record<AcademicDomain, DomainConfig> = {
  schedule: {
    addLabel: "Jadwal",
    fields: [
      {
        key: "day",
        label: "Hari",
        type: "select",
        required: true,
        options: DAY_OPTIONS.map((d) => ({ value: d, label: d })),
      },
      { key: "startTime", label: "Jam mulai", type: "time", required: true },
      { key: "endTime", label: "Jam selesai", type: "time", required: true },
      {
        key: "subject",
        label: "Mata pelajaran",
        type: "text",
        required: true,
        placeholder: "mis. Matematika",
      },
      {
        key: "teacher",
        label: "Guru",
        type: "text",
        placeholder: "opsional",
      },
      {
        key: "major",
        label: "Jurusan",
        type: "select",
        options: JURUSAN_SELECT,
      },
    ],
    defaults: {
      day: "Senin",
      startTime: "07:30",
      endTime: "08:20",
      subject: "",
      teacher: "",
      major: "",
    },
    columns: [
      { key: "day", label: "Hari" },
      {
        key: "jam",
        label: "Jam",
        render: (r) => `${r.startTime}–${r.endTime}`,
      },
      { key: "subject", label: "Mata Pelajaran", render: (r) => dash(r.subject) },
      { key: "teacher", label: "Guru", render: (r) => dash(r.teacher) },
      {
        key: "major",
        label: "Jurusan",
        render: (r) =>
          r.major
            ? JurusanLabel(r.major as JurusanValue)
            : "Semua jurusan",
      },
    ],
  },

  grades: {
    addLabel: "Nilai",
    fields: [
      {
        key: "userId",
        label: "Siswa",
        type: "student",
        required: true,
      },
      {
        key: "subject",
        label: "Mata pelajaran",
        type: "text",
        required: true,
        placeholder: "mis. Matematika",
      },
      {
        key: "kind",
        label: "Jenis",
        type: "select",
        required: true,
        options: GRADE_KINDS.map((k) => ({ value: k, label: k })),
      },
      { key: "score", label: "Nilai (0–100)", type: "number", required: true },
      {
        key: "semester",
        label: "Semester",
        type: "text",
        placeholder: "mis. Ganjil 2026/2027",
      },
      { key: "note", label: "Catatan", type: "textarea" },
    ],
    defaults: {
      userId: "",
      subject: "",
      kind: "Tugas",
      score: "",
      semester: "",
      note: "",
    },
    columns: [
      { key: "user", label: "Siswa", render: (r) => <UserCell row={r} /> },
      { key: "subject", label: "Mata Pelajaran", render: (r) => dash(r.subject) },
      { key: "kind", label: "Jenis", render: (r) => dash(r.kind) },
      {
        key: "score",
        label: "Nilai",
        render: (r) => {
          const score = Number(r.score ?? 0);
          const pred = scorePredicate(score);
          const tone =
            pred === "A"
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
              : pred === "B"
                ? "bg-sky-50 text-sky-700 ring-sky-200"
                : pred === "C"
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200";
          return (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800">{score}</span>
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ring-1",
                  tone
                )}
              >
                {pred}
              </span>
            </span>
          );
        },
      },
      { key: "semester", label: "Semester", render: (r) => dash(r.semester) },
    ],
  },

  attendance: {
    addLabel: "Absensi",
    fields: [
      { key: "userId", label: "Siswa", type: "student", required: true },
      { key: "date", label: "Tanggal", type: "date", required: true },
      {
        key: "status",
        label: "Status",
        type: "select",
        required: true,
        options: ATTENDANCE_STATUSES.map((s) => ({
          value: s,
          label: ATTENDANCE_LABELS[s],
        })),
      },
      { key: "note", label: "Catatan", type: "text", placeholder: "opsional" },
    ],
    defaults: { userId: "", date: localToday(), status: "HADIR", note: "" },
    columns: [
      { key: "user", label: "Siswa", render: (r) => <UserCell row={r} /> },
      {
        key: "date",
        label: "Tanggal",
        render: (r) => formatDateOnly(String(r.date)),
      },
      {
        key: "status",
        label: "Status",
        render: (r) => {
          const status = String(r.status) as AttendanceStatus;
          return (
            <span
              className={cn(
                "inline-flex rounded-lg px-2 py-0.5 text-[11px] font-bold ring-1",
                ATTENDANCE_TONES[status] ??
                  "bg-slate-100 text-slate-600 ring-slate-200"
              )}
            >
              {ATTENDANCE_LABELS[status] ?? status}
            </span>
          );
        },
      },
      { key: "note", label: "Catatan", render: (r) => dash(r.note) },
    ],
  },

  tasks: {
    addLabel: "Tugas",
    fields: [
      {
        key: "title",
        label: "Judul tugas",
        type: "text",
        required: true,
        placeholder: "mis. Latihan Bab 3",
      },
      {
        key: "subject",
        label: "Mata pelajaran",
        type: "text",
        required: true,
        placeholder: "mis. Matematika",
      },
      { key: "dueAt", label: "Tenggat", type: "datetime-local" },
      {
        key: "description",
        label: "Deskripsi",
        type: "textarea",
        placeholder: "penjelasan singkat untuk siswa",
      },
      { key: "major", label: "Jurusan", type: "select", options: JURUSAN_SELECT },
    ],
    defaults: {
      title: "",
      subject: "",
      dueAt: "",
      description: "",
      major: "",
    },
    columns: [
      { key: "title", label: "Judul", render: (r) => dash(r.title) },
      { key: "subject", label: "Mata Pelajaran", render: (r) => dash(r.subject) },
      {
        key: "dueAt",
        label: "Tenggat",
        render: (r) => formatDueAt((r.dueAt as string) ?? null),
      },
      {
        key: "major",
        label: "Jurusan",
        render: (r) =>
          r.major ? JurusanLabel(r.major as JurusanValue) : "Semua jurusan",
      },
    ],
  },

  "exam-card": {
    addLabel: "Kartu Ujian",
    fields: [
      { key: "userId", label: "Siswa", type: "student", required: true },
      {
        key: "examName",
        label: "Nama ujian",
        type: "text",
        required: true,
        placeholder: "mis. UTS Ganjil 2026/2027",
      },
      { key: "startDate", label: "Tanggal mulai", type: "date", required: true },
      { key: "endDate", label: "Tanggal selesai", type: "date" },
      {
        key: "room",
        label: "Ruang",
        type: "text",
        required: true,
        placeholder: "mis. R-01",
      },
      { key: "seatNo", label: "Nomor duduk", type: "text", placeholder: "mis. 12" },
      {
        key: "participantNo",
        label: "Nomor peserta",
        type: "text",
        placeholder: "mis. 0045",
      },
      { key: "note", label: "Catatan", type: "textarea" },
    ],
    defaults: {
      userId: "",
      examName: "UTS",
      startDate: localToday(),
      endDate: "",
      room: "",
      seatNo: "",
      participantNo: "",
      note: "",
    },
    columns: [
      { key: "user", label: "Siswa", render: (r) => <UserCell row={r} /> },
      { key: "examName", label: "Ujian", render: (r) => dash(r.examName) },
      {
        key: "tanggal",
        label: "Jadwal",
        render: (r) => {
          const start = formatDateOnly(String(r.startDate));
          const end = r.endDate ? formatDateOnly(String(r.endDate)) : null;
          return <>{end ? `${start} – ${end}` : start}</>;
        },
      },
      { key: "room", label: "Ruang", render: (r) => dash(r.room) },
      { key: "seatNo", label: "No. Duduk", render: (r) => dash(r.seatNo) },
      { key: "participantNo", label: "No. Peserta", render: (r) => dash(r.participantNo) },
    ],
  },
};

export function AcademicAdminClient({
  initialRows,
  students,
}: {
  initialRows: AcademicRows;
  students: StudentOption[];
}) {
  const [domain, setDomain] = React.useState<AcademicDomain>("schedule");
  const [rows, setRows] = React.useState<AcademicRows>(initialRows);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<AcademicRow | null>(null);
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const cfg = DOMAIN_CONFIG[domain];
  const list = rows[domain] ?? [];

  const refresh = React.useCallback(async (d: AcademicDomain) => {
    const res = await fetch(`/api/admin/academic/${d}`);
    if (!res.ok) return;
    const data = (await res.json()) as { rows: AcademicRow[] };
    setRows((prev) => ({ ...prev, [d]: data.rows }));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...cfg.defaults });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (row: AcademicRow) => {
    setEditing(row);
    const next: Record<string, string> = {};
    for (const field of cfg.fields) {
      const value = row[field.key];
      next[field.key] =
        value === null || value === undefined ? "" : String(value);
    }
    setForm(next);
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    for (const field of cfg.fields) {
      if (field.required && !String(form[field.key] ?? "").trim()) {
        setFormError(`${field.label} wajib diisi.`);
        return;
      }
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(
        editing
          ? `/api/admin/academic/${domain}/${editing.id}`
          : `/api/admin/academic/${domain}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Gagal menyimpan data.");
      }
      await refresh(domain);
      setOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Gagal menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AcademicRow) => {
    if (!confirm("Hapus data ini? Tindakan tidak bisa dibatalkan.")) return;
    const res = await fetch(`/api/admin/academic/${domain}/${row.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Gagal menghapus data.");
      return;
    }
    await refresh(domain);
  };

  return (
    <div className="space-y-5">
      {/* Tab domain */}
      <div className="flex flex-wrap gap-1.5">
        {ACADEMIC_DOMAINS.map((d) => {
          const active = d === domain;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setDomain(d)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-slate-900 text-white"
                  : "bg-card text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {ACADEMIC_META[d].label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {(rows[d] ?? []).length}
              </span>
            </button>
          );
        })}
      </div>

      <Card className="bg-card">
        <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="font-h4">
              {ACADEMIC_META[domain].title}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              {ACADEMIC_META[domain].description}
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah {cfg.addLabel}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto subtle-scroll">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {cfg.columns.map((col) => (
                    <th
                      key={col.key}
                      className="py-3 px-3 text-left font-overline text-[11px] uppercase tracking-wider text-slate-500"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="py-3 px-3 text-right font-overline text-[11px] uppercase tracking-wider text-slate-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td
                      colSpan={cfg.columns.length + 1}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Belum ada data — klik “Tambah {cfg.addLabel}” untuk
                      mengisi.
                    </td>
                  </tr>
                ) : (
                  list.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      {cfg.columns.map((col) => (
                        <td
                          key={col.key}
                          className="py-3.5 px-3 text-sm text-slate-700"
                        >
                          {col.render
                            ? col.render(row)
                            : dash(row[col.key])}
                        </td>
                      ))}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Ubah"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost-destructive"
                            size="icon-sm"
                            aria-label="Hapus"
                            onClick={() => handleDelete(row)}
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
        </CardContent>
      </Card>

      {/* Dialog form tambah/ubah */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing
                  ? `Ubah ${cfg.addLabel}`
                  : `Tambah ${cfg.addLabel}`}
              </DialogTitle>
              <DialogDescription>
                Data langsung tampil di portal siswa setelah disimpan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 sm:grid-cols-2">
              {cfg.fields.map((field) => (
                <div
                  key={field.key}
                  className={
                    field.type === "textarea" ? "sm:col-span-2" : undefined
                  }
                >
                  <label
                    htmlFor={`field-${field.key}`}
                    className="mb-1 block text-xs font-semibold text-slate-600"
                  >
                    {field.label}
                    {field.required ? (
                      <span className="text-rose-500"> *</span>
                    ) : null}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      id={`field-${field.key}`}
                      rows={2}
                      value={form[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  ) : field.type === "select" ||
                    field.type === "student" ? (
                    <select
                      id={`field-${field.key}`}
                      value={form[field.key] ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    >
                      {field.type === "student" ? (
                        <>
                          <option value="">Pilih siswa…</option>
                          {students.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name ?? s.email}
                              {s.email ? ` — ${s.email}` : ""}
                            </option>
                          ))}
                        </>
                      ) : (
                        (field.options ?? []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))
                      )}
                    </select>
                  ) : (
                    <input
                      id={`field-${field.key}`}
                      type={field.type}
                      min={field.type === "number" ? 0 : undefined}
                      max={field.type === "number" ? 100 : undefined}
                      step={field.type === "number" ? "0.5" : undefined}
                      value={form[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  )}
                </div>
              ))}
            </div>

            {formError ? (
              <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {formError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
