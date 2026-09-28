"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Input dengan label, ikon opsional, dan inline error.
 * Micro-interaction: border sky saat focus, ikon ikut menebal.
 */
export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    id: string;
    error?: string;
    icon?: React.ReactNode;
  }
>(function AuthInput({ label, id, error, icon, className, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="group relative">
        {icon ? (
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-500"
          >
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400",
            "shadow-sm shadow-sky-50 transition-[border-color,box-shadow] duration-200",
            "focus:outline-none focus:ring-4 focus:ring-sky-500/10",
            icon && "pl-10",
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10"
              : "border-sky-200/90 hover:border-sky-300 focus:border-sky-500",
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      ) : null}
    </div>
  );
});

/** Input password dengan toggle show/hide yang accessible. */
export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<typeof AuthInput>, "type" | "icon">
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <AuthInput
        ref={ref}
        type={visible ? "text" : "password"}
        icon={<Eye className="h-4 w-4" aria-hidden />}
        className="pr-11"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
        className="absolute right-2 top-[32px] flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
});

/**
 * Checkbox custom berbasis `peer`: input sr-only tetap fokus via keyboard,
 * kotak & centang dianimasikan via CSS. Centang putih di atas kotak putih
 * tidak terlihat saat unchecked — muncul saat checked (bg sky-600).
 */
export function AuthCheckbox({
  id,
  label,
  error,
  disabled,
  className,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "type"> & {
  id: string;
  label: React.ReactNode;
  error?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="inline-flex cursor-pointer items-start gap-2.5">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
          {...props}
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border bg-white",
            "transition-[background-color,border-color,box-shadow] duration-150",
            "border-sky-300 peer-checked:border-sky-600 peer-checked:bg-sky-600",
            "peer-hover:border-sky-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/15",
            error && "border-rose-300"
          )}
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="h-3 w-3 text-white transition-opacity duration-150"
          >
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="text-sm leading-relaxed text-slate-600 peer-disabled:opacity-50">
          {label}
        </span>
      </label>
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-rose-600">
          <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-rose-500" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Divider "atau lanjutkan dengan" dengan garis halus dua sisi. */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-200" aria-hidden />
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-200" aria-hidden />
    </div>
  );
}
