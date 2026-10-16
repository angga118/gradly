"use client";

import { Suspense } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { MasukForm } from "@/components/public/masuk-form";

function AuthFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
    </div>
  );
}

export default function MasukPage() {
  return (
    <PublicShell>
      <Suspense fallback={<AuthFallback />}>
        <MasukForm />
      </Suspense>
    </PublicShell>
  );
}
