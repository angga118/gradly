/**
 * Konfigurasi kontak & pembayaran yang tampil di UI.
 * Semua nilai opsional — string kosong berarti "belum tersedia" dan UI
 * harus tetap tampil rapi. Client-safe: hanya membaca NEXT_PUBLIC_*.
 */
export const siteConfig = {
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  contactAddress: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "",
  paymentBankName: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME ?? "",
  paymentBankAccount: process.env.NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT ?? "",
  paymentAccountHolder: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER ?? "",
};
