import { z } from "zod"
import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeWithdrawal } from "@/lib/serializers"

const withdrawalInclude = { photographer: { select: { name: true } } } as const

const statusSchema = z.object({
  status: z.enum(["Diproses", "Selesai"], { message: "Status tidak valid." }),
})

/** Only one forward step is allowed; anything else (incl. same status) → 409. */
const ALLOWED_TRANSITIONS: Record<string, string> = {
  Menunggu: "Diproses",
  Diproses: "Selesai",
}

const STATUS_NOTIFICATION: Record<string, string> = {
  Diproses: "Penarikan diproses",
  Selesai: "Penarikan selesai",
}

/** PATCH — admin advances a withdrawal through its status flow. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("admin")
  if ("response" in guard) return guard.response

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const next = parsed.data.status

  const existing = await prisma.withdrawal.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Penarikan tidak ditemukan." }, { status: 404 })
  }

  const current = existing.status
  if (ALLOWED_TRANSITIONS[current] !== next) {
    return Response.json(
      { error: `Status penarikan tidak bisa diubah dari "${current}" ke "${next}".` },
      { status: 409 },
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.withdrawal.update({
      where: { id },
      data: { status: next },
      include: withdrawalInclude,
    })

    await tx.notification.create({
      data: {
        userId: result.photographerId,
        type: "pembayaran",
        title: STATUS_NOTIFICATION[next] ?? "Penarikan diperbarui",
        body: `Penarikan ${id} kini berstatus "${next}".`,
      },
    })

    return result
  })

  return Response.json({ withdrawal: serializeWithdrawal(updated) })
}
