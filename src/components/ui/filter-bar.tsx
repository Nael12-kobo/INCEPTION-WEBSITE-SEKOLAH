"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export interface FilterChip {
  key: string;
  label: string;
  active?: boolean;
  tone?: "default" | "sky" | "emerald" | "amber" | "rose" | "violet";
}

export interface FilterBarProps {
  searchPlaceholder?: string;
  onSearch: (q: string) => void;
  searchDebounceMs?: number;
  chips?: FilterChip[];
  onChipClick?: (key: string) => void;
  showClearAll?: boolean;
  onClearAll?: () => void;
  rightSlot?: React.ReactNode;
  className?: string;
}

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-body text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2",
  {
    variants: {
      tone: {
        default:
          "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700",
        sky: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300",
        emerald:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300",
        amber:
          "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300",
        rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300",
        violet:
          "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:border-violet-300",
      },
      active: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        active: true,
        tone: "default",
        class:
          "elevation-2 border-slate-300 bg-slate-100 text-slate-800 shadow-sm",
      },
      {
        active: true,
        tone: "sky",
        class:
          "elevation-2 border-sky-400 bg-sky-100 text-sky-800 shadow-sm shadow-sky-100",
      },
      {
        active: true,
        tone: "emerald",
        class:
          "elevation-2 border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm shadow-emerald-100",
      },
      {
        active: true,
        tone: "amber",
        class:
          "elevation-2 border-amber-400 bg-amber-100 text-amber-800 shadow-sm shadow-amber-100",
      },
      {
        active: true,
        tone: "rose",
        class:
          "elevation-2 border-rose-400 bg-rose-100 text-rose-800 shadow-sm shadow-rose-100",
      },
      {
        active: true,
        tone: "violet",
        class:
          "elevation-2 border-violet-400 bg-violet-100 text-violet-800 shadow-sm shadow-violet-100",
      },
    ],
    defaultVariants: {
      tone: "default",
      active: false,
    },
  }
);

interface FilterChipButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof chipVariants> {}

function FilterChipButton({
  className,
  tone,
  active,
  ...props
}: FilterChipButtonProps) {
  return (
    <button
      type="button"
      className={cn(chipVariants({ tone, active }), className)}
      {...props}
    />
  );
}

export function FilterBar({
  searchPlaceholder = "Cari...",
  onSearch,
  searchDebounceMs = 300,
  chips = [],
  onChipClick,
  showClearAll = false,
  onClearAll,
  rightSlot,
  className,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(val.trim());
    }, searchDebounceMs);
  };

  const clearSearch = () => {
    setSearchValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch("");
  };

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasActiveFilters =
    searchValue.length > 0 || chips.some((c) => c.active);

  return (
    <div
      className={cn(
        "elevation-1 flex flex-col gap-4 rounded-3xl border border-sky-100 bg-card p-4 sm:p-5",
        className
      )}
    >
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" strokeWidth={2} />
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={handleChange}
            placeholder={searchPlaceholder}
            className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 font-body text-sm text-slate-800 shadow-sm placeholder:text-slate-400 transition-all focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:ring-offset-0"
          />
          {searchValue.length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Hapus pencarian"
              className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus-visible:text-sky-700"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-slate-100">
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {showClearAll && hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                if (debounceRef.current) clearTimeout(debounceRef.current);
                onSearch("");
                onClearAll?.();
              }}
              className="font-body inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700 focus:outline-none focus-visible:text-sky-700"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
              Hapus semua filter
            </button>
          )}
          {rightSlot}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <FilterChipButton
              key={chip.key}
              tone={chip.tone}
              active={chip.active}
              onClick={() => onChipClick?.(chip.key)}
            >
              {chip.label}
            </FilterChipButton>
          ))}
        </div>
      )}
    </div>
  );
}
