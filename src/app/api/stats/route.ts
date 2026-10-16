import { prisma } from "@/lib/prisma"
import { lastMonthKeys, monthlyRevenue, SUBSIDY_TARGET } from "@/lib/stats"

/**
 * GET — public dashboard stats derived from bookings + ledger.
 * monthlyRevenue: last 6 months of reguler/subsidi booking totals (aggregate; no PII).
 * subsidyFund: contributions + top-ups collected vs distributions paid out.
 */
export async function GET() {
  const now = new Date()
  const months = lastMonthKeys()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

  const [bookings, contributions, topups, distributions, monthlyContribution] = await Promise.all([
    prisma.booking.findMany({ select: { total: true, subsidized: true, createdAt: true } }),
    prisma.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: "contribution" } }),
    prisma.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: "topup" } }),
    prisma.ledgerEntry.aggregate({ _sum: { amount: true }, where: { type: "distribution" } }),
    prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { type: "contribution", createdAt: { gte: startOfMonth } },
    }),
  ])

  const distributed = distributions._sum.amount ?? 0
  const collected = contributions._sum.amount ?? 0
  const toppedUp = topups._sum.amount ?? 0

  return Response.json({
    monthlyRevenue: monthlyRevenue(bookings, months),
    subsidyFund: {
      available: Math.max(0, collected + toppedUp - distributed),
      target: SUBSIDY_TARGET,
      distributed,
      monthlyContribution: monthlyContribution._sum.amount ?? 0,
    },
  })
}
