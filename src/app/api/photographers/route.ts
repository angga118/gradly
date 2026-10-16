import { connection } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializePublicUser } from "@/lib/serializers"

export async function GET() {
  await connection()
  const rows = await prisma.user.findMany({
    where: { role: "fotografer" },
    orderBy: { name: "asc" },
  })
  return Response.json({ photographers: rows.map(serializePublicUser) })
}
