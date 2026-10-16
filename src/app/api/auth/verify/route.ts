import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")
  const fail = () => Response.redirect(new URL("/masuk?verify_error=1", req.url), 302)

  if (!token) return fail()

  const user = await prisma.user.findUnique({ where: { verifyToken: token } })
  if (!user || !user.verifyTokenExpiry || user.verifyTokenExpiry <= new Date()) {
    return fail()
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verifyToken: null, verifyTokenExpiry: null },
  })

  return Response.redirect(new URL("/masuk?verified=1", req.url), 302)
}
