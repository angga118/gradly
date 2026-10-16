import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { RiwayatView } from "@/components/user/riwayat-view";

export const metadata: Metadata = { title: "Riwayat booking" };

export default function RiwayatPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <RiwayatView />
      </RequireRole>
    </PublicShell>
  );
}
