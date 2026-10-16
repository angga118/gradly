import { Chip } from "./chip";

type Tone = "ink" | "sky" | "butter" | "sage" | "danger" | "outline";

const map: Record<string, Tone> = {
  "Menunggu konfirmasi": "butter",
  "Menunggu review": "butter",
  Menunggu: "butter",
  Confirmed: "sky",
  Terverifikasi: "sky",
  Diproses: "sky",
  Selesai: "sage",
  Dibatalkan: "danger",
  Ditolak: "danger",
};

export function StatusChip({ status }: { status: string }) {
  return <Chip tone={map[status] ?? "outline"}>{status}</Chip>;
}
