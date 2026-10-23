"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Dialog konfirmasi pengganti `window.confirm()` blocking — bisa diterjemahkan,
 * distyle, dan berfungsi baik di webview mobile. Sengaja dibuat terpisah dari
 * `ui/dialog` agar alur konfirmasi (destructive/non-destructive + loading)
 * seragam di seluruh panel admin.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  destructive = false,
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true → tombol konfirmasi merah (variant destructive). */
  destructive?: boolean;
  /** Saat true tombol dinonaktifkan & spinner tampil (mencegah double-submit). */
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !loading) onOpenChange(false);
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={loading}
            // Penangan error menjadi tanggung jawab pemanggil (biasanya toast).
            onClick={() => void Promise.resolve(onConfirm()).catch(() => {})}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
