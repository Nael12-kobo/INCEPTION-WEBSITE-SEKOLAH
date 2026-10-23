"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  /** Jika diisi, panel kiri memutar video (mis. WebM fasilitas) bukan gambar. */
  videoSrc?: string;
  /** Poster video / fallback gambar. */
  poster?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  src,
  alt,
  title,
  description,
  videoSrc,
  poster,
}: ImageModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Efek berjalan hanya ketika modal dibuka (isOpen = true)
  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    // Simpan pemicu modal agar fokus bisa dipulihkan saat ditutup (#25).
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Fokus awal: container modal (tabIndex -1) agar screen reader masuk ke dialog.
    dialog?.focus();

    const getFocusables = () =>
      dialog
        ? Array.from(
            dialog.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
            )
          )
        : [];

    // 1. Tutup dengan tombol ESC + jebak Tab di dalam modal (focus trap)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || active === dialog || !dialog.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || active === dialog || !dialog.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    // 2. Kunci scroll body agar halaman belakang tidak ikut ter-scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
      // Pulihkan fokus ke elemen yang membuka modal (#25).
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  // Hindari render apa pun jika isOpen false
  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6",
        "bg-black/60 backdrop-blur-md",
        "animate-in fade-in duration-300", // Animasi masuk yang halus
        "outline-none", // fokus programatik ke container tidak perlu ring visual
      )}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={cn(
          "relative mx-auto flex w-full max-w-6xl flex-col md:flex-row",
          "max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl",
          "bg-background border border-border animate-in zoom-in-95 duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Close Mengambang */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-background/50 backdrop-blur-md shadow-sm hover:bg-background/80 transition-transform active:scale-95"
          aria-label="Tutup modal"
        >
          <X className="h-5 w-5 text-foreground" />
        </Button>

        {/* Area Media */}
        <div className="relative flex-1 min-h-[40vh] md:min-h-[500px] w-full overflow-hidden bg-black/5 dark:bg-black/40 flex items-center justify-center">
          {videoSrc ? (
            <video
              key={videoSrc}
              className="h-full w-full object-contain"
              controls
              autoPlay
              loop
              muted
              playsInline
              poster={poster || src}
              aria-label={alt}
            >
              <source src={videoSrc} type="video/webm" />
              {/* Fallback mp4 untuk kompatibilitas Safari/iOS lama */}
              <source
                src={videoSrc.replace(".webm", ".mp4")}
                type="video/mp4"
              />
            </video>
          ) : (
            // Menggunakan next/image alih-alih <img> biasa
            <Image
              src={src}
              alt={alt || "Gambar Modal"}
              fill
              sizes="(max-width: 768px) 100vw, 70vw"
              className="object-contain"
              // Tanpa `priority`/`quality={100}` (#36): overlay on-demand tidak
              // perlu eager fetch, quality default (75) ~separuh byte quality 100.
            />
          )}
        </div>

        {/* Area Teks (Hanya dirender jika ada teks) */}
        {(title || description) && (
          <div className="flex w-full flex-col bg-background p-6 sm:p-8 md:w-[400px] lg:w-[450px] overflow-y-auto">
            <div className="flex h-full flex-col justify-center">
              {title && (
                <h3
                  id="modal-title"
                  className="text-2xl font-bold tracking-tight text-foreground text-center md:text-left"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-3 text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                  {description}
                </p>
              )}
              <div className="mt-8">
                <Button
                  onClick={onClose}
                  className="w-full sm:w-auto font-medium transition-transform active:scale-95"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
