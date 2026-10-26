import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/password"
import { checkRateLimit, type RateLimitResult } from "@/lib/rate-limit"
import { registerSchema } from "@/lib/validators"
import { clientIp } from "../../../../../auth"

const REGISTER_WINDOW_MS = 60 * 60 * 1000
const MAX_REGISTRATIONS_PER_EMAIL = 3
const MAX_REGISTRATIONS_PER_IP = 10

const tooManyAttempts = (retryAfterSeconds: number) =>
  Response.json(
    { error: "Terlalu banyak percobaan. Coba lagi nanti." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  )

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

  // Quota is checked before the insert; a duplicate email returns 409 above, so it never burns quota.
  // The 429 message is identical for every cause — it must not reveal whether an email exists.
  const emailLimit = checkRateLimit(
    `register:email:${email}`,
    MAX_REGISTRATIONS_PER_EMAIL,
    REGISTER_WINDOW_MS,
  )
  const ip = clientIp(req)
  const ipLimit: RateLimitResult = ip
    ? checkRateLimit(`register:ip:${ip}`, MAX_REGISTRATIONS_PER_IP, REGISTER_WINDOW_MS)
    : { ok: true }
  if (!emailLimit.ok) return tooManyAttempts(emailLimit.retryAfterSeconds)
  if (!ipLimit.ok) return tooManyAttempts(ipLimit.retryAfterSeconds)

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
        // honey: email verification is deliberately deferred until launch — the site is not online yet.
        emailVerified: new Date(),
      },
    })
  } catch {
    return Response.json({ error: "Email sudah terdaftar." }, { status: 409 })
  }

  return Response.json({ ok: true })
}
