import { connection } from "next/server"
import { prisma } from "@/lib/prisma"
import { serializeTestimonial } from "@/lib/serializers"

export async function GET() {
  await connection()
  const rows = await prisma.testimonial.findMany()
  return Response.json({ testimonials: rows.map(serializeTestimonial) })
}
