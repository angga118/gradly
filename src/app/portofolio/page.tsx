import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { PortofolioView } from "@/components/public/portofolio-view";

export const metadata: Metadata = {
  title: "Portofolio fotografer",
  description:
    "Jelajahi semua fotografer Gradly: bandingkan studio, rating, gaya, dan ketersediaan booking sebelum memilih fotografer untuk sesimu.",
  alternates: { canonical: "/portofolio" },
};

export default function PortofolioPage() {
  return (
    <PublicShell>
      <PortofolioView />
    </PublicShell>
  );
}
