import { NextResponse } from "next/server"
import { auth } from "../auth"

// NOTE: this proxy is a coarse gate only (redirects + role hints). It is NOT a
// security boundary — every route handler / server action must re-check the
// session and role itself (see src/lib/auth-helpers.ts).
export const proxy = auth((req) => {
  const { nextUrl } = req
  const session = req.auth

  if (!session?.user) {
    const url = new URL("/masuk", nextUrl)
    url.searchParams.set("next", nextUrl.pathname + nextUrl.search)
    return NextResponse.redirect(url)
  }

  const role = session.user.role
  if (nextUrl.pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }
  if (nextUrl.pathname.startsWith("/fotografer") && role !== "fotografer") {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/admin/:path*",
    "/fotografer/:path*",
    "/profil/:path*",
    "/riwayat",
    "/notifikasi",
    "/booking/:path*",
  ],
}
