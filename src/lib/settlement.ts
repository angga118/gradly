import type { Prisma } from "@/generated/prisma/client"
import { PLATFORM_FEE } from "@/lib/stats"

/**
 * Recognize revenue at settlement: write the booking's ledger entries once the
 * booking is Confirmed AND its payment proof is verified. Idempotent — a
 * booking has at most one ledger entry. Returns true if an entry was created.
 */
export async function settleBooking(
  tx: Prisma.TransactionClient,
  bookingId: string,
): Promise<boolean> {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, package: { select: { name: true } } },
  })
  if (!booking) return false
  if (booking.status !== "Confirmed" || booking.payment?.verifiedAt == null) return false

  const existing = await tx.ledgerEntry.findFirst({ where: { bookingId } })
  if (existing) return false

  const subsidized = booking.subsidized
  if (subsidized) {
    await tx.ledgerEntry.create({
      data: {
        bookingId,
        type: "distribution",
        amount: booking.price,
        label: `Kompensasi subsidi · ${booking.package.name}`,
      },
    })
    return true
  }

  await tx.ledgerEntry.createMany({
    data: [
      {
        bookingId,
        type: "payout",
        amount: booking.price - Math.round(booking.price * PLATFORM_FEE),
        label: `Pendapatan sesi · ${booking.package.name}`,
      },
      {
        bookingId,
        type: "contribution",
        amount: booking.contribution,
        label: `Kontribusi subsidi 5% · ${booking.package.name}`,
      },
    ],
  })
  return true
}
