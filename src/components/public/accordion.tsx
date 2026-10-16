"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icons";

export interface FaqItem {
  q: string;
  a: string;
}

/** Accordion tanya-jawab. Satu item terbuka pada satu waktu. */
export function Accordion({
  items,
  defaultOpen = 0,
  className,
}: {
  items: FaqItem[];
  defaultOpen?: number | null;
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div
      className={cn(
        "divide-y divide-ink/10 overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-white/60 shadow-soft",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.035]"
            >
              <span className="font-medium text-ink">{item.q}</span>
              <Icon
                name="chevronDown"
                size={18}
                className={cn(
                  "shrink-0 text-ink/50 transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-300 ease-out motion-reduce:transition-none",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-ink/70">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
