import { auth } from "../../auth"
import { prisma } from "@/lib/prisma"
import type { Role } from "./types"

export type SessionUser = {
  id: string
  email?: string | null
  name?: string | null
  role: Role
}

export function getSession() {
  return auth()
}

type Guard = { user: SessionUser } | { response: Response }

const unauthorized = () => Response.json({ error: "Unauthorized" }, { status: 401 })

export async function requireUser(): Promise<Guard> {
  const session = await auth()
  if (!session?.user?.id) {
    return { response: unauthorized() }
  }
  // Session version guard: a JWT issued before a credential change no longer matches the DB.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { sessionVersion: true },
  })
  if (!dbUser || dbUser.sessionVersion !== session.user.sessionVersion) {
    return { response: unauthorized() }
  }
  return { user: session.user as SessionUser }
}

/** Admin supervises every area, so it passes any role gate. */
export async function requireRole(...roles: Role[]): Promise<Guard> {
  const result = await requireUser()
  if ("response" in result) return result
  if (result.user.role !== "admin" && !roles.includes(result.user.role)) {
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return result
}
