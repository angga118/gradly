import { createHash, timingSafeEqual } from "node:crypto"
import { sendMail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"

/** Constant-time string compare (sha256 digests keep the lengths equal). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest()
  const hb = createHash("sha256").update(b).digest()
  return timingSafeEqual(ha, hb)
}

/** GET — secret-guarded cron: kirim pengingat H-3 untuk booking Confirmed. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET belum dikonfigurasi di server." },
      { status: 503 },
    )
  }

  const auth = req.headers.get("authorization")
  if (!safeEqual(auth ?? "", `Bearer ${secret}`)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Same UTC string idiom as src/app/api/bookings/route.ts
  const target = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const bookings = await prisma.booking.findMany({
    where: { status: "Confirmed", reminderSentAt: null, eventDate: target },
    include: {
      user: { select: { email: true, name: true } },
      package: { select: { name: true } },
    },
  })

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const booking of bookings) {
    try {
      const email = booking.user.email
      if (!email) {
        // No email to reach: still mark so it isn't retried forever.
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt: new Date() },
        })
        skipped++
        continue
      }

      const mail = await sendMail({
        to: email,
        subject: "Pengingat sesi 3 hari lagi",
        text: `Halo ${booking.user.name || "Pelanggan"},\n\nPengingat: booking ${booking.id} (${booking.package.name}) dijadwalkan pada ${booking.eventDate} pukul ${booking.eventTime}.\n\n— Gradly`,
      })
      if (!mail.ok) {
        // reminderSentAt stays null → retried on the next cron run.
        failed++
        continue
      }

      await prisma.$transaction([
        prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "booking",
            title: "Pengingat sesi",
            body: `${booking.id} (${booking.package.name}) dijadwalkan pada ${booking.eventDate} pukul ${booking.eventTime}.`,
          },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSentAt: new Date() },
        }),
      ])

      if (mail.skipped) skipped++
      else sent++
    } catch {
      failed++
    }
  }

  return Response.json({ sent, skipped, failed })
}
