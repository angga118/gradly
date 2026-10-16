import { getSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeUser } from "@/lib/serializers"

export async function GET() {
  const session = await getSession()
  const id = session?.user?.id
  if (!id) return Response.json({ user: null })

  const user = await prisma.user.findUnique({ where: { id } })
  return Response.json({ user: user ? serializeUser(user) : null })
}
