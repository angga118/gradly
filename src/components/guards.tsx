"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useGradly } from "@/lib/store";
import type { Role } from "@/lib/types";
import { Icon } from "@/components/ui/icons";

function Loading({ label = "Memuat…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-ink/60">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function RequireRole({
  role,
  children,
}: {
  role: Role | Role[];
  children: ReactNode;
}) {
  const { session, hydrated } = useGradly();
  const router = useRouter();
  const roles = Array.isArray(role) ? role : [role];
  const key = roles.join(",");

  useEffect(() => {
    if (!hydrated) return;
    if (!session || !key.split(",").includes(session.role)) {
      const next =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "";
      router.replace(`/masuk?next=${encodeURIComponent(next)}`);
    }
  }, [hydrated, session, router, key]);

  if (!hydrated) return <Loading />;
  if (!session || !roles.includes(session.role)) return <Loading label="Mengalihkan…" />;
  return <>{children}</>;
}

export function AccessDenied({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <Icon name="lock" size={22} />
      </span>
      <p className="font-serif text-xl">Akses dibatasi</p>
      <p className="max-w-sm text-sm text-ink/60">{message}</p>
    </div>
  );
}
