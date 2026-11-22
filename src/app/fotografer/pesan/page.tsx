import View from "@/components/fotografer/pesan-view";

// Halaman ini bergantung pada sesi fotografer (RequireRole), jadi segmen tidak tampil
// saat validasi instant navigation. Opt out agar tidak dianggap "dropped".
export const instant = false;

export default function Page() {
  return <View />;
}
