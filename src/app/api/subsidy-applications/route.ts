import { requireUser } from "@/lib/auth-helpers"
import { nextSubsidyId } from "@/lib/ids"
import { prisma } from "@/lib/prisma"
import { serializeSubsidy } from "@/lib/serializers"
import { StorageError, saveUpload } from "@/lib/storage"
import { subsidySchema } from "@/lib/validators"

const subsidyInclude = {
  user: { select: { name: true } },
  reviewedBy: { select: { name: true } },
} as const

/** GET — role-scoped: user → own applications, admin → all. */
export async function GET() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const where = guard.user.role === "admin" ? {} : { userId: guard.user.id }

  const rows = await prisma.subsidyApplication.findMany({
    where,
    include: subsidyInclude,
    orderBy: { submittedAt: "desc" },
  })

  return Response.json({ subsidyApplications: rows.map(serializeSubsidy) })
}

/** POST — submit a subsidy application with its supporting document. */
export async function POST(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: "Form tidak valid." }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json({ error: "Dokumen pendukung wajib diunggah." }, { status: 400 })
  }

  const parsed = subsidySchema.safeParse({
    docType: form.get("docType"),
    kelurahan: form.get("kelurahan"),
    address: form.get("address"),
  })
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const input = parsed.data

  let upload
  try {
    upload = await saveUpload(file, { kind: "doc" })
  } catch (err) {
    if (err instanceof StorageError) {
      return Response.json({ error: err.message }, { status: 400 })
    }
    throw err
  }

  const id = await nextSubsidyId()
  const created = await prisma.$transaction(async (tx) => {
    const application = await tx.subsidyApplication.create({
      data: {
        id,
        userId: guard.user.id,
        docType: input.docType,
        docName: upload.name,
        fileKey: upload.key,
        kelurahan: input.kelurahan,
        address: input.address,
        status: "Menunggu review",
      },
      include: subsidyInclude,
    })

    await tx.notification.create({
      data: {
        userId: guard.user.id,
        type: "subsidi",
        title: "Ajuan subsidi diterima",
        body: `${id} sedang ditinjau admin. Hasil dikabari maksimal 1×24 jam kerja.`,
      },
    })

    return application
  })

  return Response.json({ subsidyApplication: serializeSubsidy(created) }, { status: 201 })
}
