"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc" | null;

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  pageSizeOptions?: number[];
  selectable?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  rowKey?: (row: T, index: number) => string | number;
  onSelectionChange?: (selected: T[]) => void;
  className?: string;
}

const checkboxVariants = cva(
  "h-4 w-4 shrink-0 cursor-pointer rounded-md border-2 border-slate-300 bg-white text-sky-600 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      state: {
        unchecked: "",
        checked:
          "border-sky-500 bg-sky-500 [&_span.check]:opacity-100",
        indeterminate:
          "border-sky-500 bg-sky-500 [&_span.dash]:opacity-100",
      },
    },
    defaultVariants: {
      state: "unchecked",
    },
  }
);

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">,
    VariantProps<typeof checkboxVariants> {
  indeterminate?: boolean;
}

function Checkbox({
  className,
  indeterminate,
  checked,
  onChange,
  ...props
}: CheckboxProps) {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current && indeterminate !== undefined) {
      ref.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  const resolvedState: VariantProps<typeof checkboxVariants>["state"] =
    indeterminate && !checked ? "indeterminate" : checked ? "checked" : "unchecked";

  return (
    <label
      className={cn(
        checkboxVariants({ state: resolvedState }),
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="sr-only"
        checked={!!checked}
        onChange={onChange}
        {...props}
      />
      <span className="check pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity">
        <svg viewBox="0 0 16 16" className="h-3 w-3 fill-none text-white">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="dash pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity">
        <span className="block h-0.5 w-2 rounded-full bg-white" />
      </span>
    </label>
  );
}

function getNestedValue(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  const aStr = String(a ?? "").toLowerCase();
  const bStr = String(b ?? "").toLowerCase();
  return aStr.localeCompare(bStr, "id-ID");
}

export function DataTable<T>({
  columns,
  data,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50],
  selectable = false,
  emptyMessage = "Tidak ada data untuk ditampilkan.",
  loading = false,
  rowKey,
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<SortDirection>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    new Set()
  );
  const [innerPageSize, setInnerPageSize] = React.useState(pageSize);

  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDir) return data;
    const sorted = [...data].sort((a, b) => {
      const valA = getNestedValue(a, sortKey);
      const valB = getNestedValue(b, sortKey);
      const cmp = compareValues(valA, valB);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / innerPageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = React.useMemo(() => {
    const start = (safePage - 1) * innerPageSize;
    return sortedData.slice(start, start + innerPageSize);
  }, [sortedData, safePage, innerPageSize]);

  const startIdx = sortedData.length === 0 ? 0 : (safePage - 1) * innerPageSize + 1;
  const endIdx = Math.min(safePage * innerPageSize, sortedData.length);

  const getRowKey = React.useCallback(
    (row: T, idx: number): string => {
      if (rowKey) return String(rowKey(row, idx));
      const pk = (row as { id?: string | number }).id;
      return pk !== undefined ? String(pk) : `row-${idx}`;
    },
    [rowKey]
  );

  const visibleKeys = React.useMemo(
    () => new Set(paginatedData.map((r, i) => getRowKey(r, i + (safePage - 1) * innerPageSize))),
    [paginatedData, safePage, innerPageSize, getRowKey]
  );

  const allVisibleSelected =
    visibleKeys.size > 0 &&
    Array.from(visibleKeys).every((k) => selectedKeys.has(k));
  const someVisibleSelected = Array.from(visibleKeys).some((k) =>
    selectedKeys.has(k)
  );

  const handleSort = (colKey: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey !== colKey) {
      setSortKey(colKey);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else if (sortDir === "desc") {
      setSortKey(null);
      setSortDir(null);
    } else {
      setSortDir("asc");
    }
  };

  const toggleRowSelected = (rowKeyStr: string, row: T) => {
    void row;
    const next = new Set(selectedKeys);
    if (next.has(rowKeyStr)) {
      next.delete(rowKeyStr);
    } else {
      next.add(rowKeyStr);
    }
    setSelectedKeys(next);
    if (onSelectionChange) {
      const map = new Map(
        sortedData.map((r, i) => [getRowKey(r, i), r])
      );
      const list: T[] = [];
      next.forEach((k) => {
        const r = map.get(k);
        if (r) list.push(r);
      });
      onSelectionChange(list);
    }
  };

  const toggleAllVisible = () => {
    const next = new Set(selectedKeys);
    if (allVisibleSelected) {
      visibleKeys.forEach((k) => next.delete(k));
    } else {
      visibleKeys.forEach((k) => next.add(k));
    }
    setSelectedKeys(next);
    if (onSelectionChange) {
      const map = new Map(
        sortedData.map((r, i) => [getRowKey(r, i), r])
      );
      const list: T[] = [];
      next.forEach((k) => {
        const r = map.get(k);
        if (r) list.push(r);
      });
      onSelectionChange(list);
    }
  };

  const SkeletonRow = () => (
    <tr>
      {selectable && (
        <td className="py-3.5 pl-5 pr-3">
          <span className="block h-4 w-4 rounded-md bg-slate-100 shimmer-placeholder" />
        </td>
      )}
      {columns.map((col, idx) => (
        <td
          key={`skel-${col.key}-${idx}`}
          className="py-3.5 px-3 first:pl-5 last:pr-5"
          style={{ width: col.width }}
        >
          <span
            className={cn(
              "block h-3.5 rounded-md bg-slate-100 shimmer-placeholder",
              idx === 0 ? "w-2/3" : idx === columns.length - 1 ? "w-1/3" : "w-1/2"
            )}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div
      className={cn(
        "elevation-1 overflow-hidden rounded-3xl border border-sky-100 bg-white",
        className
      )}
    >
      <div className="overflow-x-auto subtle-scroll">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {selectable && (
                <th className="sticky top-0 z-10 w-12 px-3 py-3 pl-5 text-left bg-slate-50/80 backdrop-blur">
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && someVisibleSelected}
                    onChange={toggleAllVisible}
                    disabled={loading || paginatedData.length === 0}
                    aria-label="Pilih semua baris yang terlihat"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const alignCls =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";
                return (
                  <th
                    key={col.key}
                    className={cn(
                      "sticky top-0 z-10 px-3 py-3 first:pl-5 last:pr-5 whitespace-nowrap font-caption text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50/80 backdrop-blur",
                      alignCls,
                      col.sortable ? "cursor-pointer select-none" : ""
                    )}
                    style={{ width: col.width }}
                    onClick={() => handleSort(col.key, col.sortable)}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5",
                        col.sortable
                          ? "transition-colors hover:text-sky-700"
                          : ""
                      )}
                    >
                      {col.header}
                      {col.sortable && (
                        <span
                          className={cn(
                            "inline-flex h-4 w-4 items-center justify-center rounded",
                            isSorted ? "text-sky-600" : "text-slate-300"
                          )}
                        >
                          {isSorted && sortDir === "asc" ? (
                            <ArrowUp className="h-3 w-3" strokeWidth={2.5} />
                          ) : isSorted && sortDir === "desc" ? (
                            <ArrowDown className="h-3 w-3" strokeWidth={2.5} />
                          ) : (
                            <ArrowUpDown className="h-3 w-3" strokeWidth={2.25} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={`skel-row-${i}`} />
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3 px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                      <Inbox className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <p className="font-body text-sm font-medium text-slate-700">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const globalIdx = (safePage - 1) * innerPageSize + idx;
                const rowKeyStr = getRowKey(row, globalIdx);
                const isSelected = selectedKeys.has(rowKeyStr);
                return (
                  <tr
                    key={rowKeyStr}
                    className={cn(
                      "border-b border-slate-50 transition-colors last:border-b-0",
                      isSelected
                        ? "bg-sky-50/50 hover:bg-sky-50"
                        : "hover:bg-slate-50"
                    )}
                  >
                    {selectable && (
                      <td className="w-12 px-3 py-3.5 pl-5 align-top">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRowSelected(rowKeyStr, row)}
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const alignCls =
                        col.align === "center"
                          ? "text-center"
                          : col.align === "right"
                          ? "text-right"
                          : "text-left";
                      const content = col.cell
                        ? col.cell(row)
                        : (getNestedValue(row, col.key) as React.ReactNode);
                      return (
                        <td
                          key={`${rowKeyStr}-${col.key}`}
                          className={cn(
                            "px-3 py-3.5 first:pl-5 last:pr-5 align-top font-body text-sm text-slate-700",
                            alignCls
                          )}
                          style={{ width: col.width }}
                        >
                          {content === null || content === undefined
                            ? ""
                            : content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row">
        <div className="flex items-center gap-4">
          <p className="font-body text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700 tabular-nums">
              {startIdx}
            </span>
            {" - "}
            <span className="font-semibold text-slate-700 tabular-nums">
              {endIdx}
            </span>
            {" dari "}
            <span className="font-semibold text-slate-700 tabular-nums">
              {sortedData.length.toLocaleString("id-ID")}
            </span>
          </p>
          {selectable && selectedKeys.size > 0 && (
            <span className="font-caption rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
              {selectedKeys.size} dipilih
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="pageSizeSelect"
              className="font-body text-xs font-medium text-slate-500"
            >
              Baris per halaman
            </label>
            <select
              id="pageSizeSelect"
              value={innerPageSize}
              onChange={(e) => {
                setInnerPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-body text-xs font-medium text-slate-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/60 focus:ring-offset-1 disabled:opacity-50"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1 || loading}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Button>
            <div className="flex items-center gap-1 px-1">
              <span className="font-body min-w-[3.5rem] px-2 text-center text-xs font-semibold text-slate-700 tabular-nums">
                {safePage} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages || loading}
              aria-label="Halaman selanjutnya"
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .shimmer-placeholder {
              background: linear-gradient(
                90deg,
                var(--slate-100) 0%,
                var(--slate-50) 50%,
                var(--slate-100) 100%
              );
              background-size: 200% 100%;
              animation: shimmer 1.6s ease-in-out infinite;
            }
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            @media (prefers-reduced-motion: reduce) {
              .shimmer-placeholder { animation: none; }
            }
          `,
        }}
      />
    </div>
  );
}
