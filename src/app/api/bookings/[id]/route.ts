import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeBooking } from "@/lib/serializers"
import { settleBooking } from "@/lib/settlement"
import type { BookingStatus } from "@/lib/types"
import { sendMail } from "@/lib/mailer"

const ALLOWED_STATUS: BookingStatus[] = [
  "Menunggu konfirmasi",
  "Confirmed",
  "Selesai",
  "Dibatalkan",
]

const STATUS_NOTIFICATION: Partial<Record<BookingStatus, string>> = {
  Confirmed: "Booking dikonfirmasi",
  Selesai: "Booking selesai",
  Dibatalkan: "Booking dibatalkan",
  "Menunggu konfirmasi": "Booking diperbarui",
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  "Menunggu konfirmasi": ["Confirmed", "Dibatalkan"],
  Confirmed: ["Selesai", "Dibatalkan"],
  Selesai: [],
  Dibatalkan: [],
}

const bookingInclude = {
  photographer: { select: { name: true } },
  package: { select: { name: true } },
  payment: { include: { verifiedBy: { select: { name: true } } } },
  user: { select: { email: true, name: true } },
} as const

/** PATCH — fotografer (owner) or admin updates the booking status. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) {
    return Response.json({ error: "Booking tidak ditemukan." }, { status: 404 })
  }

  const isOwner = guard.user.role === "fotografer" && booking.photographerId === guard.user.id
  if (guard.user.role !== "admin" && !isOwner) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const status = (body as { status?: unknown } | null)?.status
  if (typeof status !== "string" || !ALLOWED_STATUS.includes(status as BookingStatus)) {
    return Response.json({ error: "Status tidak valid." }, { status: 400 })
  }
  const nextStatus = status as BookingStatus
  const currentStatus = booking.status as BookingStatus
  if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    return Response.json(
      { error: `Status booking tidak bisa diubah dari "${currentStatus}" ke "${nextStatus}".` },
      { status: 409 },
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({
      where: { id },
      data: { status: nextStatus },
      include: bookingInclude,
    })

    // No-op unless status is Confirmed with a verified payment.
    await settleBooking(tx, id)

    await tx.notification.create({
      data: {
        userId: result.userId,
        type: "booking",
        title: STATUS_NOTIFICATION[nextStatus] ?? "Booking diperbarui",
        body: `${id} (${result.package.name}) kini berstatus "${nextStatus}".`,
      },
    })

    return result
  })

  const customerEmail = updated.user?.email
  if (customerEmail) {
    let subject = "Update status booking"
    let text = `Halo ${updated.user?.name ?? "Pelanggan"},\n\nBooking ${id} (${updated.package.name}) kini berstatus "${nextStatus}".\n\n— Gradly`
    if (nextStatus === "Confirmed") {
      subject = "Booking dikonfirmasi"
      text = `Halo ${updated.user?.name ?? "Pelanggan"},\n\nBooking ${id} (${updated.package.name}) telah dikonfirmasi.\nSilakan cek detail booking kamu untuk informasi selanjutnya.\n\n— Gradly`
    } else if (nextStatus === "Selesai") {
      subject = "Booking selesai"
      text = `Halo ${updated.user?.name ?? "Pelanggan"},\n\nBooking ${id} (${updated.package.name}) telah selesai.\nTerima kasih telah menggunakan layanan Gradly.\n\n— Gradly`
    } else if (nextStatus === "Dibatalkan") {
      subject = "Booking dibatalkan"
      text = `Halo ${updated.user?.name ?? "Pelanggan"},\n\nBooking ${id} (${updated.package.name}) telah dibatalkan.\n\n— Gradly`
    }
    sendMail({ to: customerEmail, subject, text }).catch(() => {})
  }

  return Response.json({ booking: serializeBooking(updated) })
}
