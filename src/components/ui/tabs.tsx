"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  value: string;
  label: string;
  count?: number;
}

const TabsContext = createContext<{
  tabId: (value: string) => string;
  panelId: (value: string) => string;
} | null>(null);

export function Tabs({
  tabs,
  value,
  onChange,
  label = "Filter",
  className,
}: {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}) {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (v: string) => `${base}-tab-${v}`;
  const panelId = (v: string) => `${base}-panel-${v}`;

  function move(index: number) {
    if (tabs.length === 0) return;
    const next = (index + tabs.length) % tabs.length;
    const target = tabs[next];
    if (!target) return;
    onChange(target.value);
    buttons.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const current = tabs.findIndex((t) => t.value === value);
    if (current < 0) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(current + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(tabs.length - 1);
    }
  }

  return (
    <TabsContext.Provider value={{ tabId, panelId }}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className={cn(
          "no-scrollbar flex gap-1 overflow-x-auto rounded-full border border-ink/10 bg-white/60 p-1",
          className,
        )}
      >
        {tabs.map((tab, index) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              role="tab"
              type="button"
              id={tabId(tab.value)}
              aria-controls={panelId(tab.value)}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(tab.value)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                active ? "bg-ink text-paper" : "text-ink/65 hover:bg-ink/5 hover:text-ink",
              )}
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 text-xs",
                    active ? "bg-paper/20" : "bg-ink/8",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </TabsContext.Provider>
  );
}

/**
 * Isi tab. Taruh di dalam `Tabs` agar `aria-controls` tab menunjuk ke
 * panel yang benar.
 */
export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  return (
    <div
      id={ctx?.panelId(value)}
      role="tabpanel"
      aria-labelledby={ctx?.tabId(value)}
      tabIndex={0}
      className={cn("outline-none", className)}
    >
      {children}
    </div>
  );
}
