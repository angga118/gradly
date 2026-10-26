import type { Package } from "@/lib/types";
import { contributionFor } from "@/lib/rules";

/** Kontribusi subsidi dari klien reguler (sumber tunggal: src/lib/rules.ts). */
export { CONTRIBUTION_RATE } from "@/lib/rules";

/**
 * Hitung harga satu paket untuk draft booking.
 * Salinan logika yang dipakai `createBooking` di store agar angka di UI
 * konsisten dengan angka yang tersimpan.
 */
export function computePricing(pkg: Package | undefined, useSubsidy: boolean) {
  const subsidyApplies = Boolean(useSubsidy && pkg?.subsidyPrice != null);
  const price = subsidyApplies && pkg?.subsidyPrice ? pkg.subsidyPrice : pkg?.price ?? 0;
  const contribution = subsidyApplies ? 0 : contributionFor(price);
  return { price, contribution, total: price + contribution, subsidyApplies };
}

/** Tombol harga subsidi aktif hanya jika verifikasi berlaku DAN paket punya harga subsidi. */
export function canUseSubsidy(
  pkg: Package | undefined,
  subsidyValidUntil?: string | null,
) {
  return Boolean(subsidyValidUntil) && pkg?.subsidyPrice != null;
}
