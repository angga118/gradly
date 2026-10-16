import { randomBytes } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { sendMail } from "@/lib/mailer"
import { registerSchema } from "@/lib/validators"

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000

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
  const token = randomBytes(32).toString("hex")
  try {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: parsed.data.role,
        name: parsed.data.name,
        phone: parsed.data.phone,
        city: parsed.data.city,
        verifyToken: token,
        verifyTokenExpiry: new Date(Date.now() + VERIFY_TTL_MS),
      },
    })
  } catch {
    // Unique-constraint race on the email column.
    return Response.json({ error: "Email sudah terdaftar." }, { status: 409 })
  }

  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`
  const mail = await sendMail({
    to: email,
    subject: "Verifikasi akun Gradly",
    text: `Terima kasih telah mendaftar di Gradly. Verifikasi akun Anda dengan membuka tautan berikut (berlaku 24 jam):\n\n${verifyUrl}`,
  })

  // honey: expose verifyUrl only when mail is skipped (dev without provider) so smoke/dev can finish the flow.
  return Response.json(mail.skipped ? { ok: true, verifyUrl } : { ok: true })
}
