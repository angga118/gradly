import { requireRole } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { SUBSIDY_MAX_PACKAGE_PRICE } from "@/lib/rules"
import { serializePackage } from "@/lib/serializers"
import { KIPK_ONLY_CONFLICT, packageSchema, violatesKipkOnlyRule } from "@/lib/validators"

/** PATCH — owner fotografer updates a package. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  const { id } = await params

  const existing = await prisma.package.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Paket tidak ditemukan." }, { status: 404 })
  }
  if (existing.photographerId !== guard.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

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

  if (violatesKipkOnlyRule(input)) {
    return Response.json({ error: KIPK_ONLY_CONFLICT }, { status: 400 })
  }

  if (input.subsidyPrice != null && input.subsidyPrice >= input.price) {
    return Response.json(
      { error: "Harga subsidi harus lebih rendah dari harga normal." },
      { status: 400 },
    )
  }

  // Packages above the subsidy ceiling can never be subsidized.
  const subsidyEnabled =
    input.price > SUBSIDY_MAX_PACKAGE_PRICE ? false : input.subsidyEnabled

  const updated = await prisma.package.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      subsidyPrice: input.subsidyPrice ?? null,
      subsidyEnabled,
      kipkOnly: input.kipkOnly,
      features: JSON.stringify(input.features),
      isActive: input.isActive,
      popular: input.popular ?? false,
    },
  })

  return Response.json({ package: serializePackage(updated) })
}

/** DELETE — owner fotografer soft-deletes a package (keeps Booking FK intact). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireRole("fotografer")
  if ("response" in guard) return guard.response

  const { id } = await params

  const existing = await prisma.package.findUnique({ where: { id } })
  if (!existing) {
    return Response.json({ error: "Paket tidak ditemukan." }, { status: 404 })
  }
  if (existing.photographerId !== guard.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.package.update({ where: { id }, data: { isActive: false } })
  return Response.json({ ok: true })
}
