"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: React.ReactNode;
  duration: number;
  createdAt: number;
  isDismissing?: boolean;
}

export type ToastOptions = {
  duration?: number;
};

export type ToastFn = (message: React.ReactNode, options?: ToastOptions) => string;

export interface ToastApi {
  success: ToastFn;
  error: ToastFn;
  info: ToastFn;
  warning: ToastFn;
  dismiss: (id?: string) => void;
}

interface ToastContextValue {
  toasts: Toast[];
  api: ToastApi;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 5;

const toneMap: Record<
  ToastType,
  {
    container: string;
    accent: string;
    icon: LucideIcon;
    iconColor: string;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50/95",
    accent: "bg-emerald-500",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
  },
  error: {
    container: "border-rose-200 bg-rose-50/95",
    accent: "bg-rose-500",
    icon: XCircle,
    iconColor: "text-rose-600",
  },
  info: {
    container: "border-sky-200 bg-sky-50/95",
    accent: "bg-sky-500",
    icon: Info,
    iconColor: "text-sky-600",
  },
  warning: {
    container: "border-amber-200 bg-amber-50/95",
    accent: "bg-amber-500",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
};

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  React.useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const reduced = useReducedMotion();
  const timersRef = React.useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clearTimer = React.useCallback((id: string) => {
    const t = timersRef.current.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const scheduleDismiss = React.useCallback(
    (id: string, duration: number) => {
      clearTimer(id);
      if (duration <= 0) return;
      const t = setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isDismissing: true } : t))
        );
        const removeTimer = setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, reduced ? 0 : 180);
        timersRef.current.set(`rm_${id}`, removeTimer);
      }, duration);
      timersRef.current.set(id, t);
    },
    [reduced, clearTimer]
  );

  const pushToast = React.useCallback(
    (type: ToastType, message: React.ReactNode, opts?: ToastOptions): string => {
      const id = genId();
      const defaultDur: number =
        type === "error" || type === "warning" ? 0 : 3000;
      const duration = opts?.duration ?? defaultDur;
      const toast: Toast = {
        id,
        type,
        message,
        duration,
        createdAt: Date.now(),
      };
      setToasts((prev) => {
        const withOverflow = [...prev, toast];
        if (withOverflow.length <= MAX_TOASTS) return withOverflow;
        const excess = withOverflow.length - MAX_TOASTS;
        return withOverflow.slice(excess);
      });
      scheduleDismiss(id, duration);
      return id;
    },
    [scheduleDismiss]
  );

  const dismiss = React.useCallback(
    (id?: string) => {
      if (id === undefined) {
        setToasts((prev) => prev.map((t) => ({ ...t, isDismissing: true })));
        const removeTimer = setTimeout(() => {
          setToasts([]);
        }, reduced ? 0 : 200);
        timersRef.current.set("rm_all", removeTimer);
        return;
      }
      clearTimer(id);
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isDismissing: true } : t))
      );
      const removeTimer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, reduced ? 0 : 180);
      timersRef.current.set(`rm_${id}`, removeTimer);
    },
    [reduced, clearTimer]
  );

  const api: ToastApi = React.useMemo(
    () => ({
      success: (msg, opts) => pushToast("success", msg, opts),
      error: (msg, opts) => pushToast("error", msg, opts),
      info: (msg, opts) => pushToast("info", msg, opts),
      warning: (msg, opts) => pushToast("warning", msg, opts),
      dismiss,
    }),
    [pushToast, dismiss]
  );

  React.useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const [, t] of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, api }}>
      {children}
      <ToastViewport toasts={toasts} reduced={reduced} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  reduced,
  onDismiss,
}: {
  toasts: Toast[];
  reduced: boolean;
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "pointer-events-none fixed gap-3 right-3 top-10 z-100 max-w-sm -space-y-3.5",
        "sm:right-6 sm:top-10 sm:w-96 sm:items-end"
      )}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          reduced={reduced}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  reduced,
  onDismiss,
}: {
  toast: Toast;
  reduced: boolean;
  onDismiss: (id: string) => void;
}) {
  const tone = toneMap[toast.type];
  const Icon = tone.icon;
  const [visible, setVisible] = React.useState(reduced);

  React.useEffect(() => {
    if (reduced) return;
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 backdrop-blur-sm elevation-3",
        tone.container,
        toast.isDismissing || !visible
          ? reduced
            ? "opacity-0"
            : ""
          : "",
        !reduced && "transition-all duration-200 ease-out"
      )}
      style={
        reduced
          ? undefined
          : {
              transform:
                visible && !toast.isDismissing
                  ? "translateY(0) scale(1)"
                  : "translateY(10px) scale(0.98)",
              opacity: visible && !toast.isDismissing ? 1 : 0,
            }
      }
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-1",
          tone.accent
        )}
      />
      <div className="flex items-start gap-3 pl-1">
        <div
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center",
            tone.iconColor
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="font-body text-sm font-semibold leading-snug text-slate-800">
            {toast.message}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60"
        >
          <X className="h-4 w-4" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  );
}

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus digunakan di dalam <ToastProvider>");
  }
  return ctx.api;
}
