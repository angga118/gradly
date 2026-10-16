import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const { id } = await params
  const result = await prisma.notification.updateMany({
    where: { id, userId: guard.user.id },
    data: { readAt: new Date() },
  })

  if (result.count === 0) {
    return Response.json({ error: "Notifikasi tidak ditemukan." }, { status: 404 })
  }
  return Response.json({ ok: true })
}
