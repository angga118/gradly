import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { ProfilView } from "@/components/user/profil-view";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <ProfilView />
      </RequireRole>
    </PublicShell>
  );
}
