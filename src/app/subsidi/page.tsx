import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { SubsidiView } from "@/components/public/subsidi-view";

export const metadata: Metadata = {
  title: "Program subsidi SKTM & KIP-K",
  description:
    "Program subsidi Gradly untuk pemegang SKTM dan penerima KIP-K: harga hingga 60% lebih ringan, dibiayai kontribusi 5% dari klien reguler, verifikasi maksimal 1×24 jam kerja.",
  alternates: { canonical: "/subsidi" },
};

export default function SubsidiPage() {
  return (
    <PublicShell>
      <SubsidiView />
    </PublicShell>
  );
}
