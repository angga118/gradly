import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { DokumenView } from "@/components/user/dokumen-view";

export const metadata: Metadata = { title: "Dokumen SKTM" };

export default function DokumenPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <DokumenView />
      </RequireRole>
    </PublicShell>
  );
}
