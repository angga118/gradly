export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number }

type Bucket = { times: number[]; windowMs: number }

// honey: in-process state — resets on process restart; move to Redis/DB if deployed multi-instance.
const buckets = new Map<string, Bucket>()

const MAX_KEYS = 10_000

/**
 * Records one hit for `key` and reports whether the sliding window still has room.
 * Hits older than `windowMs` are discarded.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  prune(now)
  const times = (buckets.get(key)?.times ?? []).filter((t) => now - t < windowMs)
  if (times.length >= limit) {
    buckets.set(key, { times, windowMs })
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((times[0] + windowMs - now) / 1000)),
    }
  }
  times.push(now)
  buckets.set(key, { times, windowMs })
  return { ok: true }
}

/** Clears one bucket — called after a successful login so the counter starts over. */
export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

// honey: O(keys) scan per call, fine under the 10k cap; use Redis TTL if the key count grows.
function prune(now: number) {
  for (const [k, b] of buckets) {
    const kept = b.times.filter((t) => now - t < b.windowMs)
    if (kept.length === 0) buckets.delete(k)
    else if (kept.length !== b.times.length) buckets.set(k, { times: kept, windowMs: b.windowMs })
  }
  if (buckets.size > MAX_KEYS) {
    let excess = buckets.size - MAX_KEYS
    for (const k of buckets.keys()) {
      if (excess-- <= 0) break
      buckets.delete(k)
    }
  }
}
