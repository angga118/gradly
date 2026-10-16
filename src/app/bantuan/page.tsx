import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { BantuanView } from "@/components/public/bantuan-view";

export const metadata: Metadata = {
  title: "Bantuan & FAQ",
  description:
    "Pusat bantuan Gradly: pertanyaan umum seputar pemesanan paket, pengajuan subsidi SKTM/KIP-K, pembayaran, dan pengiriman hasil foto.",
  alternates: { canonical: "/bantuan" },
};

export default function BantuanPage() {
  return (
    <PublicShell>
      <BantuanView />
    </PublicShell>
  );
}
