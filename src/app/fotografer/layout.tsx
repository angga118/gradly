"use client";

import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/guards";
import {
  PortalShell,
  type PortalNavItem,
} from "@/components/layout/portal-shell";

const NAV: PortalNavItem[] = [
  { href: "/fotografer", label: "Dashboard", icon: "grid" },
  { href: "/fotografer/booking", label: "Booking", icon: "calendar" },
  { href: "/fotografer/paket", label: "Paket", icon: "tag" },
  { href: "/fotografer/subsidi", label: "Subsidi", icon: "heart" },
  { href: "/fotografer/portofolio", label: "Portofolio", icon: "image" },
  { href: "/fotografer/pendapatan", label: "Pendapatan", icon: "wallet" },
  { href: "/fotografer/profil", label: "Profil", icon: "user" },
];

const META: Record<string, { title: string; subtitle: string }> = {
  "/fotografer": {
    title: "Dashboard",
    subtitle: "Ringkasan studio dalam satu layar",
  },
  "/fotografer/booking": {
    title: "Booking",
    subtitle: "Konfirmasi jadwal dan kelola klien",
  },
  "/fotografer/paket": {
    title: "Paket",
    subtitle: "Atur penawaran dan harga sesimu",
  },
  "/fotografer/subsidi": {
    title: "Subsidi",
    subtitle: "Sesi bersubsidi dan kompensasinya",
  },
  "/fotografer/portofolio": {
    title: "Portofolio",
    subtitle: "Galeri karya dan kata klien",
  },
  "/fotografer/pendapatan": {
    title: "Pendapatan",
    subtitle: "Pemasukan, saldo, dan penarikan",
  },
  "/fotografer/profil": {
    title: "Profil",
    subtitle: "Data diri dan ketersediaan",
  },
};

export default function FotograferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = META[pathname] ?? {
    title: "Portal Fotografer",
    subtitle: "Ruang kerja fotografer Gradly",
  };

  return (
    <RequireRole role="fotografer">
      <PortalShell nav={NAV} title={meta.title} subtitle={meta.subtitle}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
