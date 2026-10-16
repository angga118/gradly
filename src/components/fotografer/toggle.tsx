"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Toggle({
  checked,
  onChange,
  disabled,
  title,
  description,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  title?: ReactNode;
  description?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors",
        disabled
          ? "cursor-not-allowed border-ink/10 bg-ink/5 opacity-70"
          : "border-ink/15 bg-white/60 hover:border-ink/30",
      )}
    >
      <span className="min-w-0">
        {title ? (
          <span className="block text-sm font-medium text-ink">{title}</span>
        ) : null}
        {description ? (
          <span className="mt-0.5 block text-xs text-ink/55">{description}</span>
        ) : null}
      </span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-ink" : "bg-ink/20",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-paper shadow-sm transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-[2px]",
          )}
        />
      </span>
    </button>
  );
}
