import { connection } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeHighlight } from "@/lib/serializers"

export async function GET() {
  await connection()
  const rows = await prisma.highlightCard.findMany()
  return Response.json({ highlights: rows.map(serializeHighlight) })
}
