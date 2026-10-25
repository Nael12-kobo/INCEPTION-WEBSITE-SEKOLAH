"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
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
import type { JurusanRecord } from "@/lib/jurusan-server";
import {
  IKON_JURUSAN_KEYS,
  JURUSAN_BAWAAN,
  WARNA_JURUSAN_KEYS,
  gabungBaris,
  getIkonJurusan,
  getWarnaJurusan,
} from "@/lib/jurusan";

type FormState = {
  kode: string;
  nama: string;
  singkatan: string;
  tagline: string;
  deskripsi: string;
  tentang: string;
  skills: string;
  keunggulan: string;
  kompetensi: string;
  karir: string;
  ikon: string;
  warna: string;
  gambar: string;
  heroTeks: string;
  introKompetensi: string;
  introKarir: string;
  ctaJudul: string;
  ctaTeks: string;
  urutan: string;
  aktif: boolean;
};

const FORM_KOSONG: FormState = {
  kode: "",
  nama: "",
  singkatan: "",
  tagline: "",
  deskripsi: "",
  tentang: "",
  skills: "",
  keunggulan: "",
  kompetensi: "",
  karir: "",
  ikon: "GraduationCap",
  warna: "sky",
  gambar: "",
  heroTeks: "",
  introKompetensi: "",
  introKarir: "",
  ctaJudul: "",
  ctaTeks: "",
  urutan: "100",
  aktif: true,
};

function dariRecord(row: JurusanRecord): FormState {
  return {
    kode: row.kode,
    nama: row.nama,
    singkatan: row.singkatan,
    tagline: row.tagline ?? "",
    deskripsi: row.deskripsi,
    tentang: row.tentang,
    skills: gabungBaris(row.skills),
    keunggulan: gabungBaris(row.keunggulan),
    kompetensi: row.kompetensi
      .map((k) => `${k.judul}${k.deskripsi ? ` | ${k.deskripsi}` : ""}`)
      .join("\n"),
    karir: row.karir
      .map((k) => `${k.pekerjaan}${k.gaji ? ` | ${k.gaji}` : ""}`)
      .join("\n"),
    ikon: row.ikon,
    warna: row.warna,
    gambar: row.gambar ?? "",
    heroTeks: row.heroTeks ?? "",
    introKompetensi: row.introKompetensi,
    introKarir: row.introKarir,
    ctaJudul: row.ctaJudul,
    ctaTeks: row.ctaTeks,
    urutan: String(row.urutan),
    aktif: row.aktif,
  };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

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

export function JurusanAdminClient({
  initialRows,
}: {
  initialRows: JurusanRecord[];
}) {
  const toast = useToast();
  const [rows, setRows] = React.useState<JurusanRecord[]>(initialRows);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<JurusanRecord | null>(null);
  const [form, setForm] = React.useState<FormState>(FORM_KOSONG);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<JurusanRecord | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);
  const jurusanTambahan = rows.filter((row) => !row.bawaan);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const refresh = React.useCallback(async () => {
    const res = await fetch("/api/admin/jurusan");
    if (!res.ok) return;
    const data = await parseJsonSafe<{ rows: JurusanRecord[] }>(res);
    if (data?.rows) setRows(data.rows);
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(FORM_KOSONG);
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (row: JurusanRecord) => {
    setEditing(row);
    setForm(dariRecord(row));
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.nama.trim().length < 3) {
      setFormError("Nama jurusan minimal 3 karakter.");
      return;
    }
    if (!form.singkatan.trim()) {
      setFormError("Singkatan wajib diisi.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(
        editing ? `/api/admin/jurusan/${editing.id}` : "/api/admin/jurusan",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, urutan: Number(form.urutan) || 0 }),
        },
      );
      if (!res.ok) {
        const data = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(data?.error || "Gagal menyimpan data.");
      }
      toast.success(
        editing
          ? "Program keahlian berhasil diperbarui."
          : "Program keahlian berhasil ditambahkan.",
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
      const res = await fetch(`/api/admin/jurusan/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await parseJsonSafe<{ error?: string }>(res);
        throw new Error(data?.error || "Gagal menghapus data.");
      }
      toast.success("Program keahlian dihapus.");
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
      {/* Empat jurusan bawaan: konten dapat diedit, tetapi tidak dihapus. */}
      <Card className="bg-card">
        <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="font-h4">Jurusan Bawaan</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Empat program utama sekolah. Konten dapat diedit, sedangkan kode
              URL tetap dan data tidak dapat dihapus.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {JURUSAN_BAWAAN.map((j) => {
              const row = rows.find((item) => item.bawaan && item.kode === j.kode);
              const displayed = row ?? j;
              const Icon = getIkonJurusan(displayed.ikon);
              const warna = getWarnaJurusan(displayed.warna);
              return (
                <div
                  key={j.kode}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-card p-4 transition-colors hover:border-sky-300"
                >
                  <Link
                    href={`/jurusan/${j.kode}`}
                    className="group flex min-w-0 flex-1 items-start gap-3"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${warna.bg} ${warna.teks}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {displayed.singkatan}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Bawaan
                        </Badge>
                        {row ? (
                          <Badge
                            variant={row.aktif ? "success" : "outline"}
                            className={row.aktif ? undefined : "text-slate-500"}
                          >
                            {row.aktif ? "Tayang" : "Disembunyikan"}
                          </Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-slate-600">
                        {displayed.nama}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-700 opacity-0 transition-opacity group-hover:opacity-100">
                        Lihat halaman <ExternalLink className="h-3 w-3" />
                      </span>
                    </span>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!row || deleting}
                    onClick={() => row && openEdit(row)}
                    aria-label={`Ubah ${displayed.singkatan}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                    <span className="hidden sm:inline">Ubah</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Jurusan tambahan dari database */}
      <Card className="bg-card">
        <CardHeader className="flex-row items-start justify-between space-y-0 gap-4">
          <div>
            <CardTitle className="font-h4">Program Keahlian Tambahan</CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Tambah jurusan baru di sini — langsung tampil di homepage, daftar{" "}
              <Link href="/jurusan" className="font-semibold text-sky-700">
                /jurusan
              </Link>
              , dan punya halaman detail sendiri.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden />
            Tambah Jurusan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto subtle-scroll">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Singkatan", "Nama Jurusan", "Kode URL", "Status", "Aksi"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-3 px-3 text-left font-overline text-[11px] uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {jurusanTambahan.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      Belum ada jurusan tambahan — klik “Tambah Jurusan”.
                    </td>
                  </tr>
                ) : (
                  jurusanTambahan.map((row) => {
                    const Icon = getIkonJurusan(row.ikon);
                    const warna = getWarnaJurusan(row.warna);
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="py-3.5 px-3">
                          <span className="flex items-center gap-2">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${warna.bg} ${warna.teks}`}
                            >
                              <Icon className="h-4 w-4" aria-hidden />
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                              {row.singkatan}
                            </span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-sm text-slate-700">
                          {row.nama}
                        </td>
                        <td className="py-3.5 px-3 text-sm text-slate-500">
                          /jurusan/{row.kode}
                        </td>
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={row.aktif ? "success" : "outline"}
                            className={row.aktif ? undefined : "text-slate-500"}
                          >
                            {row.aktif ? "Tayang" : "Disembunyikan"}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Form tambah/ubah */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Ubah Program Keahlian" : "Tambah Program Keahlian"}
              </DialogTitle>
              <DialogDescription>
                Isi sesingkat mungkin untuk kartu, sedetail mungkin untuk
                halaman detailnya.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 sm:grid-cols-2">
              <Field id="f-singkatan" label="Singkatan" required>
                <input
                  id="f-singkatan"
                  className={inputClass}
                  value={form.singkatan}
                  maxLength={24}
                  placeholder="mis. UL"
                  onChange={(e) => set("singkatan", e.target.value)}
                />
              </Field>
              <Field
                id="f-kode"
                label="Kode URL"
                hint={editing?.bawaan ? "Kode jurusan bawaan tidak dapat diubah." : "Kosongkan untuk ambil dari nama."}
              >
                <input
                  id="f-kode"
                  className={inputClass}
                  value={form.kode}
                  disabled={editing?.bawaan}
                  placeholder="mis. teknik-listrik"
                  onChange={(e) => set("kode", e.target.value)}
                />
              </Field>
              <Field id="f-nama" label="Nama lengkap" required span>
                <input
                  id="f-nama"
                  className={inputClass}
                  value={form.nama}
                  placeholder="mis. Teknik Instalasi Tenaga Listrik"
                  onChange={(e) => set("nama", e.target.value)}
                />
              </Field>
              <Field id="f-tagline" label="Tagline (subjudul hero)" span>
                <input
                  id="f-tagline"
                  className={inputClass}
                  value={form.tagline}
                  placeholder="opsional"
                  onChange={(e) => set("tagline", e.target.value)}
                />
              </Field>
              <Field
                id="f-deskripsi"
                label="Deskripsi singkat (kartu)"
                required
                span
                hint="Maks 320 karakter — tampil di homepage & daftar /jurusan."
              >
                <textarea
                  id="f-deskripsi"
                  rows={2}
                  className={inputClass}
                  value={form.deskripsi}
                  onChange={(e) => set("deskripsi", e.target.value)}
                />
              </Field>
              <Field
                id="f-tentang"
                label="Tentang jurusan"
                span
                hint="Pisahkan paragraf dengan baris kosong."
              >
                <textarea
                  id="f-tentang"
                  rows={4}
                  className={inputClass}
                  value={form.tentang}
                  onChange={(e) => set("tentang", e.target.value)}
                />
              </Field>
              <Field
                id="f-skills"
                label="Skill (kartu)"
                hint="Satu skill per baris, mis. “Jaringan LAN”."
              >
                <textarea
                  id="f-skills"
                  rows={3}
                  className={inputClass}
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                />
              </Field>
              <Field
                id="f-keunggulan"
                label="Keunggulan jurusan"
                hint="Satu poin per baris."
              >
                <textarea
                  id="f-keunggulan"
                  rows={3}
                  className={inputClass}
                  value={form.keunggulan}
                  onChange={(e) => set("keunggulan", e.target.value)}
                />
              </Field>
              <Field
                id="f-kompetensi"
                label="Kompetensi / materi"
                hint="Format: Judul | Deskripsi — satu baris per materi."
              >
                <textarea
                  id="f-kompetensi"
                  rows={3}
                  className={inputClass}
                  value={form.kompetensi}
                  placeholder={"Pemrograman Web | HTML, CSS, JavaScript"}
                  onChange={(e) => set("kompetensi", e.target.value)}
                />
              </Field>
              <Field
                id="f-karir"
                label="Prospek karir"
                hint="Format: Pekerjaan | Rentang gaji."
              >
                <textarea
                  id="f-karir"
                  rows={3}
                  className={inputClass}
                  value={form.karir}
                  placeholder={"Teknisi Listrik | Rp 4 – 10 juta/bulan"}
                  onChange={(e) => set("karir", e.target.value)}
                />
              </Field>
              <Field id="f-ikon" label="Ikon">
                <select
                  id="f-ikon"
                  className={inputClass}
                  value={form.ikon}
                  onChange={(e) => set("ikon", e.target.value)}
                >
                  {IKON_JURUSAN_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="f-warna" label="Tema warna">
                <select
                  id="f-warna"
                  className={inputClass}
                  value={form.warna}
                  onChange={(e) => set("warna", e.target.value)}
                >
                  {WARNA_JURUSAN_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {getWarnaJurusan(k).label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="f-gambar"
                label="URL gambar hero"
                hint="Opsional: URL HTTPS atau path lokal yang diawali /. Kosongkan untuk memakai ikon."
              >
                <input
                  id="f-gambar"
                  className={inputClass}
                  value={form.gambar}
                  placeholder="https://…"
                  onChange={(e) => set("gambar", e.target.value)}
                />
              </Field>
              <Field
                id="f-hero-teks"
                label="Teks tambahan di hero"
                span
                hint="Opsional. Teks penjelas di bagian atas halaman detail jurusan."
              >
                <textarea
                  id="f-hero-teks"
                  rows={3}
                  className={inputClass}
                  value={form.heroTeks}
                  onChange={(e) => set("heroTeks", e.target.value)}
                />
              </Field>
              <Field id="f-intro-kompetensi" label="Pengantar kompetensi" span>
                <textarea
                  id="f-intro-kompetensi"
                  rows={2}
                  className={inputClass}
                  value={form.introKompetensi}
                  onChange={(e) => set("introKompetensi", e.target.value)}
                />
              </Field>
              <Field id="f-intro-karir" label="Pengantar prospek karier" span>
                <textarea
                  id="f-intro-karir"
                  rows={2}
                  className={inputClass}
                  value={form.introKarir}
                  onChange={(e) => set("introKarir", e.target.value)}
                />
              </Field>
              <Field id="f-cta-judul" label="Judul ajakan di bawah halaman" span>
                <input
                  id="f-cta-judul"
                  className={inputClass}
                  value={form.ctaJudul}
                  onChange={(e) => set("ctaJudul", e.target.value)}
                />
              </Field>
              <Field id="f-cta-teks" label="Teks ajakan di bawah halaman" span>
                <textarea
                  id="f-cta-teks"
                  rows={3}
                  className={inputClass}
                  value={form.ctaTeks}
                  onChange={(e) => set("ctaTeks", e.target.value)}
                />
              </Field>
              <Field id="f-urutan" label="Urutan tampil" hint="Kecil = lebih awal.">
                <input
                  id="f-urutan"
                  type="number"
                  min={0}
                  max={9999}
                  className={inputClass}
                  value={form.urutan}
                  onChange={(e) => set("urutan", e.target.value)}
                />
              </Field>
              <div className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  id="f-aktif"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={form.aktif}
                  onChange={(e) => set("aktif", e.target.checked)}
                />
                <label htmlFor="f-aktif" className="text-sm text-slate-700">
                  Tayangkan di situs
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
        title="Hapus program keahlian ini?"
        description={`"${deleteTarget?.nama ?? ""}" akan hilang dari situs beserta halamannya. Jurusan bawaan tidak terpengaruh.`}
        confirmLabel="Hapus"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
