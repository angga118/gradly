import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { PublicShell } from "@/components/layout/public-shell";
import { FotograferDetail } from "@/components/public/fotografer-detail";

// The shared SiteHeader reads `usePathname()`, which is runtime URL data. This
// route is dynamic (per-photographer), so allow it to render as a blocking
// route instead of failing prerender under `cacheComponents`.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== "fotografer") return { title: "Fotografer tidak ditemukan" };

  const bio = user.bio?.trim() ?? "";
  return {
    title: user.studio ? `${user.name} · ${user.studio}` : user.name,
    description:
      bio ||
      `Portofolio ${user.name} di Gradly: paket sesi, hasil foto, dan testimoni klien.`,
    alternates: { canonical: `/portofolio/${user.id}` },
  };
}

// `params` is runtime data; reading it inside a Suspense boundary keeps the
// route prerenderable under Next 16 `cacheComponents`.
async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FotograferDetail id={id} />;
}

function DetailFallback() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16" aria-busy="true">
      <span className="sr-only">Memuat profil fotografer…</span>
      <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-ink/5" />
    </div>
  );
}

export default function PortofolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <PublicShell>
      <Suspense fallback={<DetailFallback />}>
        <DetailContent params={params} />
      </Suspense>
    </PublicShell>
  );
}
