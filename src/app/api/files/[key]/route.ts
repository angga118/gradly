import { createReadStream } from "node:fs"
import { Readable } from "node:stream"
import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { readUpload } from "@/lib/storage"
import type { Role } from "@/lib/types"

/**
 * A private file is readable when the caller owns the row that references it:
 * their subsidy document, their booking's payment proof, or their portfolio item.
 * Admins may read anything.
 */
async function canAccessFile(key: string, userId: string, role: Role): Promise<boolean> {
  if (role === "admin") return true

  const [subsidy, payment, portfolio] = await Promise.all([
    prisma.subsidyApplication.findFirst({
      where: { fileKey: key, userId },
      select: { id: true },
    }),
    prisma.paymentProof.findFirst({
      where: { fileKey: key, booking: { userId } },
      select: { id: true },
    }),
    prisma.portfolioItem.findFirst({
      where: { fileKey: key, photographerId: userId },
      select: { id: true },
    }),
  ])

  return Boolean(subsidy || payment || portfolio)
}

/** Portfolio showcase images are public; subsidy docs and payment proofs are not. */
async function isPublicPortfolioFile(key: string): Promise<boolean> {
  const item = await prisma.portfolioItem.findFirst({
    where: { fileKey: key },
    select: { id: true },
  })
  return item !== null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params

  if (!(await isPublicPortfolioFile(key))) {
    const guard = await requireUser()
    if ("response" in guard) return guard.response

    if (!(await canAccessFile(key, guard.user.id, guard.user.role))) {
      return new Response("Forbidden", { status: 403 })
    }
  }

  const stored = await readUpload(key)
  if (!stored) return new Response("Not found", { status: 404 })

  const body = Readable.toWeb(createReadStream(stored.path)) as unknown as ReadableStream<Uint8Array>
  return new Response(body, {
    headers: {
      "Content-Type": stored.contentType,
      "Content-Length": String(stored.size),
      "Cache-Control": "private, no-store",
    },
  })
}
