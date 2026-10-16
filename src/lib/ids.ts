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
 */
async function nextValue(name: string, start: number): Promise<number> {
  await prisma.counter.upsert({
    where: { name },
    create: { name, value: start },
    update: {},
  })
  const counter = await prisma.counter.update({
    where: { name },
    data: { value: { increment: 1 } },
  })
  return counter.value
}

export async function nextBookingId(): Promise<string> {
  return formatId("BK", await nextValue("booking", 246))
}

export async function nextSubsidyId(): Promise<string> {
  return formatId("SB", await nextValue("subsidy", 246))
}
