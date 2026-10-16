"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/ui/icons";

const ITEMS: { href: string; label: string; description: string; icon: IconName }[] = [
  { href: "/profil", label: "Profil", description: "Data diri & status subsidi", icon: "user" },
  { href: "/profil/kata-sandi", label: "Ubah Kata Sandi", description: "Keamanan akun", icon: "lock" },
  { href: "/profil/dokumen", label: "Dokumen SKTM", description: "Ajuan verifikasi saya", icon: "file" },
];

export function AccountNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi akun"
      className={cn(
        "no-scrollbar flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0",
        className,
      )}
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 transition-colors md:shrink",
              active
                ? "border-ink bg-ink text-paper shadow-soft"
                : "border-ink/10 bg-white/60 text-ink hover:border-ink/30 hover:bg-white/90",
            )}
          >
            <Icon name={item.icon} size={18} />
            <span className="flex flex-col">
              <span className="whitespace-nowrap text-sm font-medium">{item.label}</span>
              <span
                className={cn(
                  "hidden text-xs md:block",
                  active ? "text-paper/70" : "text-ink/55",
                )}
              >
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
