"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useGradly } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/misc";

const NAV = [
  { href: "/paket", label: "Paket" },
  { href: "/portofolio", label: "Portofolio" },
  { href: "/subsidi", label: "Subsidi" },
  { href: "/bantuan", label: "Bantuan" },
];

function portalHome(role: string) {
  if (role === "admin") return "/admin";
  if (role === "fotografer") return "/fotografer";
  return "/riwayat";
}

export function SiteHeader() {
  const pathname = usePathname();
  const { session, logout, notifications } = useGradly();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [pathname]);

  const unread = session
    ? notifications.filter((n) => n.userId === session.id && !n.readAt).length
    : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm transition-colors",
                  active ? "bg-ink/8 font-medium text-ink" : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link
                href="/notifikasi"
                aria-label="Notifikasi"
                className="relative rounded-full p-2 text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                <Icon name="bell" size={20} />
                {unread > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-paper">
                    {unread}
                  </span>
                ) : null}
              </Link>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-ink/15 py-1 pl-1 pr-3 transition-colors hover:border-ink/30"
                  aria-haspopup="menu"
                  aria-expanded={menu}
                >
                  <Avatar name={session.name} size={30} />
                  <span className="max-w-28 truncate text-sm">{session.name.split(" ")[0]}</span>
                  <Icon name="chevronDown" size={14} />
                </button>
                {menu ? (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-lift"
                  >
                    <div className="border-b border-ink/10 px-4 py-3">
                      <p className="truncate text-sm font-medium">{session.name}</p>
                      <p className="truncate text-xs text-ink/55">{session.email}</p>
                    </div>
                    <MenuLink href={portalHome(session.role)} icon="grid">
                      {session.role === "user" ? "Riwayat booking" : "Portal"}
                    </MenuLink>
                    {session.role === "user" ? (
                      <>
                        <MenuLink href="/profil" icon="user">
                          Profil
                        </MenuLink>
                        <MenuLink href="/profil/dokumen" icon="file">
                          Dokumen SKTM
                        </MenuLink>
                      </>
                    ) : null}
                    <MenuLink href="/notifikasi" icon="bell">
                      Notifikasi
                    </MenuLink>
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-danger transition-colors hover:bg-danger-soft/50"
                    >
                      <Icon name="logout" size={18} />
                      Keluar
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Button href="/masuk" variant="ghost" size="sm">
                Masuk
              </Button>
              <Button href="/daftar" size="sm">
                Daftar
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Buka menu"
          aria-expanded={open}
        >
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-paper px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Navigasi mobile">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-sm text-ink/80 hover:bg-ink/5"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink/10 pt-4">
            {session ? (
              <>
                <Button href={portalHome(session.role)} variant="secondary" size="sm">
                  {session.role === "user" ? "Riwayat booking" : "Portal"}
                </Button>
                <Button variant="ghost" size="sm" onClick={logout}>
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button href="/masuk" variant="secondary" size="sm">
                  Masuk
                </Button>
                <Button href="/daftar" size="sm">
                  Daftar
                </Button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-3 px-4 py-3 text-sm text-ink/80 transition-colors hover:bg-ink/5"
    >
      <Icon name={icon} size={18} />
      {children}
    </Link>
  );
}
