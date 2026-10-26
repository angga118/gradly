import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "./prisma"

/** Format a counter value as `PREFIX_YYYY_0001` (4-digit zero-padded). */
export function formatId(prefix: string, value: number): string {
  const year = new Date().getFullYear()
  return `${prefix}_${year}_${String(value).padStart(4, "0")}`
}

/**
 * Atomically reserve the next sequence value for `name`.
 * The Counter row stores the last issued number; the first ever value is
 * `start` (246, matching the existing mock ids), so the first id is `start + 1`.
 *
 * Pass a transaction client so the increment commits together with the row it
 * belongs to — a rolled-back insert must not burn a number.
 */
async function nextValue(
  tx: Prisma.TransactionClient,
  name: string,
  start: number,
): Promise<number> {
  await tx.counter.upsert({
    where: { name },
    create: { name, value: start },
    update: {},
  })
  const counter = await tx.counter.update({
    where: { name },
    data: { value: { increment: 1 } },
  })
  return counter.value
}

export async function nextBookingId(tx: Prisma.TransactionClient = prisma): Promise<string> {
  return formatId("BK", await nextValue(tx, "booking", 246))
}

export async function nextSubsidyId(tx: Prisma.TransactionClient = prisma): Promise<string> {
  return formatId("SB", await nextValue(tx, "subsidy", 246))
}
