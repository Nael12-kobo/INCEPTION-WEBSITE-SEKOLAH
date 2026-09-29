import * as React from "react";
import { AlertCircle, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Kontrol formulir PPDB.
 * Mirip AuthInput (src/components/auth/form-controls.tsx) supaya konsisten
 * dengan form auth, ditambah varian textarea/select/pill yang dibutuhkan form.
 */

const baseField =
  "w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 shadow-sm shadow-sky-50 " +
  "transition-[border-color,box-shadow] duration-200 placeholder:text-slate-400 " +
  "focus:outline-none focus:ring-4 focus:ring-sky-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const idleBorder = "border-sky-200/90 hover:border-sky-300 focus:border-sky-500";
const errorBorder = "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10";

function FieldShell({
  id,
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-rose-500">
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className" | "id">;

export const PpdbInput = React.forwardRef<HTMLInputElement, FieldProps>(
  function PpdbInput({ id, label, required, hint, error, className, ...props }, ref) {
    return (
      <FieldShell
        id={id}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={className}
      >
        <input
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            baseField,
            "h-11",
            error ? errorBorder : idleBorder
          )}
          {...props}
        />
      </FieldShell>
    );
  }
);

type TextareaProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className" | "id">;

export const PpdbTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function PpdbTextarea({ id, label, required, hint, error, className, ...props }, ref) {
    return (
      <FieldShell
        id={id}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={className}
      >
        <textarea
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(baseField, "min-h-24 py-2.5 leading-relaxed", error ? errorBorder : idleBorder)}
          {...props}
        />
      </FieldShell>
    );
  }
);

type SelectProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className" | "id" | "children">;

export const PpdbSelect = React.forwardRef<HTMLSelectElement, SelectProps>(
  function PpdbSelect(
    { id, label, required, hint, error, options, placeholder, className, ...props },
    ref
  ) {
    return (
      <FieldShell
        id={id}
        label={label}
        required={required}
        hint={hint}
        error={error}
        className={className}
      >
        <div className="relative">
          <select
            ref={ref}
            id={id}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            className={cn(
              baseField,
              "h-11 cursor-pointer appearance-none pr-10",
              error ? errorBorder : idleBorder
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
        </div>
      </FieldShell>
    );
  }
);

/** Pilihan Pills — untuk gender & mata pelajaran. */
export function PpdbPills<T extends string>({
  legend,
  required,
  error,
  options,
  value,
  onChange,
}: {
  legend: string;
  required?: boolean;
  error?: string;
  options: ReadonlyArray<{ value: T; label: string; description?: string }>;
  value: T | "";
  onChange: (value: T) => void;
}) {
  const groupId = React.useId();
  return (
    <fieldset aria-describedby={error ? `${groupId}-error` : undefined}>
      <legend className="text-sm font-medium text-slate-700">
        {legend}
        {required ? (
          <span aria-hidden className="ml-0.5 text-rose-500">
            *
          </span>
        ) : null}
      </legend>
      <div className="mt-2 grid gap-2.5">
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all",
                "focus-within:ring-4 focus-within:ring-sky-500/10",
                checked
                  ? "border-sky-500 bg-sky-50/80 shadow-sm shadow-sky-100"
                  : error
                    ? "border-rose-200 bg-white hover:border-rose-300"
                    : "border-sky-200/90 bg-white hover:border-sky-300"
              )}
            >
              <input
                type="radio"
                name={groupId}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  checked
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-sky-300 bg-white text-transparent group-hover:border-sky-400"
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3.5} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">
                  {o.label}
                </span>
                {o.description ? (
                  <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                    {o.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p
          id={`${groupId}-error`}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Checkbox persetujuan — centang putih di atas kotak putih, pakai peer. */
export function PpdbCheckbox({
  id,
  checked,
  onChange,
  children,
  error,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border bg-white",
            "transition-[background-color,border-color,box-shadow] duration-150",
            "border-sky-300 peer-checked:border-sky-600 peer-checked:bg-sky-600",
            "peer-focus-visible:ring-4 peer-focus-visible:ring-sky-500/15",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            error && !checked && "border-rose-300"
          )}
        >
          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
        </span>
        <span className="text-sm leading-relaxed text-slate-600 peer-disabled:opacity-50">
          {children}
        </span>
      </label>
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 pl-8 text-xs font-medium text-rose-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
