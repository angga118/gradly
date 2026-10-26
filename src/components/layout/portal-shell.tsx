"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useGradly } from "@/lib/store";
import { Icon, type IconName } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/misc";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: IconName;
}

export function PortalShell({
  nav,
  title,
  subtitle,
  children,
}: {
  nav: PortalNavItem[];
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { session, logout } = useGradly();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/" />
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Navigasi portal">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/fotografer" &&
              item.href !== "/admin" &&
              pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ink text-paper"
                  : "text-ink/70 hover:bg-ink/5 hover:text-ink",
              )}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={session?.name ?? "Tamu"} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session?.name ?? "Tamu"}</p>
            <p className="truncate text-xs text-ink/55">{session?.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft/50"
        >
          <Icon name="logout" size={18} />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-paper-deep/60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-ink/10 bg-paper lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-ink/10 bg-paper">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-ink/10 bg-paper/85 px-4 py-3 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="rounded-full p-2 text-ink lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Buka menu portal"
          >
            <Icon name="menu" size={22} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl leading-tight">{title}</h1>
            {subtitle ? (
              <p className="truncate text-xs text-ink/55">{subtitle}</p>
            ) : null}
          </div>
          <Link
            href="/notifikasi"
            aria-label="Notifikasi"
            className="rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Icon name="bell" size={20} />
          </Link>
        </header>
        <main
          id="konten"
          className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
