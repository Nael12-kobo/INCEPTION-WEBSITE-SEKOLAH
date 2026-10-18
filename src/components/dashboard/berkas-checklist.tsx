"use client";

import * as React from "react";
import {
  CheckCircle2,
  FileImage,
  FileText,
  Loader2,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PhotoUpload } from "@/components/ppdb/photo-upload";
import { compressImageToJpeg } from "@/lib/image-compress";
import {
  PPDB_DOC_KINDS,
  PPDB_DOC_MAX_BYTES,
  PPDB_DOC_MAX_PER_KIND,
  PPDB_DOC_META,
  PPDB_DOC_TOTAL,
  PPDB_PHOTO_META,
  type PpdbDocKind,
} from "@/lib/ppdb-documents";

/** Satu berkas yang sudah diunggah siswa (dari server). */
export type StudentDocumentItem = {
  id: string;
  kind: string;
  fileName: string;
  mime: string;
  size: number;
  createdAt: string;
};

type BerkasChecklistProps = {
  /** Foto siswa sudah tersimpan di akun (kolom User.photoBytes). */
  hasPhoto: boolean;
  /** Versi foto tersimpan (ISO) — pratinjau selalu segar setelah ganti. */
  photoVersion?: string | null;
  /** Berkas kelengkapan yang sudah diunggah. */
  documents?: StudentDocumentItem[];
};

/** Urutan tampil mengikuti daftar syarat sekolah — pas foto di tengah. */
const ITEM_ORDER: ReadonlyArray<PpdbDocKind | "FOTO"> = [
  "PEMBAYARAN",
  "RAPOR",
  "AKTE",
  "FOTO",
  "KK",
];

function formatSize(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/**
 * Kelengkapan berkas PPDB untuk siswa yang SUDAH mengisi formulir:
 * bukti bayar, fotokopi rapor, akte, pas foto, dan kartu keluarga.
 * Berkas diunggah ke /api/account/documents; admin memeriksanya di /admin/ppdb.
 */
export function BerkasChecklist({
  hasPhoto,
  photoVersion = null,
  documents = [],
}: BerkasChecklistProps) {
  const [docs, setDocs] = React.useState<StudentDocumentItem[]>(documents);
  const [photoSaved, setPhotoSaved] = React.useState(hasPhoto);
  const [currentPhotoVersion, setCurrentPhotoVersion] = React.useState<
    string | null
  >(photoVersion);
  const [photoEditing, setPhotoEditing] = React.useState(false);
  const [busyKind, setBusyKind] = React.useState<PpdbDocKind | null>(null);
  const [errors, setErrors] = React.useState<
    Partial<Record<PpdbDocKind, string>>
  >({});
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const pickKindRef = React.useRef<PpdbDocKind | null>(null);

  const handlePick = async (fileList: FileList | null) => {
    const kind = pickKindRef.current;
    pickKindRef.current = null;
    // PENTING: salin dulu ke array — FileList bersifat live; mengosongkan
    // input.value di bawah akan mengosongkan fileList juga (kalau tidak,
    // file yang dipilih hilang tanpa jejak / tanpa pesan apa pun).
    const files = fileList ? Array.from(fileList) : [];
    if (inputRef.current) inputRef.current.value = "";
    if (!kind || busyKind || files.length === 0) return;
    setBusyKind(kind);
    setErrors((prev) => ({ ...prev, [kind]: undefined }));

    const added: StudentDocumentItem[] = [];
    try {
      for (const file of files) {
        const nameIsPdf = /\.pdf$/i.test(file.name);
        const nameIsImage = /\.(jpe?g|png|webp)$/i.test(file.name);
        const isPdf = file.type === "application/pdf" || nameIsPdf;
        const isImage = file.type.startsWith("image/") || nameIsImage;

        let blob: Blob = file;
        let uploadName = file.name;
        if (isPdf) {
          // PDF dikirim apa adanya (tidak dikompres).
        } else if (isImage) {
          blob = await compressImageToJpeg(file, { maxSide: 1600, quality: 0.82 });
          uploadName = `${file.name.replace(/\.[^.]+$/, "") || "berkas"}.jpg`;
        } else {
          throw new Error(
            `"${file.name}" bukan gambar/PDF. Gunakan JPG, PNG, WebP, atau PDF.`
          );
        }

        if (blob.size > PPDB_DOC_MAX_BYTES) {
          throw new Error(
            `Ukuran "${file.name}" lebih dari 5 MB. Perkecil dulu, lalu ulangi.`
          );
        }

        const body = new FormData();
        body.append(
          "file",
          new File([blob], uploadName, {
            type: blob.type || (isPdf ? "application/pdf" : "image/jpeg"),
          })
        );
        body.append("kind", kind);

        const res = await fetch("/api/account/documents", {
          method: "POST",
          body,
        });
        const data = (await res.json().catch(() => null)) as
          | { message?: string; document?: StudentDocumentItem }
          | null;
        if (!res.ok || !data?.document) {
          throw new Error(data?.message ?? "Gagal mengunggah berkas. Coba lagi.");
        }
        added.push(data.document);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [kind]:
          error instanceof Error ? error.message : "Gagal mengunggah berkas.",
      }));
    } finally {
      if (added.length > 0) setDocs((prev) => [...prev, ...added]);
      setBusyKind(null);
    }
  };

  const handleDelete = async (doc: StudentDocumentItem) => {
    if (deletingId) return;
    if (!window.confirm(`Hapus berkas "${doc.fileName}"?`)) return;
    setDeletingId(doc.id);
    try {
      const res = await fetch(`/api/account/documents/${doc.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(data?.message ?? "Gagal menghapus berkas.");
      }
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Gagal menghapus berkas."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const doneCount =
    PPDB_DOC_KINDS.filter((kind) => docs.some((d) => d.kind === kind)).length +
    (photoSaved ? 1 : 0);
  const allDone = doneCount >= PPDB_DOC_TOTAL;

  return (
    <div className="space-y-3">
      {/* Input file tersembunyi — dipakai semua tombol "Tambah File". */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => void handlePick(e.target.files)}
      />

      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-caption text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Kelengkapan Berkas
          </p>
          <span
            className={cn(
              "text-xs font-semibold tabular-nums",
              allDone ? "text-emerald-600" : "text-slate-600"
            )}
          >
            {doneCount} dari {PPDB_DOC_TOTAL} lengkap
          </span>
        </div>
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full bg-sky-100"
          role="progressbar"
          aria-valuenow={doneCount}
          aria-valuemin={0}
          aria-valuemax={PPDB_DOC_TOTAL}
          aria-label="Kelengkapan berkas pendaftaran"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-500 ease-out"
            style={{
              width: `${Math.round((doneCount / PPDB_DOC_TOTAL) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          Unggah berkas di sini — admin memeriksa langsung dari panel PPDB.
          Berkas fisik tetap dibawa saat daftar ulang.
        </p>
      </div>

      {ITEM_ORDER.map((item) => {
        if (item === "FOTO") {
          return (
            <div
              key="FOTO"
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">
                  {PPDB_PHOTO_META.label}
                </p>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    photoSaved
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {photoSaved ? (
                    <CheckCircle2 className="h-3 w-3" aria-hidden />
                  ) : null}
                  {photoSaved ? "Lengkap" : "Belum"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {PPDB_PHOTO_META.hint}
              </p>

              <div className="mt-2 flex items-center gap-3">
                <div className="relative flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-card">
                  {photoSaved ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto dari API ber-sesi, bukan aset statis
                    <img
                      src={`/api/account/photo?v=${encodeURIComponent(
                        currentPhotoVersion ?? "1"
                      )}`}
                      alt="Pas foto tersimpan"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-6 w-6 text-slate-300" aria-hidden />
                  )}
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={photoSaved ? "outline" : "default"}
                  onClick={() => setPhotoEditing((open) => !open)}
                >
                  {photoEditing ? "Tutup" : photoSaved ? "Ganti Foto" : "Unggah Foto"}
                </Button>
              </div>

              {photoEditing ? (
                <div className="mt-3 border-t border-slate-200/70 pt-3">
                  <PhotoUpload
                    defaultSaved={photoSaved}
                    defaultVersion={currentPhotoVersion}
                    onSavedChange={(saved, version) => {
                      setPhotoSaved(saved);
                      setCurrentPhotoVersion(version);
                    }}
                    missingWarning={null}
                    hint="Pas foto formal, wajah terlihat jelas, latar belakang polos — otomatis dikompres sebelum diunggah."
                  />
                </div>
              ) : null}
            </div>
          );
        }

        const meta = PPDB_DOC_META[item];
        const files = docs.filter((d) => d.kind === item);
        const busy = busyKind === item;
        const error = errors[item];
        const maxed = files.length >= PPDB_DOC_MAX_PER_KIND;

        return (
          <div
            key={item}
            className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  files.length > 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {files.length > 0 ? (
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                ) : null}
                {files.length > 0 ? `Lengkap (${files.length} file)` : "Belum"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">{meta.hint}</p>

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
                    <a
                      href={`/api/account/documents/${file.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700 hover:text-sky-600 hover:underline"
                      title={file.fileName}
                    >
                      {file.fileName}
                    </a>
                    <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                      {formatSize(file.size)}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDelete(file)}
                      disabled={deletingId === file.id}
                      className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      aria-label={`Hapus ${file.fileName}`}
                      title="Hapus berkas"
                    >
                      {deletingId === file.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {error ? (
              <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                disabled={busy || maxed}
                onClick={() => {
                  pickKindRef.current = item;
                  inputRef.current?.click();
                }}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Upload className="h-3.5 w-3.5" aria-hidden />
                )}
                {busy ? "Mengunggah…" : "Tambah File"}
              </Button>
              <span className="text-[11px] text-slate-400">
                {maxed
                  ? `Maksimal ${PPDB_DOC_MAX_PER_KIND} file per berkas.`
                  : "JPG/PNG/WebP/PDF, maks 5 MB per file."}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
