"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageUp,
  Loader2,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { compressImageToJpeg } from "@/lib/image-compress";

type PhotoUploadProps = {
  /** Sudah ada foto tersimpan di server (dari data halaman). */
  defaultSaved: boolean;
  /** Versi foto tersimpan (ISO) — agar pratinjau selalu segar. */
  defaultVersion?: string | null;
  /** Diberi tahu saat status tersimpan berubah (dipakai validasi form). */
  onSavedChange?: (saved: boolean, version: string | null) => void;
  /** Error eksternal, mis. penolakan dari server saat submit formulir. */
  error?: string;
};

/**
 * Unggah foto siswa — syarat pendaftaran PPDB.
 *
 * Alur: pilih file → kompres di browser (JPEG, maks 1000 px) → unggah ke
 * /api/account/photo → status "tersimpan" + pratinjau. Foto bisa diganti
 * kapan saja; form pendaftaran menolak dikirim bila foto belum ada.
 */
export function PhotoUpload({
  defaultSaved,
  defaultVersion,
  onSavedChange,
  error,
}: PhotoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [saved, setSaved] = React.useState(defaultSaved);
  const [version, setVersion] = React.useState<string | null>(
    defaultVersion ?? null
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  /** Bersihkan object URL pratinjau saat diganti / unmount. */
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePick = async (file: File | undefined) => {
    if (!file || busy) return;
    setLocalError(null);

    if (!file.type.startsWith("image/")) {
      setLocalError("File harus berupa gambar (JPG, PNG, atau WebP).");
      return;
    }

    setBusy(true);
    try {
      const blob = await compressImageToJpeg(file);
      const body = new FormData();
      body.append(
        "photo",
        new File([blob], "foto-siswa.jpg", { type: "image/jpeg" })
      );

      const res = await fetch("/api/account/photo", {
        method: "POST",
        body,
      });
      const data = (await res.json().catch(() => null)) as
        | { message?: string; updatedAt?: string }
        | null;
      if (!res.ok) {
        throw new Error(data?.message ?? "Gagal mengunggah foto. Coba lagi.");
      }

      setPreviewUrl(URL.createObjectURL(blob));
      const nextVersion =
        typeof data?.updatedAt === "string"
          ? data.updatedAt
          : new Date().toISOString();
      setVersion(nextVersion);
      setSaved(true);
      onSavedChange?.(true, nextVersion);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : "Gagal mengunggah foto. Coba lagi."
      );
    } finally {
      setBusy(false);
      // Reset input agar memilih file yang sama tetap memicu onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const shownError = localError || error || null;
  const imageSrc =
    previewUrl ??
    (saved ? `/api/account/photo?v=${encodeURIComponent(version ?? "1")}` : null);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id="ppdb-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => void handlePick(e.target.files?.[0])}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Kotak pratinjau 3:4 */}
        <div
          className={cn(
            "relative flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50",
            saved ? "border-sky-200" : "border-dashed border-sky-200"
          )}
        >
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- pratinjau blob/URL API, bukan aset statis
            <img
              src={imageSrc}
              alt="Pratinjau foto siswa"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-1.5 px-2 text-center text-slate-400">
              <UserRound className="h-8 w-8" aria-hidden />
              <span className="text-[11px] leading-tight">Belum ada foto</span>
            </span>
          )}
          {busy ? (
            <span className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin text-sky-600" aria-hidden />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={saved ? "outline" : "default"}
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : saved ? (
                <RefreshCw className="h-4 w-4" aria-hidden />
              ) : (
                <ImageUp className="h-4 w-4" aria-hidden />
              )}
              {busy ? "Mengunggah…" : saved ? "Ganti Foto" : "Pilih Foto"}
            </Button>
            {saved && !busy ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Foto tersimpan
              </span>
            ) : null}
          </div>

          {shownError ? (
            <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {shownError}
            </p>
          ) : !saved && !busy ? (
            <p className="text-xs font-medium text-amber-600">
              Foto wajib diunggah sebelum formulir dikirim.
            </p>
          ) : null}

          <p className="text-xs text-slate-400">
            Pas foto formal, wajah terlihat jelas, latar belakang polos.
            Format JPG/PNG/WebP maks 3 MB — foto otomatis dikompres sebelum
            diunggah.
          </p>
        </div>
      </div>
    </div>
  );
}
