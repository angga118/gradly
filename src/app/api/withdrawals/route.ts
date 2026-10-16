import { requireRole, requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializeWithdrawal } from "@/lib/serializers"
import { withdrawalSchema } from "@/lib/validators"

const withdrawalInclude = { photographer: { select: { name: true } } } as const

/** Thrown inside the withdrawal transaction to roll back on insufficient balance. */
class BalanceExceeded extends Error {}

/** GET — all withdrawals for admin, own withdrawals for fotografer. */
export async function GET() {
  const guard = await requireUser()
  if ("response" in guard) return guard.response

  const { role, id } = guard.user
  if (role !== "admin" && role !== "fotografer") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const rows = await prisma.withdrawal.findMany({
    where: role === "fotografer" ? { photographerId: id } : undefined,
    include: withdrawalInclude,
    orderBy: { createdAt: "desc" },
  })

  return Response.json({ withdrawals: rows.map(serializeWithdrawal) })
}

/** POST — request a withdrawal, bounded by the photographer's available balance. */
export async function POST(req: Request) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = withdrawalSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const input = parsed.data

  // honey: available = Σ(payout + distribution) for this photographer's bookings − Σ(withdrawals)
  // already requested. Recomputed inside the write transaction so the SQLite write
  // lock serializes concurrent POSTs — a check-then-insert across two statements
  // would let both pass. Revisit if a ledger/balance table lands.
  let created
  try {
    created = await prisma.$transaction(async (tx) => {
      const [flow, withdrawn] = await Promise.all([
        tx.ledgerEntry.aggregate({
          _sum: { amount: true },
          where: { booking: { photographerId: guard.user.id }, type: { in: ["payout", "distribution"] } },
        }),
        tx.withdrawal.aggregate({
          _sum: { amount: true },
          where: { photographerId: guard.user.id },
        }),
      ])
      const available = (flow._sum.amount ?? 0) - (withdrawn._sum.amount ?? 0)

      if (input.amount > available) {
        throw new BalanceExceeded()
      }

      return tx.withdrawal.create({
        data: {
          photographerId: guard.user.id,
          amount: input.amount,
          bankAccount: input.bankAccount,
          status: "Menunggu",
        },
        include: withdrawalInclude,
      })
    })
  } catch (e) {
    if (e instanceof BalanceExceeded) {
      return Response.json({ error: "Jumlah melebihi saldo tersedia." }, { status: 400 })
    }
    throw e
  }

  return Response.json({ withdrawal: serializeWithdrawal(created) }, { status: 201 })
}
