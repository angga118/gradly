import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { hashPassword, verifyPassword } from "@/lib/password"
import { passwordSchema } from "@/lib/validators"

export async function POST(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = passwordSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }

  const user = await prisma.user.findUnique({ where: { id: guard.user.id } })
  if (!user?.passwordHash) {
    return Response.json({ error: "Kata sandi saat ini tidak cocok." }, { status: 400 })
  }
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return Response.json({ error: "Kata sandi saat ini tidak cocok." }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: guard.user.id },
    data: { passwordHash: await hashPassword(parsed.data.next) },
  })

  return Response.json({ ok: true })
}
