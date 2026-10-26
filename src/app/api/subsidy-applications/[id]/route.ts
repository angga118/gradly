import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeSubsidy } from "@/lib/serializers"
import { reviewSchema } from "@/lib/validators"
import { sendMail } from "@/lib/mailer"

const subsidyInclude = {
  user: { select: { name: true, email: true } },
  reviewedBy: { select: { name: true } },
} as const

/** PATCH — admin reviews a subsidy application. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("admin")
  if ("response" in guard) return guard.response

  const { id } = await params

  const application = await prisma.subsidyApplication.findUnique({ where: { id } })
  if (!application) {
    return Response.json({ error: "Ajuan tidak ditemukan." }, { status: 404 })
  }

  if (application.status !== "Menunggu review") {
    return Response.json({ error: "Ajuan ini sudah direview." }, { status: 409 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const { decision, reason } = parsed.data
  const verified = decision === "Terverifikasi"

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.subsidyApplication.update({
      where: { id },
      data: {
        status: decision,
        reviewedById: guard.user.id,
        reviewedAt: new Date(),
        rejectReason: decision === "Ditolak" ? (reason ?? "") : null,
      },
      include: subsidyInclude,
    })

    if (verified) {
      // Subsidy validity runs to the end of the current calendar year.
      await tx.user.update({
        where: { id: application.userId },
        data: {
          subsidyValidUntil: `${new Date().getFullYear()}-12-31`,
          subsidyDocType: application.docType,
        },
      })
    }

    await tx.notification.create({
      data: {
        userId: application.userId,
        type: "subsidi",
        title: verified ? "Verifikasi subsidi disetujui" : "Verifikasi subsidi ditolak",
        body: verified
          ? `Ajuan ${id} terverifikasi. Kamu bisa memakai harga subsidi.`
          : `Ajuan ${id} ditolak. ${reason ?? ""}`.trim(),
      },
    })

    return result
  })

  const applicantEmail = updated.user.email
  if (applicantEmail) {
    const subject = verified ? "Ajuan subsidi terverifikasi" : "Ajuan subsidi ditolak"
    const text = verified
      ? `Halo ${updated.user.name},\n\nAjuan subsidi kamu (${id}) telah terverifikasi.\nKamu bisa menggunakan harga subsidi untuk pemesanan paket yang mendukung subsidi.\n\n— Gradly`
      : `Halo ${updated.user.name},\n\nAjuan subsidi kamu (${id}) ditolak.\n${reason ? `Alasan: ${reason}\n\n` : ""}— Gradly`
    sendMail({ to: applicantEmail, subject, text }).catch(() => {})
  }

  return Response.json({ subsidyApplication: serializeSubsidy(updated) })
}
