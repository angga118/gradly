import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
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
const LOGIN_WINDOW_MS = 15 * 60 * 1000
// honey: in-memory per instance, resets on process restart; revisit with Redis/DB if deployed multi-instance.
const loginAttempts = new Map<string, number[]>()

function toRole(s: string | null | undefined): Role {
  if (!s) return "user"
  return (VALID_ROLES as string[]).includes(s) ? (s as Role) : "user"
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw)
      if (!parsed.success) return null
      const { email, password } = parsed.data
      const normalizedEmail = email.trim().toLowerCase()
      // honey: authorize gets no request object → keyed by email only, no IP.
      const key = normalizedEmail
      const now = Date.now()
      const recent = (loginAttempts.get(key) ?? []).filter((t) => now - t < LOGIN_WINDOW_MS)
      if (recent.length >= MAX_LOGIN_ATTEMPTS) {
        throw new RateLimitedError()
      }
      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
        recent.push(now)
        loginAttempts.set(key, recent)
        return null
      }
      loginAttempts.delete(key)
      return { id: user.id, email: user.email, name: user.name, role: toRole(user.role) }
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
          return true
        }
        await prisma.user.create({
          data: {
            email: normalizedEmail,
            name: user.name ?? normalizedEmail,
            role: "user",
          },
        })
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = toRole((user as { role?: string }).role)
      }
      // OAuth: map the provider identity onto our DB user id.
      if (account?.provider === "google" && token.email) {
        const normalizedEmail = String(token.email).trim().toLowerCase()
        const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (dbUser) {
          token.id = dbUser.id
          token.role = toRole(dbUser.role)
        }
      }
      // Refresh role from DB whenever token.id is present; clear if user no longer exists.
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
      }
      return session
    },
  },
})
