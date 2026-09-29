"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileJson, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExportColumn {
  key: string;
  label: string;
}

export interface ExportButtonProps {
  filename?: string;
  data: Record<string, unknown>[];
  columns?: ExportColumn[];
  className?: string;
}

function getValueByKey(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return "";
    if (typeof current !== "object") return current;
    current = (current as Record<string, unknown>)[part];
  }
  return current ?? "";
}

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  if (value instanceof Date) return value.toLocaleString("id-ID");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function escapeCsv(value: string): string {
  const needsQuote =
    value.includes(";") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");
  if (!needsQuote) return value;
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function ExportButton({
  filename = "export",
  data,
  columns,
  className,
}: ExportButtonProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  const resolvedColumns: ExportColumn[] = React.useMemo(() => {
    if (columns && columns.length > 0) return columns;
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]);
    return keys.map((k) => ({ key: k, label: k }));
  }, [columns, data]);

  const triggerDownload = (blob: Blob, ext: string) => {
    const finalName =
      `${filename}-${new Date().toISOString().slice(0, 10)}.${ext}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = finalName;
    a.hidden = true;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const exportCsv = () => {
    const header = resolvedColumns.map((c) => escapeCsv(c.label));
    const rows = data.map((row) =>
      resolvedColumns
        .map((col) => escapeCsv(stringifyCell(getValueByKey(row, col.key))))
        .join(";")
    );
    const csv = "\uFEFF" + [header.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    triggerDownload(blob, "csv");
    setOpen(false);
  };

  const exportJson = () => {
    const formatted = data.map((row) => {
      const obj: Record<string, unknown> = {};
      for (const col of resolvedColumns) {
        obj[col.label] = getValueByKey(row, col.key);
      }
      return obj;
    });
    const json = JSON.stringify(formatted, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    triggerDownload(blob, "json");
    setOpen(false);
  };

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const disabled = data.length === 0 || resolvedColumns.length === 0;

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download className="h-4 w-4" strokeWidth={2} />
        Export
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-150",
            open ? "rotate-180" : ""
          )}
          strokeWidth={2.25}
        />
      </Button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in elevation-3 absolute right-0 top-full z-40 mt-2 w-48 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white py-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={exportCsv}
            disabled={disabled}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left font-body text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:outline-none focus:bg-sky-50 focus:text-sky-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet
              className="h-4 w-4 text-emerald-600"
              strokeWidth={2}
            />
            Export CSV
          </button>
          <div className="mx-2 my-1 h-px bg-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={exportJson}
            disabled={disabled}
            className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left font-body text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-800 focus:outline-none focus:bg-sky-50 focus:text-sky-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileJson className="h-4 w-4 text-violet-600" strokeWidth={2} />
            Export JSON
          </button>
        </div>
      )}
    </div>
  );
}
