import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { PaketView } from "@/components/public/paket-view";

export const metadata: Metadata = {
  title: "Paket foto wisuda",
  description:
    "Bandingkan paket foto wisuda Gradly: harga transparan, fasilitas jelas, dan tanda subsidi untuk pemegang SKTM atau KIP-K. Paket di atas Rp 1 juta tidak ikut subsidi.",
  alternates: { canonical: "/paket" },
};

export default function PaketPage() {
  return (
    <PublicShell>
      <PaketView />
    </PublicShell>
  );
}
