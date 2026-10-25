"use client";

import * as React from "react";
import Link from "next/link";
import { FileText, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { parseJsonSafe } from "@/components/admin/api-json";
import { useToast } from "@/components/ui/toast";
import {
  IKON_FASILITAS_KEYS,
  IKON_STATISTIK_KEYS,
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_SECTIONS,
  type SiteContentKey,
  type SiteContentMap,
} from "@/lib/site-content";

type Data = Record<string, unknown>;

const FIELD_LABELS: Record<string, string> = {
  badge: "Label kecil",
  eyebrow: "Teks pembuka",
  judul: "Judul",
  judulAtas: "Judul baris pertama",
  judulBawah: "Judul baris kedua",
  judulAwal: "Judul utama",
  judulAccent: "Bagian judul berwarna",
  deskripsi: "Deskripsi",
  paragraf: "Paragraf",
  nilai: "Angka / nilai",
  suffix: "Akhiran angka",
  label: "Label",
  nama: "Nama",
  peran: "Jabatan / peran",
  foto: "Foto (path lokal atau HTTPS)",
  teks: "Teks",
  cta1: "Tombol utama",
  cta2: "Tombol kedua",
  href: "Tautan tujuan",
  chips: "Chip informasi",
  kartu: "Kartu mengambang",
  items: "Daftar poin",
  ikon: "Ikon",
  poin: "Poin",
  testimoni: "Testimoni",
  src: "Path media lokal",
  poster: "Path poster gambar",
  alt: "Teks alternatif gambar",
  xmin: "Detik awal",
  xmid: "Detik tengah",
  xmax: "Detik akhir",
  galeri: "Galeri fasilitas",
  tabs: "Tab fasilitas",
  daftar: "Daftar guru & karyawan",
  ctaJudul: "Judul ajakan",
  ctaTeks: "Teks ajakan",
  introKompetensi: "Pengantar kompetensi",
  introKarir: "Pengantar prospek karier",
  heroTeks: "Teks tambahan hero",
  skills: "Keterampilan",
  keunggulan: "Keunggulan",
  kompetensi: "Kompetensi / materi",
  karir: "Prospek karier",
  tentang: "Tentang jurusan",
  gambar: "URL gambar",
  urutan: "Urutan tampil",
  aktif: "Aktif / tayang",
  published: "Dipublikasikan",
  updatedBy: "Diperbarui oleh",
};

const LONG_FIELDS = new Set([
  "deskripsi", "paragraf", "teks", "tentang", "heroTeks", "ctaTeks",
  "introKompetensi", "introKarir", "konten", "keunggulan", "poin", "items",
]);

const STRING_ARRAY_FIELDS = new Set([
  "skills", "keunggulan", "poin", "items",
]);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-card px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60";

function humanize(key: string): string {
  return FIELD_LABELS[key] ?? key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function blankLike(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as Data).map(([key, child]) => [
        key,
        key === "id" ? child : blankLike(child),
      ]),
    );
  }
  return "";
}

function isPrimitiveStringList(value: unknown[], field: string): boolean {
  if (value.length === 0) return STRING_ARRAY_FIELDS.has(field);
  return value.every((item) => typeof item === "string");
}

function valueAtPath(root: unknown, path: string[]): unknown {
  let current = root;
  for (const part of path) {
    if (Array.isArray(current)) {
      const index = Number(part);
      current = Number.isInteger(index) ? current[index] : undefined;
    } else if (typeof current === "object" && current !== null) {
      current = (current as Data)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

type EditableFieldProps = {
  field: string;
  value: unknown;
  path: string[];
  onChange: (value: unknown) => void;
};

function EditableField({ field, value, path, onChange }: EditableFieldProps) {
  const id = "content-" + path.join("-").replace(/[^a-zA-Z0-9_-]/g, "-");
  const label = humanize(field);
  const inFixedTabs = path.includes("tabs");
  const fixedProperty = inFixedTabs && (field === "id" || field === "ikon");

  if (Array.isArray(value)) {
    if (isPrimitiveStringList(value, field)) {
      return (
        <div className="space-y-1.5">
          <label htmlFor={id} className="block text-xs font-semibold text-slate-600">
            {label}
          </label>
          <textarea
            id={id}
            className={inputClass}
            rows={Math.min(8, Math.max(3, value.length))}
            value={value.join("\n")}
            placeholder="Satu item per baris"
            onChange={(event) =>
              onChange(event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
            }
          />
          <p className="text-[11px] text-slate-400">Satu item per baris. Baris kosong akan diabaikan.</p>
        </div>
      );
    }

    const fixedLength = path[path.length - 1] === "tabs";
    return (
      <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800">{label}</h3>
          <Badge variant="outline">{value.length} item</Badge>
        </div>
        <div className="space-y-2">
          {value.map((item, index) => {
            const summary =
              typeof item === "object" && item !== null
                ? String(
                    (item as Data).nama ??
                    (item as Data).judul ??
                    (item as Data).label ??
                    (item as Data).pekerjaan ??
                    (item as Data).src ??
                    "",
                  ).trim()
                : String(item ?? "");
            const itemLabel = summary || (label + " " + (index + 1));
            return (
              <details key={index} className="group rounded-lg border border-slate-200 bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium text-slate-700">
                  <span className="min-w-0 truncate">{index + 1}. {itemLabel}</span>
                  <span className="text-xs text-slate-400 group-open:hidden">Edit</span>
                  <span className="hidden text-xs text-slate-400 group-open:inline">Tutup</span>
                </summary>
                <div className="border-t border-slate-100 p-3">
                  {typeof item === "object" && item !== null ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.entries(item as Data).map(([childKey, childValue]) => (
                        <div key={childKey} className={LONG_FIELDS.has(childKey) || (typeof childValue === "object" && childValue !== null) ? "sm:col-span-2" : ""}>
                          <EditableField
                            field={childKey}
                            value={childValue}
                            path={[...path, String(index), childKey]}
                            onChange={(next) =>
                              onChange(value.map((current, currentIndex) => {
                                if (currentIndex !== index) return current;
                                if (typeof current !== "object" || current === null) return current;
                                return { ...(current as Data), [childKey]: next };
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EditableField
                      field={String(index)}
                      value={item}
                      path={[...path, String(index)]}
                      onChange={(next) =>
                        onChange(value.map((current, currentIndex) => currentIndex === index ? next : current))
                      }
                    />
                  )}
                  {!fixedLength ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost-destructive"
                        size="sm"
                        onClick={() => onChange(value.filter((_, currentIndex) => currentIndex !== index))}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Hapus item
                      </Button>
                    </div>
                  ) : null}
                </div>
              </details>
            );
          })}
        </div>
        {!fixedLength ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const defaults = valueAtPath(SITE_CONTENT_DEFAULTS, path);
              const template = value[0] ??
                (Array.isArray(defaults) ? defaults[0] : undefined) ??
                {};
              onChange([...value, blankLike(template)]);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Tambah {label.toLowerCase()}
          </Button>
        ) : (
          <p className="text-xs text-slate-400">Jumlah tab dikunci agar tata letak situs tetap konsisten.</p>
        )}
      </section>
    );
  }

  if (typeof value === "object" && value !== null) {
    return (
      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3 sm:p-4">
        <legend className="px-1 text-sm font-bold text-slate-700">{label}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(value as Data).map(([childKey, childValue]) => (
            <div key={childKey} className={LONG_FIELDS.has(childKey) || (typeof childValue === "object" && childValue !== null) ? "sm:col-span-2" : ""}>
              <EditableField
                field={childKey}
                value={childValue}
                path={[...path, childKey]}
                onChange={(next) => onChange({ ...(value as Data), [childKey]: next })}
              />
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5">
        <input
          id={id}
          type="checkbox"
          checked={value}
          disabled={fixedProperty}
          className="h-4 w-4 rounded border-slate-300"
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor={id} className="text-sm text-slate-700">{label}</label>
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-600">{label}</label>
        <input
          id={id}
          type="number"
          min={0}
          max={1_000_000}
          step="any"
          className={inputClass}
          value={value}
          readOnly={fixedProperty}
          onChange={(event) => onChange(event.target.value === "" ? 0 : Number(event.target.value))}
        />
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";
  const isLong = LONG_FIELDS.has(field) || text.length > 110;
  const iconOptions =
    field === "ikon" && path.includes("statistik")
      ? IKON_STATISTIK_KEYS
      : field === "ikon" && path.includes("tabs")
        ? IKON_FASILITAS_KEYS
        : null;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600">{label}</label>
      {iconOptions ? (
        <select
          id={id}
          className={inputClass}
          value={text}
          disabled={fixedProperty}
          onChange={(event) => onChange(event.target.value)}
        >
          {iconOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : isLong ? (
        <textarea
          id={id}
          className={inputClass}
          rows={Math.min(8, Math.max(3, Math.ceil(text.length / 90)))}
          value={text}
          readOnly={fixedProperty}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type="text"
          className={inputClass}
          value={text}
          readOnly={fixedProperty}
          maxLength={field === "href" || field === "foto" || field === "src" || field === "poster" ? 300 : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {fixedProperty ? <p className="text-[11px] text-slate-400">Nilai ini dikunci agar komponen fasilitas tetap stabil.</p> : null}
      {(field === "href" || field === "foto" || field === "src" || field === "poster") ? (
        <p className="text-[11px] text-slate-400">
          Tautan tombol harus berupa path internal, #anchor, atau URL HTTPS. Gambar/video harus memakai path lokal (diawali /) atau URL HTTPS.
        </p>
      ) : null}
    </div>
  );
}

export function SiteContentAdminClient({
  initialContent,
}: {
  initialContent: SiteContentMap;
}) {
  const toast = useToast();
  const [activeKey, setActiveKey] = React.useState<SiteContentKey>("hero");
  const [draft, setDraft] = React.useState<SiteContentMap>(() => cloneValue(initialContent));
  const [saved, setSaved] = React.useState<SiteContentMap>(() => cloneValue(initialContent));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dirty = JSON.stringify(draft[activeKey]) !== JSON.stringify(saved[activeKey]);

  const updateActive = (next: unknown) => {
    setDraft((current) => ({ ...current, [activeKey]: next }) as SiteContentMap);
    setError(null);
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/site-content/" + activeKey, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft[activeKey] }),
      });
      if (!response.ok) {
        const body = await parseJsonSafe<{ error?: string }>(response);
        throw new Error(body?.error || "Gagal menyimpan konten.");
      }
      const body = await parseJsonSafe<{ content: unknown }>(response);
      if (!body || typeof body.content !== "object" || body.content === null) {
        throw new Error("Server tidak mengembalikan konten tersimpan.");
      }
      const normalized = body.content;
      setDraft((current) => ({ ...current, [activeKey]: normalized }) as SiteContentMap);
      setSaved((current) => ({ ...current, [activeKey]: cloneValue(normalized) }) as SiteContentMap);
      toast.success("Konten berhasil disimpan dan cache halaman publik diperbarui.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Gagal menyimpan konten.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = () => {
    const defaults = cloneValue(SITE_CONTENT_DEFAULTS[activeKey]);
    setDraft((current) => ({ ...current, [activeKey]: defaults }) as SiteContentMap);
    setError(null);
    toast.info("Nilai bawaan dimuat. Tekan Simpan untuk menerapkannya ke situs.");
  };

  const section = SITE_CONTENT_SECTIONS.find((item) => item.key === activeKey);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-h4">
            <FileText className="h-5 w-5 text-sky-600" aria-hidden />
            Informasi yang tampil untuk siswa & calon siswa
          </CardTitle>
          <p className="text-sm text-slate-500">
            Edit isi halaman publik dari sini. Perubahan tidak tayang sampai tombol Simpan berhasil. Semua perubahan dicatat di Audit Log.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {SITE_CONTENT_SECTIONS.map((item) => {
              const isDirty = JSON.stringify(draft[item.key]) !== JSON.stringify(saved[item.key]);
              return (
                <Button
                  key={item.key}
                  type="button"
                  size="sm"
                  variant={activeKey === item.key ? "default" : "outline"}
                  onClick={() => {
                    setActiveKey(item.key);
                    setError(null);
                  }}
                >
                  {item.label}
                  {isDirty ? <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="Ada perubahan belum disimpan" /> : null}
                </Button>
              );
            })}
          </div>
          <p className="text-sm text-slate-500">{section?.deskripsi}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="font-h4">{section?.label ?? "Konten Situs"}</CardTitle>
            <p className="text-xs text-slate-500">Bagian: <code>{activeKey}</code></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={restoreDefaults} disabled={saving}>
              <RotateCcw className="h-4 w-4" aria-hidden />
              Pulihkan nilai bawaan
            </Button>
            <Button type="button" size="sm" onClick={save} disabled={saving || !dirty}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {error ? (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">{error}</p>
          ) : null}
          <EditableField
            field={activeKey}
            value={draft[activeKey]}
            path={[activeKey]}
            onChange={updateActive}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500">
              {dirty ? "Ada perubahan yang belum disimpan." : "Semua perubahan bagian ini sudah tersimpan."}
            </p>
            <div className="flex gap-2">
              <Button asChild type="button" variant="outline" size="sm">
                <Link href="/" target="_blank">Lihat situs publik</Link>
              </Button>
              <Button type="button" onClick={save} disabled={saving || !dirty} size="sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
                Simpan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
