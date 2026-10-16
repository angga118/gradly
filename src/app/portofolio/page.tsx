import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { PortofolioView } from "@/components/public/portofolio-view";

export const metadata: Metadata = {
  title: "Portofolio fotografer",
  description:
    "Lihat portofolio Kirana Larasati: hasil sesi foto wisuda dengan warna hangat dan arahan santai, lengkap dengan rating dan testimoni klien.",
  alternates: { canonical: "/portofolio" },
};

export default function PortofolioPage() {
  return (
    <PublicShell>
      <PortofolioView />
    </PublicShell>
  );
}
