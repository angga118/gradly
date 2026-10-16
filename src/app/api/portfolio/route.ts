import { connection } from "next/server"
import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializePortfolio } from "@/lib/serializers"
import { StorageError, saveUpload } from "@/lib/storage"
import { portfolioSchema } from "@/lib/validators"

export async function GET() {
  await connection()
  const rows = await prisma.portfolioItem.findMany({
    orderBy: { shotDate: "desc" },
  })
  return Response.json({ portfolio: rows.map(serializePortfolio) })
}

const optional = (v: FormDataEntryValue | null): string | undefined =>
  typeof v === "string" && v.length > 0 ? v : undefined

/** POST — fotografer adds a portfolio item with its image. */
export async function POST(req: Request) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return Response.json({ error: "Form tidak valid." }, { status: 400 })
  }

  const file = form.get("file")
  if (!(file instanceof File)) {
    return Response.json({ error: "Foto portofolio wajib diunggah." }, { status: 400 })
  }

  const parsed = portfolioSchema.safeParse({
    title: form.get("title"),
    packageName: optional(form.get("packageName")),
    clientName: optional(form.get("clientName")),
    location: optional(form.get("location")),
    shotDate: form.get("shotDate"),
    tone: optional(form.get("tone")),
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
    upload = await saveUpload(file, { kind: "portfolio" })
  } catch (err) {
    if (err instanceof StorageError) {
      return Response.json({ error: err.message }, { status: 400 })
    }
    throw err
  }

  const item = await prisma.portfolioItem.create({
    data: {
      photographerId: guard.user.id,
      title: input.title,
      packageName: input.packageName ?? "",
      clientName: input.clientName ?? "",
      location: input.location ?? "",
      shotDate: input.shotDate,
      tone: input.tone ?? "sage",
      fileKey: upload.key,
    },
  })

  return Response.json({ portfolio: serializePortfolio(item) }, { status: 201 })
}
