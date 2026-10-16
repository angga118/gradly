import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeNotification } from "@/lib/serializers"

export async function GET() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const rows = await prisma.notification.findMany({
    where: { userId: guard.user.id },
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ notifications: rows.map(serializeNotification) })
}
