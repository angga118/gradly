import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { NotifikasiView } from "@/components/user/notifikasi-view";

export const metadata: Metadata = { title: "Notifikasi" };

export default function NotifikasiPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <NotifikasiView />
      </RequireRole>
    </PublicShell>
  );
}
