import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { PasswordView } from "@/components/user/password-view";

export const metadata: Metadata = { title: "Ubah kata sandi" };

export default function KataSandiPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <PasswordView />
      </RequireRole>
    </PublicShell>
  );
}
