import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";

const STEPS = ["Ringkasan", "Detail Acara", "Pembayaran"] as const;

export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-3" aria-label="Langkah pemesanan">
      {STEPS.map((label, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-3">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors",
                done && "bg-ink text-paper",
                active && "bg-ink text-paper ring-4 ring-ink/15",
                !done && !active && "border border-ink/25 text-ink/50",
              )}
            >
              {done ? <Icon name="check" size={16} /> : n}
            </span>
            <span
              className={cn(
                "whitespace-nowrap text-sm",
                active ? "font-medium text-ink" : "text-ink/55",
                !active && "hidden sm:inline",
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 ? (
              <span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
