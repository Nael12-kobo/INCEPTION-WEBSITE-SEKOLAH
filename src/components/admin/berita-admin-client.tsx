"use client";

import * as React from "react";
import {
  CalendarDays,
  Copy,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { parseJsonSafe } from "@/components/admin/api-json";
import { useToast } from "@/components/ui/toast";
import type { BeritaRecord } from "@/lib/berita-server";
import { BLOG_URL, formatTanggal, type Berita as BeritaItem } from "@/lib/blog";

type FormState = {
  judul: string;
  kategori: string;
  tanggal: string; // "YYYY-MM-DDTHH:mm" (waktu perangkat admin)
  slug: string;
  ringkasan: string;
  konten: string;
  gambar: string;
  url: string;
  sourceUrl: string;
  published: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

/** ISO (UTC) → value input datetime-local (waktu perangkat). */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Hari ini (waktu perangkat) untuk input datetime-local. */
function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

function kosong(): FormState {
  return {
    judul: "",
    kategori: "Berita",
    tanggal: nowLocalInput(),
    slug: "",
    ringkasan: "",
    konten: "",
    gambar: "",
    url: "",
    sourceUrl: "",
    published: true,
  };
}

function dariRecord(row: BeritaRecord): FormState {
  return {
    judul: row.judul,
    kategori: row.kategori,
    tanggal: toLocalInput(row.tanggal),
    slug: row.slug,
    ringkasan: row.ringkasan,
    konten: row.konten ?? "",
    gambar: row.gambar ?? "",
    url: row.url ?? "",
    sourceUrl: row.sourceUrl ?? "",
    published: row.published,
  };
}

function Field({
  id,
  label,
  required,
  hint,
  span,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={span ? "sm:col-span-2" : undefined}>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold text-slate-600"
      >
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function BeritaAdminClient({
  initialRows,
  initialWeb,
}: {
  initialRows: BeritaRecord[];
  initialWeb: BeritaItem[];
}) {
  const toast = useToast();
  const [rows, setRows] = React.useState<BeritaRecord[]>(initialRows);
  const [webRows, setWebRows] = React.useState<BeritaItem[]>(initialWeb);
  const [importing, setImporting] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BeritaRecord | null>(null);
  const [form, setForm] = React.useState<FormState>(kosong);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BeritaRecord | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/admin/berita");
    if (!res.ok) return;
    const data = await parseJsonSafe<{ rows: BeritaRecord[] }>(res);
    if (data?.rows) setRows(data.rows);
  }, []);

  const importFromWebsite = async (item: BeritaItem) => {
    if (importing) return;
    setImporting(item.id);
    try {
      const response = await fetch("/api/admin/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: item.judul,
          kategori: item.kategori.slice(0, 40),
          tanggal: item.iso,
          ringkasan: item.ringkasan,
          // Isi awal menggunakan ringkasan; admin dapat melengkapi artikel
          // setelah disalin supaya tidak mengklaim punya seluruh teks sumber.
          konten: item.ringkasan,
          gambar: item.gambar ?? "",
          url: "",
          sourceUrl: item.url,
          published: true,
        }),
      });
      if (!response.ok) {
        const data = await parseJsonSafe<{ error?: string }>(response);
        throw new Error(data?.error || "Gagal menyalin berita dari situs resmi.");
      }
      toast.success("Berita disalin ke panel. Sekarang bisa diedit secara lokal.");
      setWebRows((current) => current.filter((row) => row.url !== item.url));
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Gagal menyalin berita.");
    } finally {
      setImporting(null);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm(kosong());
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (row: BeritaRecord) => {
    setEditing(row);
    setForm(dariRecord(row));
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.judul.trim().length < 3) {
      setFormError("Judul minimal 3 karakter.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(
        editing ? `/api/admin/berita/${editing.id}` : "/api/admin/berita",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            sourceUrl: form.sourceUrl || null,
            // Konversi ke ISO (UTC) supaya server tidak menebak zona waktu.
            tanggal: form.tanggal
              ? new Date(form.tanggal).toISOString()
              : undefined,
          }),
        },
      );
      if (!res.ok) {
        const data = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(data?.error || "Gagal menyimpan data.");
      }
      toast.success(
        editing ? "Berita berhasil diperbarui." : "Berita berhasil ditambahkan.",
      );
      setOpen(false);
      await refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/berita/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(data?.error || "Gagal menghapus data.");
      }
      toast.success("Berita dihapus.");
      setDeleteTarget(null);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="bg-card">
        <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="font-h4">Berita Buatan Admin</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Tampil di homepage bersama berita dari situs resmi, dan punya
              halaman detail sendiri di{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">/berita/…</code>.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah Berita
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto subtle-scroll">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Judul", "Kategori", "Tanggal", "Status", "Aksi"].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-3 text-left font-overline text-[11px] uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Belum ada berita buatan admin — klik “Tambah Berita”.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3.5 px-3 max-w-[280px]">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {row.judul}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          /berita/{row.slug}
                        </span>
                        {row.sourceUrl ? (
                          <span className="mt-1 block text-[11px] font-medium text-sky-700">
                            Salinan berita situs resmi
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-3 text-sm text-slate-600">
                        {row.kategori}
                      </td>
                      <td className="py-3.5 px-3 text-sm text-slate-600">
                        {formatTanggal(row.tanggal)}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={row.published ? "success" : "outline"}
                          className={row.published ? undefined : "text-slate-500"}
                        >
                          {row.published ? "Terbit" : "Draf"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Ubah"
                            disabled={deleting}
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="h-4 w-4 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost-destructive"
                            size="icon-sm"
                            aria-label="Hapus"
                            disabled={deleting}
                            onClick={() => setDeleteTarget(row)}
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

      {/* Berita otomatis dari situs WordPress — read-only. */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-h4">Berita dari Situs Resmi</CardTitle>
          <p className="mt-1 text-sm text-slate-500">
            Ditarik otomatis dari{" "}
            <a
              href={BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-700"
            >
              tunasharapan.info
            </a>
            . Gunakan tombol “Salin untuk diedit” untuk membuat salinan lokal.
            Perubahan di panel ini tidak mengubah artikel asli di WordPress.
          </p>
        </CardHeader>
        <CardContent>
          {webRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Situs berita tidak bisa dihubungi saat halaman ini dimuat.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {webRows.map((b) => (
                <li key={b.id} className="flex flex-col items-start gap-3 py-3 sm:flex-row">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <Globe className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-sm font-semibold text-slate-800 hover:text-sky-700"
                    >
                      {b.judul}
                    </a>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" aria-hidden />
                        {b.tanggal}
                      </span>
                      <span>·</span>
                      <span>{b.kategori}</span>
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={importing !== null}
                    onClick={() => void importFromWebsite(b)}
                  >
                    {importing === b.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                    Salin untuk diedit
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Form tambah/ubah berita */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Ubah Berita" : "Tambah Berita"}
              </DialogTitle>
              <DialogDescription>
                Berita ini tampil di homepage bersama berita otomatis dari situs
                sekolah.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 sm:grid-cols-2">
              <Field id="b-judul" label="Judul" required span>
                <input
                  id="b-judul"
                  className={inputClass}
                  value={form.judul}
                  maxLength={180}
                  placeholder="mis. Siswa TJKT Juara 1 Lomba Jaringan"
                  onChange={(e) => set("judul", e.target.value)}
                />
              </Field>
              <Field id="b-kategori" label="Kategori">
                <input
                  id="b-kategori"
                  className={inputClass}
                  value={form.kategori}
                  maxLength={40}
                  placeholder="mis. Prestasi"
                  onChange={(e) => set("kategori", e.target.value)}
                />
              </Field>
              <Field id="b-tanggal" label="Tanggal tayang" required>
                <input
                  id="b-tanggal"
                  type="datetime-local"
                  className={inputClass}
                  value={form.tanggal}
                  onChange={(e) => set("tanggal", e.target.value)}
                />
              </Field>
              <Field
                id="b-ringkasan"
                label="Ringkasan"
                hint="Kosongkan untuk ambil awal isi artikel (maks 320 karakter)."
                span
              >
                <textarea
                  id="b-ringkasan"
                  rows={2}
                  className={inputClass}
                  value={form.ringkasan}
                  onChange={(e) => set("ringkasan", e.target.value)}
                />
              </Field>
              <Field
                id="b-konten"
                label="Isi berita"
                hint="Pisahkan paragraf dengan baris kosong. Boleh dikosongkan."
                span
              >
                <textarea
                  id="b-konten"
                  rows={6}
                  className={inputClass}
                  value={form.konten}
                  onChange={(e) => set("konten", e.target.value)}
                />
              </Field>
              <Field
                id="b-gambar"
                label="URL gambar sampul"
                hint="Opsional, harus https://."
              >
                <input
                  id="b-gambar"
                  className={inputClass}
                  value={form.gambar}
                  placeholder="https://…"
                  onChange={(e) => set("gambar", e.target.value)}
                />
              </Field>
              <Field
                id="b-url"
                label="Tautan keluar"
                hint="Isi bila berita merujuk artikel/pengumuman lain."
              >
                <input
                  id="b-url"
                  className={inputClass}
                  value={form.url}
                  placeholder="https://…"
                  onChange={(e) => set("url", e.target.value)}
                />
              </Field>
              <Field
                id="b-slug"
                label="Slug URL"
                hint="Kosongkan untuk ambil dari judul."
              >
                <input
                  id="b-slug"
                  className={inputClass}
                  value={form.slug}
                  placeholder="juara-1-lomba-jaringan"
                  onChange={(e) => set("slug", e.target.value)}
                />
              </Field>
              <div className="flex items-center gap-2 self-end rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  id="b-terbit"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={form.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                <label htmlFor="b-terbit" className="text-sm text-slate-700">
                  Tayangkan (centang untuk publik)
                </label>
              </div>
            </div>

            {formError ? (
              <p
                role="alert"
                className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600"
              >
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o && !deleting) setDeleteTarget(null);
        }}
        title="Hapus berita ini?"
        description={`"${deleteTarget?.judul ?? ""}" akan hilang dari homepage dan halamannya ikut mati.`}
        confirmLabel="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
