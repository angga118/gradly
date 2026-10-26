import type { DefaultSession } from "next-auth"
import type { Role } from "@/lib/types"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      sessionVersion: number
    } & DefaultSession["user"]
  }

  interface User {
    role?: Role
    sessionVersion?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: Role
    sv?: number
  }
}

// `next-auth/jwt` only re-exports `JWT` from `@auth/core/jwt`; the interface is
// declared there, so the augmentation must target the declaring module.
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string
    role?: Role
    sv?: number
  }
}
