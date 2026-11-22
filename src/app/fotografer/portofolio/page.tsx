import { PortofolioView } from "@/components/fotografer/portofolio-view";

// Sama seperti dashboard: konten bergantung pada sesi klien, jadi opt out dari
// validasi instant navigation alih-alih membiarkan segmen "dropped" tanpa peringatan.
export const instant = false;

export default function PortofolioPage() {
  return <PortofolioView />;
}
