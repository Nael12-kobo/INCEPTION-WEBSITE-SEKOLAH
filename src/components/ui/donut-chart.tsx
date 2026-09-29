"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string | number;
  centerSubLabel?: string;
  className?: string;
}

export function DonutChart({
  segments,
  size = 180,
  thickness = 24,
  centerLabel,
  centerSubLabel,
  className,
}: DonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const computed = React.useMemo(() => {
    type SegComputed = {
      portion: number;
      dashLength: number;
      dashGap: number;
      segmentOffset: number;
    };
    const init: { sum: number; items: SegComputed[] } = { sum: 0, items: [] };
    const { items } = segments.reduce((carry, seg) => {
      const portion = seg.value / total;
      const dashLength = portion * circumference;
      const dashGap = circumference - dashLength;
      const segmentOffset = circumference * (1 - carry.sum) + dashGap;
      const nextSum = carry.sum + portion;
      const nextItems = [
        ...carry.items,
        { portion, dashLength, dashGap, segmentOffset },
      ];
      return { sum: nextSum, items: nextItems };
    }, init);
    return items;
  }, [segments, total, circumference]);

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-8",
        className
      )}
    >
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="h-full w-full -rotate-90"
          role="img"
          aria-label="Donut chart"
        >
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="var(--slate-100)"
            strokeWidth={thickness}
          />
          {segments.map((seg, idx) => {
            const c = computed[idx];
            const dashLength = c.dashLength;
            const dashGap = c.dashGap;
            const segmentOffset = c.segmentOffset;

            const isHovered = hoveredIdx === idx;
            const transform = isHovered
              ? `scale(1.04)`
              : "scale(1)";
            const transformOrigin = `${cx}px ${cy}px`;

            return (
              <circle
                key={`${seg.label}-${idx}`}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dashLength} ${dashGap}`}
                strokeDashoffset={segmentOffset}
                strokeLinecap="butt"
                style={{
                  transformOrigin,
                  transform,
                  transition:
                    "transform 200ms cubic-bezier(0.4, 0, 0.2, 1), filter 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease",
                  filter: isHovered
                    ? "drop-shadow(0 4px 6px rgb(15 23 42 / 0.12)) brightness(1.08)"
                    : hoveredIdx !== null
                    ? "opacity(0.55)"
                    : undefined,
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              />
            );
          })}
        </svg>

        {(centerLabel !== undefined || centerSubLabel) && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
            style={{ width: size, height: size }}
          >
            {centerLabel !== undefined && (
              <span className="font-display block text-2xl font-bold text-slate-900 leading-none">
                {centerLabel}
              </span>
            )}
            {centerSubLabel && (
              <span className="mt-1 font-caption text-xs text-slate-500 leading-tight">
                {centerSubLabel}
              </span>
            )}
          </div>
        )}
      </div>

      <ul className="flex w-full max-w-xs flex-col gap-2.5 sm:w-auto">
        {segments.map((seg, idx) => {
          const percent = ((seg.value / total) * 100).toFixed(1);
          const isHovered = hoveredIdx === idx;
          return (
            <li
              key={`legend-${seg.label}-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors",
                isHovered ? "bg-slate-50" : "hover:bg-slate-50/60"
              )}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-md ring-2 ring-white shadow-sm"
                style={{ backgroundColor: seg.color }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-body text-sm font-medium text-slate-700">
                {seg.label}
              </span>
              <span className="font-body text-sm font-semibold tabular-nums text-slate-900">
                {seg.value.toLocaleString("id-ID")}
              </span>
              <span className="w-12 text-right font-caption text-xs tabular-nums text-slate-500">
                {percent}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
