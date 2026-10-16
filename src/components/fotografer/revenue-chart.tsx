import { monthLabel, rupiah, rupiahShort } from "@/lib/format";
import { cn } from "@/lib/cn";

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
  const max = Math.max(1, ...data.flatMap((d) => [d.reguler, d.subsidi]));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-ink" />
          Reguler
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-deep" />
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
            {data.map((d) => (
              <div
                key={d.key}
                className="flex h-full flex-1 items-end justify-center gap-1"
              >
                <Bar
                  value={d.reguler}
                  max={max}
                  className="bg-ink"
                  label={`Reguler ${monthLabel(d.key)} · ${rupiah(d.reguler)}`}
                />
                <Bar
                  value={d.subsidi}
                  max={max}
                  className="bg-sky-deep"
                  label={`Subsidi ${monthLabel(d.key)} · ${rupiah(d.subsidi)}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-between gap-1.5 sm:gap-3">
            {data.map((d) => (
              <span
                key={d.key}
                className="flex-1 text-center text-[10px] text-ink/50 sm:text-xs"
              >
                {monthLabel(d.key)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({
  value,
  max,
  className,
  label,
}: {
  value: number;
  max: number;
  className: string;
  label: string;
}) {
  const pct = Math.max(3, Math.round((value / max) * 100));
  return (
    <div
      title={label}
      aria-label={label}
      role="img"
      className={cn(
        "w-full max-w-[18px] rounded-t-md transition-[height] duration-500",
        className,
      )}
      style={{ height: `${pct}%` }}
    />
  );
}
