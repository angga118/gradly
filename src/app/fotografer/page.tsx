import { DashboardView } from "@/components/fotografer/dashboard-view";

// Dashboard butuh sesi klien (RequireRole), jadi segmennya tidak tampil saat
// validasi instant navigation. Opt out supaya validasi tidak mengabaikan halaman ini.
export const instant = false;

export default function DashboardPage() {
  return <DashboardView />;
}
