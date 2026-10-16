"use client";

import { usePathname } from "next/navigation";
import { RequireRole } from "@/components/guards";
import {
  PortalShell,
  type PortalNavItem,
} from "@/components/layout/portal-shell";

const NAV: PortalNavItem[] = [
  { href: "/admin", label: "Ringkasan", icon: "grid" },
  { href: "/admin/dana-subsidi", label: "Dana Subsidi", icon: "wallet" },
  { href: "/admin/verifikasi", label: "Verifikasi", icon: "shield" },
  { href: "/admin/booking", label: "Booking", icon: "calendar" },
  { href: "/admin/penarikan", label: "Penarikan", icon: "bank" },
];

const META: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Ringkasan",
    subtitle: "Gambaran booking, dana subsidi, dan pendapatan",
  },
  "/admin/dana-subsidi": {
    title: "Dana Subsidi",
    subtitle: "Saldo, target, dan riwayat mutasi dana",
  },
  "/admin/verifikasi": {
    title: "Verifikasi",
    subtitle: "Tinjau dokumen pengajuan subsidi",
  },
  "/admin/booking": {
    title: "Booking",
    subtitle: "Pantau dan konfirmasi seluruh booking",
  },
  "/admin/penarikan": {
    title: "Penarikan",
    subtitle: "Proses pengajuan pencairan dana fotografer",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const meta = META[pathname] ?? {
    title: "Admin Panel",
    subtitle: "Kelola booking dan verifikasi subsidi",
  };

  return (
    <RequireRole role="admin">
      <PortalShell nav={NAV} title={meta.title} subtitle={meta.subtitle}>
        {children}
      </PortalShell>
    </RequireRole>
  );
}
