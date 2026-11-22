import View from "@/components/fotografer/pendapatan-view";

// Halaman ini bergantung pada sesi klien (RequireRole), jadi segmen tidak tampil
// saat validasi instant navigation. Opt out agar tidak dianggap "dropped".
export const instant = false;

export default function Page() {
  return <View />;
}
