"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  height?: number;
  barColor?: string;
  showValue?: boolean;
  showAxisY?: boolean;
  yTicks?: number;
  className?: string;
}

export function BarChart({
  data,
  height = 180,
  barColor = "#0ea5e9",
  showValue = false,
  showAxisY = true,
  yTicks = 4,
  className,
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(
    null
  );

  const maxValue = React.useMemo(() => {
    const raw = Math.max(0, ...data.map((d) => d.value));
    const padded = raw * 1.1;
    if (padded === 0) return 1;
    const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
    const steps = Math.ceil(padded / magnitude);
    return steps * magnitude;
  }, [data]);

  const paddingLeft = showAxisY ? 44 : 16;
  const paddingRight = 16;
  const paddingTop = showValue ? 28 : 16;
  const paddingBottom = 36;

  const ticks = React.useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i <= yTicks; i++) {
      result.push((maxValue / yTicks) * i);
    }
    return result;
  }, [maxValue, yTicks]);

  return (
    <div
      className={cn("relative w-full select-none", className)}
      style={{ minHeight: height }}
    >
      <div
        className="relative"
        style={{ height }}
        onMouseLeave={() => {
          setHoveredIdx(null);
          setTooltipPos(null);
        }}
      >
        <svg
          viewBox={`0 0 800 ${height}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Bar chart"
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={barColor} stopOpacity="0.95" />
              <stop offset="100%" stopColor={barColor} stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {ticks.map((t, i) => {
            const y =
              height -
              paddingBottom -
              (t / maxValue) * (height - paddingTop - paddingBottom);
            return (
              <g key={`tick-${i}`}>
                {showAxisY && (
                  <line
                    x1={paddingLeft}
                    x2={800 - paddingRight}
                    y1={y}
                    y2={y}
                    stroke="var(--slate-100)"
                    strokeWidth={i === 0 ? 1.5 : 1}
                    strokeDasharray={i === 0 ? undefined : "4 4"}
                  />
                )}
                {showAxisY && (
                  <text
                    x={paddingLeft - 10}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-slate-400"
                    fontSize="10"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {Math.round(t).toLocaleString("id-ID")}
                  </text>
                )}
              </g>
            );
          })}

          {data.length > 0 &&
            (() => {
              const chartWidth = 800 - paddingLeft - paddingRight;
              const barSlot = chartWidth / data.length;
              const barWidth = Math.min(42, barSlot * 0.6);

              return data.map((d, idx) => {
                const ratio = Math.max(0, Math.min(1, d.value / maxValue));
                const barHeight =
                  ratio * (height - paddingTop - paddingBottom);
                const x =
                  paddingLeft + barSlot * idx + (barSlot - barWidth) / 2;
                const y = height - paddingBottom - barHeight;
                const isHovered = hoveredIdx === idx;

                return (
                  <g
                    key={`bar-${d.label}-${idx}`}
                    onMouseEnter={(e) => {
                      setHoveredIdx(idx);
                      const rect = (e.target as SVGElement)
                        .closest("svg")
                        ?.getBoundingClientRect();
                      if (rect) {
                        const svgX =
                          e.clientX - rect.left;
                        const svgY = e.clientY - rect.top;
                        setTooltipPos({ x: svgX, y: svgY });
                      }
                    }}
                    onMouseMove={(e) => {
                      const rect = (e.target as SVGElement)
                        .closest("svg")
                        ?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={x}
                      y={isHovered ? y - 2 : y}
                      width={barWidth}
                      height={Math.max(2, barHeight)}
                      rx={6}
                      ry={6}
                      fill="url(#barGradient)"
                      style={{
                        filter: isHovered
                          ? `drop-shadow(0 6px 10px rgb(15 23 42 / 0.15)) brightness(1.12)`
                          : hoveredIdx !== null
                          ? "opacity(0.5)"
                          : undefined,
                        transition:
                          "y 180ms cubic-bezier(0.4,0,0.2,1), filter 180ms ease, opacity 180ms ease",
                      }}
                    />
                    {showValue && barHeight > 24 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 8}
                        textAnchor="middle"
                        className="fill-slate-700"
                        fontSize="11"
                        fontWeight={600}
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {d.value.toLocaleString("id-ID")}
                      </text>
                    )}
                    <text
                      x={x + barWidth / 2}
                      y={height - paddingBottom + 16}
                      textAnchor="middle"
                      className="fill-slate-500"
                      fontSize="10"
                      fontWeight={500}
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {d.label.length > 10
                        ? `${d.label.slice(0, 8)}..`
                        : d.label}
                    </text>
                  </g>
                );
              });
            })()}
        </svg>

        {hoveredIdx !== null && tooltipPos && data[hoveredIdx] && (
          <div
            className="pointer-events-none absolute z-10 elevation-3 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 10,
              transform: "translate(-50%, -100%)",
              minWidth: 96,
            }}
          >
            <p className="font-caption text-xs text-slate-500">
              {data[hoveredIdx].label}
            </p>
            <p className="mt-0.5 font-h4 text-sm font-bold text-slate-900 tabular-nums">
              {data[hoveredIdx].value.toLocaleString("id-ID")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
