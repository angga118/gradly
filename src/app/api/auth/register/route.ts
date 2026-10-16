import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { registerSchema } from "@/lib/validators"

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }

  const email = parsed.data.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ error: "Email sudah terdaftar." }, { status: 409 })
  }

  const passwordHash = await hashPassword(parsed.data.password)
  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: parsed.data.role,
        name: parsed.data.name,
        phone: parsed.data.phone,
        city: parsed.data.city,
      },
    })
  } catch {
    // Unique-constraint race on the email column.
    return Response.json({ error: "Email sudah terdaftar." }, { status: 409 })
  }

  return Response.json({ ok: true })
}
