import type { Role } from "@/lib/types";

/** Halaman tujuan default setelah masuk, berdasarkan peran. */
export function roleHome(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "fotografer") return "/fotografer";
  return "/riwayat";
}
