import { requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import type { ChatMessage } from "@/lib/types"
import { chatMessageSchema } from "@/lib/validators"

const MESSAGE_LIMIT = 200
const CHAT_TTL_MS = 2 * 24 * 60 * 60 * 1000
const PRUNE_INTERVAL_MS = 60_000

// honey: hapus saat API diakses, bukan background job; tambah scheduler jika banyak instance.
let lastPruneAt = 0

async function pruneOldMessages() {
  const now = Date.now()
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return
  lastPruneAt = now
  await prisma.chatMessage.deleteMany({
    where: { createdAt: { lt: new Date(now - CHAT_TTL_MS) } },
  })
}

const messageInclude = {
  customer: { select: { name: true } },
  photographer: { select: { name: true } },
} as const

type ChatMessageRow = {
  id: string
  customerId: string
  photographerId: string
  senderRole: string
  body: string
  createdAt: Date
  customer: { name: string }
  photographer: { name: string }
}

function serializeMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    customerId: row.customerId,
    photographerId: row.photographerId,
    senderRole: row.senderRole === "photographer" ? "photographer" : "customer",
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    customerName: row.customer.name,
    photographerName: row.photographer.name,
  }
}

/** GET — customer sees only their thread; photographer sees their inbox or one thread. */
export async function GET(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response
  await pruneOldMessages()

  const url = new URL(req.url)
  const photographerId = url.searchParams.get("photographerId")
  const customerId = url.searchParams.get("customerId")

  let where: { photographerId: string; customerId?: string }
  if (photographerId !== null) {
    where = guard.user.id === photographerId
      ? { photographerId, ...(customerId !== null ? { customerId } : {}) }
      : { photographerId, customerId: guard.user.id }
  } else {
    if (guard.user.role !== "fotografer") {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }
    where = { photographerId: guard.user.id }
  }

  const rows = await prisma.chatMessage.findMany({
    where,
    include: messageInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: MESSAGE_LIMIT,
  })

  return Response.json({ messages: rows.reverse().map(serializeMessage) })
}

/** POST — only the customer or photographer in the thread may write. */
export async function POST(req: Request) {
  const guard = await requireUser()
  if ("response" in guard) return guard.response
  await pruneOldMessages()

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = chatMessageSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const input = parsed.data

  if (guard.user.id !== input.customerId && guard.user.id !== input.photographerId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const [customer, photographer] = await Promise.all([
    prisma.user.findUnique({ where: { id: input.customerId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: input.photographerId }, select: { role: true } }),
  ])
  if (!customer || !photographer) {
    return Response.json({ error: "Pengguna tidak ditemukan." }, { status: 400 })
  }
  if (customer.role !== "user" || photographer.role !== "fotografer") {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const limited = checkRateLimit(`chat:${guard.user.id}`, 10, 60_000)
  if (!limited.ok) {
    return Response.json(
      { error: "Terlalu banyak pesan. Coba lagi sebentar." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    )
  }

  const message = await prisma.chatMessage.create({
    data: {
      customerId: input.customerId,
      photographerId: input.photographerId,
      senderRole: guard.user.id === input.photographerId ? "photographer" : "customer",
      body: input.body,
    },
    include: messageInclude,
  })

  return Response.json({ message: serializeMessage(message) }, { status: 201 })
}
