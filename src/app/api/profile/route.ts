import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeUser } from "@/lib/serializers"
import { profileSchema } from "@/lib/validators"

export async function PATCH(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }

  const { tags, ...rest } = parsed.data
  const user = await prisma.user.update({
    where: { id: guard.user.id },
    data: {
      ...rest,
      ...(tags !== undefined ? { tags: JSON.stringify(tags) } : {}),
    },
  })

  return Response.json({ user: serializeUser(user) })
}
