import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeBooking } from "@/lib/serializers"
import { settleBooking } from "@/lib/settlement"

const bookingInclude = {
  photographer: { select: { name: true } },
  package: { select: { name: true } },
  payment: { include: { verifiedBy: { select: { name: true } } } },
} as const

/** POST — admin verifies a booking's payment proof; settles the ledger entry. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("admin")
  if ("response" in guard) return guard.response

  const { id } = await params

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { payment: true },
  })
  if (!booking) {
    return Response.json({ error: "Booking tidak ditemukan." }, { status: 404 })
  }
  if (!booking.payment) {
    return Response.json({ error: "Bukti pembayaran tidak ditemukan." }, { status: 404 })
  }
  if (booking.payment.verifiedAt != null) {
    return Response.json({ error: "Bukti pembayaran sudah diverifikasi." }, { status: 409 })
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.paymentProof.update({
      where: { bookingId: id },
      data: { verifiedAt: new Date(), verifiedById: guard.user.id },
    })
    await settleBooking(tx, id)
    return tx.booking.findUniqueOrThrow({ where: { id }, include: bookingInclude })
  })

  return Response.json({ booking: serializeBooking(updated) })
}
