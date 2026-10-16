import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { SubsidyForm } from "@/components/user/subsidy-form";

export const metadata: Metadata = { title: "Ajukan verifikasi subsidi" };

export default function AjukanSubsidiPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <SubsidyForm />
      </RequireRole>
    </PublicShell>
  );
}
