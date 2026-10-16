import { randomBytes } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/mailer"

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000

export async function POST(req: Request) {
  let email = ""
  try {
    const body = (await req.json()) as { email?: unknown }
    email = String(body?.email ?? "").trim().toLowerCase()
  } catch {
    // ignore malformed body
  }

  // honey: always { ok: true } regardless of account state — prevents email enumeration.
  if (!email) return Response.json({ ok: true })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.emailVerified) return Response.json({ ok: true })

  const token = randomBytes(32).toString("hex")
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken: token, verifyTokenExpiry: new Date(Date.now() + VERIFY_TTL_MS) },
  })

  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`
  const mail = await sendMail({
    to: email,
    subject: "Verifikasi akun Gradly",
    text: `Verifikasi akun Gradly Anda dengan membuka tautan berikut (berlaku 24 jam):\n\n${verifyUrl}`,
  })

  // honey: expose verifyUrl only when mail is skipped (dev without provider).
  return Response.json(mail.skipped ? { ok: true, verifyUrl } : { ok: true })
}
