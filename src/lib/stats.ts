import type { RevenuePoint, Stats } from "./types";

/** Subsidy programme funding goal (constant; not derivable from transactions). */
export const SUBSIDY_TARGET = 60_000_000;

/** Platform commission on photographer income. */
export const PLATFORM_FEE = 0.1;

/** Last `count` month keys (UTC), oldest first — e.g. ["2026-05", …, "2026-10"]. */
export function lastMonthKeys(count = 6, now: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/** Bucket bookings into reguler/subsidi revenue per month key (oldest first). */
export function monthlyRevenue(
  rows: { total: number; subsidized: boolean; createdAt: string | Date }[],
  months: string[],
): RevenuePoint[] {
  const buckets = new Map(months.map((key) => [key, { key, reguler: 0, subsidi: 0 }]));
  for (const r of rows) {
    const key = new Date(r.createdAt).toISOString().slice(0, 7);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    if (r.subsidized) bucket.subsidi += r.total;
    else bucket.reguler += r.total;
  }
  return months.map((key) => buckets.get(key)!);
}

/** Zeroed stats used before the first fetch resolves. Time-free so it is safe
 *  to evaluate during prerender (Next 16 cacheComponents). */
export function emptyStats(): Stats {
  return {
    monthlyRevenue: [],
    subsidyFund: {
      available: 0,
      target: SUBSIDY_TARGET,
      distributed: 0,
      monthlyContribution: 0,
    },
  };
}
