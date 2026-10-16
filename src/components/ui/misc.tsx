import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icons";

export function Rating({
  value,
  count,
  size = 14,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-ink">
      <Icon name="star" size={size} className="fill-butter-deep text-butter-deep" />
      <span className="font-medium">{value.toFixed(1)}</span>
      {count !== undefined ? (
        <span className="text-ink/50">({count})</span>
      ) : null}
    </span>
  );
}

export function Avatar({
  name,
  size = 40,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-serif text-paper",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  icon,
  tone = "paper",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "paper" | "sky" | "butter" | "sage";
}) {
  const tones = {
    paper: "bg-white/70",
    sky: "bg-sky/70",
    butter: "bg-butter/70",
    sage: "bg-sage/60",
  } as const;
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-ink/10 p-5",
        tones[tone],
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">{label}</p>
        {icon ? <span className="text-ink/50">{icon}</span> : null}
      </div>
      <p className="mt-2 font-serif text-2xl leading-none">{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink/55">{hint}</p> : null}
    </div>
  );
}

export function Progress({
  value,
  max = 100,
  tone = "ink",
  className,
}: {
  value: number;
  max?: number;
  tone?: "ink" | "sage" | "butter";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const tones = { ink: "bg-ink", sage: "bg-sage-deep", butter: "bg-butter-deep" };
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-ink/10", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full", tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({
  icon = "info",
  title,
  description,
  action,
}: {
  icon?: Parameters<typeof Icon>[0]["name"];
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-ink/20 bg-white/40 px-6 py-14 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sage/50 text-ink">
        <Icon name={icon} size={22} />
      </span>
      <p className="font-serif text-lg">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-ink/60">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl leading-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-3 text-base text-ink/65">{description}</p>
      ) : null}
    </div>
  );
}
