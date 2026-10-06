"use client";

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
}

export function ImageModal({
  isOpen,
  onClose,
  src,
  alt,
  title,
  description,
}: ImageModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4",
        "animate-fade-in"
      )}
      onClick={onClose}
    >
      <div
        className="relative mx-auto flex max-h-[90vh] max-w-6xl w-full flex-col gap-6 overflow-hidden rounded-2xl bg-white p-6 shadow-2xl md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/90 shadow-lg hover:bg-white"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="relative flex-1 min-h-[300px] overflow-hidden rounded-xl bg-slate-100">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>

        {(title || description) && (
          <div className="flex max-w-md w-full flex-col justify-center md:border-l md:pl-6">
            {title && (
              <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
            )}
            {description && (
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {description}
              </p>
            )}
            <div className="mt-6">
              <Button
                onClick={onClose}
                className="w-full md:w-auto"
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
