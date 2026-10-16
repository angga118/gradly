import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeBooking } from "@/lib/serializers"
import { StorageError, saveUpload } from "@/lib/storage"

const bookingInclude = {
  photographer: { select: { name: true } },
  package: { select: { name: true } },
  payment: { include: { verifiedBy: { select: { name: true } } } },
} as const

/** POST — owner uploads a payment proof for their booking. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const { id } = await params

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) {
    return Response.json({ error: "Booking tidak ditemukan." }, { status: 404 })
  }
  if (booking.userId !== guard.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: "Form tidak valid." }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json({ error: "Berkas bukti transfer wajib diunggah." }, { status: 400 })
  }

  let upload
  try {
    upload = await saveUpload(file, { kind: "doc" })
  } catch (err) {
    if (err instanceof StorageError) {
      return Response.json({ error: err.message }, { status: 400 })
    }
    throw err
  }

  await prisma.paymentProof.upsert({
    where: { bookingId: id },
    create: { bookingId: id, fileKey: upload.key, name: upload.name, sizeKb: upload.sizeKb },
    // Re-upload replaces the proof and clears any earlier verification.
    update: {
      fileKey: upload.key,
      name: upload.name,
      sizeKb: upload.sizeKb,
      uploadedAt: new Date(),
      verifiedById: null,
      verifiedAt: null,
    },
  })

  const updated = await prisma.booking.findUniqueOrThrow({
    where: { id },
    include: bookingInclude,
  })

  return Response.json({ booking: serializeBooking(updated) })
}
