import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeLedger } from "@/lib/serializers"

/** GET — admin sees the whole ledger; fotografer sees entries for their bookings. */
export async function GET() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  if (guard.user.role !== "admin" && guard.user.role !== "fotografer") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const where =
    guard.user.role === "admin" ? {} : { booking: { photographerId: guard.user.id } }

  const rows = await prisma.ledgerEntry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ ledger: rows.map(serializeLedger) })
}
