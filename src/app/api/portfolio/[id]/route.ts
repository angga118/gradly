import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { deleteUpload } from "@/lib/storage"

/** DELETE — owner fotografer removes a portfolio item and its stored file. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  const { id } = await params

  const existing = await prisma.portfolioItem.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Portofolio tidak ditemukan." }, { status: 404 })
  }
  if (existing.photographerId !== guard.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.portfolioItem.delete({ where: { id } })
  if (existing.fileKey) await deleteUpload(existing.fileKey)

  return Response.json({ ok: true })
}
