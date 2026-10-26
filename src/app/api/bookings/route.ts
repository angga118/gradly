import { requireUser } from "@/lib/auth-helpers"
import { nextBookingId } from "@/lib/ids"
import { prisma } from "@/lib/prisma"
import { contributionFor } from "@/lib/rules"
import { serializeBooking } from "@/lib/serializers"
import { bookingSchema } from "@/lib/validators"

const bookingInclude = {
  photographer: { select: { name: true } },
  package: { select: { name: true } },
  payment: { include: { verifiedBy: { select: { name: true } } } },
} as const

/** GET — role-scoped: user → own bookings, fotografer → theirs, admin → all. */
export async function GET() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const where =
    guard.user.role === "admin"
      ? {}
      : guard.user.role === "fotografer"
        ? { photographerId: guard.user.id }
        : { userId: guard.user.id }

  const rows = await prisma.booking.findMany({
    where,
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ bookings: rows.map(serializeBooking) })
}

/** POST — create a booking. Price/contribution/total are computed server-side. */
export async function POST(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const input = parsed.data

  const pkg = await prisma.package.findUnique({
    where: { id: input.packageId },
    include: { photographer: { select: { acceptingBookings: true } } },
  })
  if (!pkg || !pkg.isActive) {
    return Response.json({ error: "Paket tidak ditemukan." }, { status: 404 })
  }
  if (pkg.photographerId === guard.user.id) {
    return Response.json(
      { error: "Kamu tidak bisa memesan paket milikmu sendiri." },
      { status: 400 },
    )
  }
  if (!pkg.photographer.acceptingBookings) {
    return Response.json(
      { error: "Fotografer sedang tidak menerima booking." },
      { status: 400 },
    )
  }

  const customer = await prisma.user.findUnique({
    where: { id: guard.user.id },
    select: { subsidyValidUntil: true, subsidyDocType: true },
  })
  const today = new Date().toISOString().slice(0, 10)
  const subsidyValid = Boolean(customer?.subsidyValidUntil && customer.subsidyValidUntil >= today)

  // Paket khusus KIP-K hanya untuk penerima KIP-K yang sudah terverifikasi.
  if (pkg.kipkOnly && !(subsidyValid && customer?.subsidyDocType === "KIP-K")) {
    return Response.json(
      { error: "Paket ini khusus untuk penerima KIP-K yang sudah terverifikasi." },
      { status: 403 },
    )
  }

  const subsidized =
    input.subsidized &&
    !pkg.kipkOnly &&
    subsidyValid &&
    pkg.subsidyEnabled &&
    pkg.subsidyPrice !== null &&
    pkg.subsidyPrice < pkg.price

  const price = subsidized ? (pkg.subsidyPrice as number) : pkg.price
  const contribution = subsidized ? 0 : contributionFor(price)
  const total = price + contribution

  const SCHEDULE_CONFLICT = "SCHEDULE_CONFLICT"
  let created
  try {
    created = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.count({
        where: {
          photographerId: pkg.photographerId,
          eventDate: input.eventDate,
          eventTime: input.eventTime,
          status: { in: ["Menunggu konfirmasi", "Confirmed"] },
        },
      })
      if (conflict > 0) throw new Error(SCHEDULE_CONFLICT)

      // Id direserve di dalam transaksi yang sama, jadi create yang gagal
      // tidak membuat nomor bolong.
      const id = await nextBookingId(tx)

      const booking = await tx.booking.create({
        data: {
          id,
          userId: guard.user.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          photographerId: pkg.photographerId,
          packageId: pkg.id,
          eventDate: input.eventDate,
          eventTime: input.eventTime,
          location: input.location,
          note: input.note ?? "",
          price,
          contribution,
          total,
          status: "Menunggu konfirmasi",
          subsidized,
        },
        include: bookingInclude,
      })

      // Ledger is written at settlement (settleBooking), not at booking creation —
      // revenue is recognized only once the booking is Confirmed with verified payment.

      await tx.notification.create({
        data: {
          userId: guard.user.id,
          type: "booking",
          title: "Booking terkirim",
          body: `${id} (${pkg.name}) menunggu konfirmasi.`,
        },
      })

      return booking
    })
  } catch (err) {
    if (err instanceof Error && err.message === SCHEDULE_CONFLICT) {
      return Response.json(
        { error: "Jadwal fotografer sudah terisi pada tanggal dan jam tersebut." },
        { status: 409 },
      )
    }
    throw err
  }

  return Response.json({ booking: serializeBooking(created) }, { status: 201 })
}
