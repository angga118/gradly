import { requireRole, requireUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { serializePackage } from "@/lib/serializers"
import { packageSchema } from "@/lib/validators"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const wantsAll = url.searchParams.get("all") === "1"

  // `?all=1` exposes inactive packages, but only to fotografer/admin.
  let includeInactive = false
  if (wantsAll) {
    const guard = await requireUser()
    if (!("response" in guard)) {
      includeInactive = guard.user.role === "fotografer" || guard.user.role === "admin"
    }
  }

  const rows = await prisma.package.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: "asc" },
  })

  return Response.json({ packages: rows.map(serializePackage) })
}

/** POST — fotografer creates a package owned by them. */
export async function POST(req: Request) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body tidak valid." }, { status: 400 })
  }

  const parsed = packageSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    )
  }
  const input = parsed.data

  if (input.subsidyPrice != null && input.subsidyPrice >= input.price) {
    return Response.json(
      { error: "Harga subsidi harus lebih rendah dari harga normal." },
      { status: 400 },
    )
  }

  // Packages above Rp 1 juta can never be subsidized.
  const subsidyEnabled = input.price > 1_000_000 ? false : input.subsidyEnabled

  const pkg = await prisma.package.create({
    data: {
      photographerId: guard.user.id,
      name: input.name,
      description: input.description,
      price: input.price,
      subsidyPrice: input.subsidyPrice ?? null,
      subsidyEnabled,
      features: JSON.stringify(input.features),
      isActive: input.isActive,
      popular: input.popular ?? false,
    },
  })

  return Response.json({ package: serializePackage(pkg) }, { status: 201 })
}
