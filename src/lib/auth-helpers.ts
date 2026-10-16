import { auth } from "../../auth"
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

export async function requireUser(): Promise<Guard> {
  const session = await auth()
  if (!session?.user?.id) {
    return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user: session.user as SessionUser }
}

export async function requireRole(role: Role): Promise<Guard> {
  const result = await requireUser()
  if ("response" in result) return result
  if (result.user.role !== role) {
    return { response: Response.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return result
}
