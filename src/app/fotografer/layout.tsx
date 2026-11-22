import { FotograferPortal } from "@/components/layout/fotografer-portal";

// RequireRole baru merender children setelah hidrasi & sesi tersedia, jadi saat
// validasi instant navigation segmen page sengaja tidak tampil. Portal ini memang
// blocking by design (butuh sesi), sama seperti halaman chat.
export const instant = false;

export default function FotograferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FotograferPortal>{children}</FotograferPortal>;
}
