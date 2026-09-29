"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

const toneMap = {
  sky: {
    wrapper: "bg-sky-50 text-sky-600",
    accent: "text-sky-600",
    ring: "ring-sky-100",
  },
  emerald: {
    wrapper: "bg-emerald-50 text-emerald-600",
    accent: "text-emerald-600",
    ring: "ring-emerald-100",
  },
  amber: {
    wrapper: "bg-amber-50 text-amber-600",
    accent: "text-amber-600",
    ring: "ring-amber-100",
  },
  rose: {
    wrapper: "bg-rose-50 text-rose-600",
    accent: "text-rose-600",
    ring: "ring-rose-100",
  },
  violet: {
    wrapper: "bg-violet-50 text-violet-600",
    accent: "text-violet-600",
    ring: "ring-violet-100",
  },
  slate: {
    wrapper: "bg-slate-100 text-slate-600",
    accent: "text-slate-600",
    ring: "ring-slate-200",
  },
} as const;

type ColorTone = keyof typeof toneMap;

export interface StatCardProps {
  icon?: LucideIcon;
  value: number | string;
  valueSuffix?: string;
  label: string;
  sublabel?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
    positive?: boolean;
  };
  colorTone?: ColorTone;
  className?: string;
}

function useStatCounter(
  target: number,
  suffix: string,
  enabled: boolean
) {
  const ref = React.useRef<HTMLSpanElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const render = (v: number) => {
      el.textContent = `${Math.round(v).toLocaleString("id-ID")}${suffix}`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(target);
      return;
    }

    render(0);
    const obj = { value: 0 };
    let anim: ReturnType<typeof animate> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          anim = animate(obj, {
            value: target,
            duration: 1200,
            ease: "outExpo",
            onUpdate: () => render(obj.value),
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      anim?.revert();
    };
  }, [target, suffix, enabled]);

  return ref;
}

export function StatCard({
  icon: Icon,
  value,
  valueSuffix = "",
  label,
  sublabel,
  trend,
  colorTone = "sky",
  className,
}: StatCardProps) {
  const tone = toneMap[colorTone];
  const isNumeric = typeof value === "number";
  const counterRef = useStatCounter(
    isNumeric ? (value as number) : 0,
    valueSuffix,
    isNumeric
  );

  const trendPositive = trend
    ? trend.positive ?? trend.direction === "up"
    : undefined;

  return (
    <div
      className={cn(
        "elevation-2 hover-lift group relative overflow-hidden rounded-3xl border border-sky-100 bg-card p-6 transition-shadow duration-200 hover:elevation-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-body text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            {isNumeric ? (
              <span
                ref={counterRef}
                className={cn(
                  "font-display inline-block font-bold tracking-tight text-slate-900",
                  "text-[2rem] leading-none"
                )}
              />
            ) : (
              <span
                className={cn(
                  "font-display inline-block font-bold tracking-tight text-slate-900",
                  "text-[2rem] leading-none"
                )}
              >
                {value}
                {valueSuffix && (
                  <span className="text-base font-semibold text-slate-500">
                    {valueSuffix}
                  </span>
                )}
              </span>
            )}
          </div>
          {sublabel && (
            <p className="mt-1 font-caption text-xs text-slate-400">
              {sublabel}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-2 ring-inset transition-transform duration-200 group-hover:scale-105",
              tone.wrapper,
              tone.ring
            )}
            aria-hidden
          >
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-caption text-xs font-semibold",
              trendPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}
          </span>
          <span className="font-caption text-xs text-slate-400">
            vs periode sebelumnya
          </span>
        </div>
      )}
    </div>
  );
}
