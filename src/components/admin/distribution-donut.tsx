"use client";

import { cn } from "@/lib/cn";

export interface DistributionSlice {
  label: string;
  value: number;
  /** Tailwind background class for the swatch and arc. */
  className: string;
  /** Raw stroke color for the SVG arc. */
  color: string;
}

export function DistributionDonut({
  slices,
  centerLabel,
  centerValue,
  className,
}: {
  slices: DistributionSlice[];
  centerLabel: string;
  centerValue: string;
  className?: string;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className={cn("flex flex-col items-center gap-6 sm:flex-row", className)}>
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            strokeWidth="16"
            className="stroke-ink/10"
          />
          {total > 0
            ? slices.map((s) => {
                const length = (s.value / total) * circumference;
                const dash = `${length} ${circumference - length}`;
                const el = (
                  <circle
                    key={s.label}
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    strokeWidth="16"
                    strokeLinecap="butt"
                    stroke={s.color}
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                  />
                );
                offset += length;
                return el;
              })
            : null}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-serif text-2xl leading-none">{centerValue}</span>
          <span className="mt-1 text-xs text-ink/55">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full space-y-3">
        {slices.map((s) => {
          const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
          return (
            <li key={s.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", s.className)} />
                  {s.label}
                </span>
                <span className="tabular-nums text-ink/70">
                  {s.value} klien · {pct}%
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                  className={cn("h-full rounded-full", s.className)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
