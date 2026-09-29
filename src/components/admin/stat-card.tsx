import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: "up" | "down";
    value: string;
    label?: string;
  };
  accent?: "sky" | "emerald" | "amber" | "rose" | "violet" | "slate";
  description?: string;
  className?: string;
}

const accentMap = {
  sky: {
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    dot: "bg-sky-500",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    dot: "bg-amber-500",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    dot: "bg-rose-500",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    dot: "bg-violet-500",
  },
  slate: {
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
    dot: "bg-slate-500",
  },
} as const;

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = "sky",
  description,
  className,
}: StatCardProps) {
  const colors = accentMap[accent];
  const trendIsUp = trend?.direction === "up";

  return (
    <Card className={cn("hover-lift", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 min-w-0">
            <p className="font-caption font-medium text-slate-500 truncate">{title}</p>
            <p className="font-display text-slate-900 tracking-tight leading-none">
              {value}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-caption text-[11px] font-semibold",
                    trendIsUp ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {trendIsUp ? "↑" : "↓"} {trend.value}
                </span>
                {trend.label && (
                  <span className="font-caption text-[11px] text-slate-400">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
            {description && !trend && (
              <p className="font-caption text-[11px] text-slate-400 pt-1">
                {description}
              </p>
            )}
          </div>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              colors.iconBg
            )}
          >
            <Icon className={cn("h-5 w-5", colors.iconColor)} strokeWidth={2} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
