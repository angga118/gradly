"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { monthLabel, rupiah, rupiahShort } from "@/lib/format";

export interface MonthlyPoint {
  key: string;
  reguler: number;
  subsidi: number;
}

const TICKS = [1, 0.75, 0.5, 0.25, 0];

export function RevenueChart({
  data,
  className,
}: {
  data: MonthlyPoint[];
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...data.flatMap((d) => [d.reguler, d.subsidi]));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
          Reguler
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-butter-deep" />
          Subsidi
        </span>
      </div>

      <div className="flex gap-2">
        <div className="flex h-52 w-11 shrink-0 flex-col justify-between text-right text-[10px] tabular-nums text-ink/40">
          {TICKS.map((t) => (
            <span key={t}>{rupiahShort(Math.round(max * t))}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52">
            {TICKS.map((t) => (
              <span
                key={t}
                className="absolute inset-x-0 border-t border-dashed border-ink/10"
                style={{ top: `${(1 - t) * 100}%` }}
              />
            ))}
          </div>

          <div className="relative flex h-52 items-end justify-between gap-1.5 sm:gap-3">
            {data.map((d, i) => (
              <button
                key={d.key}
                type="button"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${monthLabel(d.key)}: reguler ${rupiah(d.reguler)}, subsidi ${rupiah(d.subsidi)}`}
                className="group flex h-full flex-1 items-end justify-center gap-1"
              >
                <Bar
                  value={d.reguler}
                  max={max}
                  className="bg-ink"
                  dim={active !== null && active !== i}
                />
                <Bar
                  value={d.subsidi}
                  max={max}
                  className="bg-butter-deep"
                  dim={active !== null && active !== i}
                />
              </button>
            ))}
          </div>

          <div className="mt-2 flex justify-between gap-1.5 sm:gap-3">
            {data.map((d, i) => (
              <span
                key={d.key}
                className={cn(
                  "flex-1 text-center text-[10px] transition-colors sm:text-xs",
                  active === i ? "font-medium text-ink" : "text-ink/50",
                )}
              >
                {monthLabel(d.key)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 min-h-10 rounded-xl border border-ink/10 bg-white/50 px-4 py-2.5 text-sm">
        {active === null ? (
          <p className="text-ink/50">
            Arahkan kursor ke batang untuk melihat rincian bulan.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="font-medium">{monthLabel(data[active].key)}</span>
            <span className="inline-flex items-center gap-1.5 text-ink/70">
              <span className="h-2 w-2 rounded-full bg-ink" />
              Reguler {rupiah(data[active].reguler)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink/70">
              <span className="h-2 w-2 rounded-full bg-butter-deep" />
              Subsidi {rupiah(data[active].subsidi)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
  dim,
}: {
  value: number;
  max: number;
  className: string;
  dim: boolean;
}) {
  const pct = Math.max(3, Math.round((value / max) * 100));
  return (
    <span
      className={cn(
        "w-full max-w-[18px] rounded-t-md transition-all duration-300",
        className,
        dim && "opacity-40",
      )}
      style={{ height: `${pct}%` }}
    />
  );
}
