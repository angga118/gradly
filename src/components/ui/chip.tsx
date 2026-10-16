import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "ink" | "sky" | "butter" | "sage" | "danger" | "outline";

const tones: Record<Tone, string> = {
  ink: "bg-ink text-paper",
  sky: "bg-sky text-ink",
  butter: "bg-butter text-ink",
  sage: "bg-sage text-ink",
  danger: "bg-danger-soft text-danger",
  outline: "border border-ink/25 text-ink",
};

export function Chip({
  tone = "outline",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
