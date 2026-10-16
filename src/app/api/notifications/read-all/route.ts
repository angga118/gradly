import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  await prisma.notification.updateMany({
    where: { userId: guard.user.id, readAt: null },
    data: { readAt: new Date() },
  })

  return Response.json({ ok: true })
}
