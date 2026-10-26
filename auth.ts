import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit"
import type { Role } from "@/lib/types"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const VALID_ROLES: Role[] = ["user", "fotografer", "admin"]

// Auth.js v5: CredentialsSignin subclass → signIn result gets { error, code } instead of error=Configuration.
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited"
}

const MAX_LOGIN_ATTEMPTS = 5
const MAX_LOGIN_ATTEMPTS_PER_IP = 20
const LOGIN_WINDOW_MS = 15 * 60 * 1000

function toRole(s: string | null | undefined): Role {
  if (!s) return "user"
  return (VALID_ROLES as string[]).includes(s) ? (s as Role) : "user"
}

// honey: trust x-forwarded-for/x-real-ip only behind a trusted proxy; spoofable otherwise.
export function clientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]?.trim() || null
  return request.headers.get("x-real-ip")
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw, request) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null
      const { email, password } = parsed.data
      const normalizedEmail = email.trim().toLowerCase()
      // Primary bucket — keyed by the normalized email, so it cannot be spoofed.
      const emailKey = `login:email:${normalizedEmail}`
      if (!checkRateLimit(emailKey, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS).ok) {
        throw new RateLimitedError()
      }
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
        // Secondary best-effort bucket — keyed by client IP (spoofable); only failures count.
        const ip = clientIp(request)
        if (ip && !checkRateLimit(`login:ip:${ip}`, MAX_LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_MS).ok) {
          throw new RateLimitedError()
        }
        return null
      }

      resetRateLimit(emailKey)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: toRole(user.role),
        sessionVersion: user.sessionVersion,
      }
    },
  }),
]

// Google is inert unless real credentials are configured.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/masuk" },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      // OAuth users are upserted into our own User table (no PrismaAdapter).
      if (account?.provider === "google") {
        if (!user.email) return false
        const normalizedEmail = user.email.trim().toLowerCase()
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (existing) {
          // Refuse to auto-link Google to an existing password account.
          if (existing.passwordHash) return false
          // Existing OAuth-only user; allow sign-in (no linking needed).
          if (!existing.emailVerified) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { emailVerified: new Date() },
            })
          }
          return true
        }
        await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: user.name ?? normalizedEmail,
            role: "user",
            emailVerified: new Date(),
          },
        })
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = toRole((user as { role?: string }).role)
        // Written once at sign-in only — a later bump of User.sessionVersion must invalidate this token.
        token.sv = (user as { sessionVersion?: number }).sessionVersion ?? 0
      }
      // OAuth: map the provider identity onto our DB user id.
      if (account?.provider === "google" && token.email) {
        const normalizedEmail = String(token.email).trim().toLowerCase()
        const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (dbUser) {
          token.id = dbUser.id
          token.role = toRole(dbUser.role)
          token.sv = dbUser.sessionVersion
        }
      }
      // Refresh role from DB whenever token.id is present; clear if user no longer exists.
      // token.sv is deliberately NOT refreshed — a stale token must stop matching the DB.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } })
        if (dbUser) {
          token.role = toRole(dbUser.role)
        } else {
          delete token.id
          delete token.role
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          session.user.id = token.id as string
        }
        session.user.role = toRole(token.role as string | undefined)
        session.user.sessionVersion = Number(token.sv ?? 0)
      }
      return session
    },
  },
})
