/**
 * Aturan uang program — konstanta murni, aman dipakai di server maupun client.
 * Sumber tunggal: jangan tulis ulang literalnya di modul lain.
 */

/** Kontribusi klien reguler ke dana subsidi (5% dari harga paket). */
export const CONTRIBUTION_RATE = 0.05

/** Komisi platform atas pendapatan fotografer (10%). */
export const PLATFORM_FEE = 0.1

/** Paket di atas batas ini tidak bisa memakai harga subsidi. */
export const SUBSIDY_MAX_PACKAGE_PRICE = 1_000_000

/** Target pendanaan program subsidi. */
export const SUBSIDY_TARGET = 60_000_000

/** Kontribusi subsidi dari satu harga paket reguler. */
export function contributionFor(price: number): number {
  return Math.round(price * CONTRIBUTION_RATE)
}

/** Pendapatan fotografer setelah komisi platform. */
export function photographerNet(price: number): number {
  return price - Math.round(price * PLATFORM_FEE)
}
