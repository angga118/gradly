import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { Landing } from "@/components/public/landing";

export const metadata: Metadata = {
  title: {
    absolute: "Gradly — Foto wisuda hangat, harga bersahabat",
  },
  description:
    "Gradly memesan jasa foto wisuda dengan program subsidi untuk pemegang SKTM dan penerima KIP-K. Harga hingga 60% lebih murah, verifikasi maksimal 1×24 jam kerja.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <PublicShell>
      <Landing />
    </PublicShell>
  );
}
