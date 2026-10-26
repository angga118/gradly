import "dotenv/config"
import { prisma } from "../src/lib/prisma"
import { hashPassword } from "../src/lib/password"
import {
  seedBookings,
  seedHighlights,
  seedLedger,
  seedNotifications,
  seedPackages,
  seedPortfolio,
  seedSubsidyApplications,
  seedTestimonials,
  seedUsers,
  seedWithdrawals,
} from "../src/lib/mock-data"

const d = (s: string) => new Date(s)

// mock-data references applicants u3/u4/u5 that have no User record; create
// minimal placeholders so the FK relationships hold.
const placeholderUsers = [
  { id: "u3", email: "sinta@gradly.id", name: "Sinta Maharani" },
  { id: "u4", email: "fajar@gradly.id", name: "Fajar Ramadhan" },
  { id: "u5", email: "nadia@gradly.id", name: "Nadia Kusuma" },
]

// Subsidy grant = an approved application (single source of truth): a user
// whose application is "Terverifikasi" carries that application's docType and
// a validity window running to the end of the current calendar year.
const verifiedDocType = new Map(
  seedSubsidyApplications
    .filter((a) => a.status === "Terverifikasi")
    .map((a) => [a.userId, a.docType] as const),
)
const subsidyValidUntil = `${new Date().getFullYear()}-12-31`

async function main() {
  // Clear in FK-safe order (idempotent re-seed).
  await prisma.ledgerEntry.deleteMany()
  await prisma.paymentProof.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.subsidyApplication.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.highlightCard.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.withdrawal.deleteMany()
  await prisma.package.deleteMany()
  await prisma.user.deleteMany()
  await prisma.counter.deleteMany()

  const passwordHash = await hashPassword("gradly")

  const users = [
    ...seedUsers.map((u) => ({
      id: u.id,
      email: u.email,
      emailVerified: new Date(),
      passwordHash,
      role: u.role,
      name: u.name,
      phone: u.phone,
      city: u.city,
      createdAt: d(u.createdAt),
      bio: u.bio ?? null,
      studio: u.studio ?? null,
      tags: JSON.stringify(u.tags ?? []),
      acceptingBookings: u.acceptingBookings ?? true,
      rating: u.rating ?? 0,
      sessions: u.sessions ?? 0,
      subsidyValidUntil: verifiedDocType.has(u.id) ? subsidyValidUntil : null,
      subsidyDocType: verifiedDocType.get(u.id) ?? null,
    })),
    ...placeholderUsers.map((u) => ({
      id: u.id,
      email: u.email,
      emailVerified: new Date(),
      passwordHash,
      role: "user",
      name: u.name,
      phone: "",
      city: "Bandung",
      createdAt: new Date(),
      bio: null,
      studio: null,
      tags: "[]",
      acceptingBookings: true,
      rating: 0,
      sessions: 0,
      subsidyValidUntil: null,
      subsidyDocType: null,
    })),
  ]
  await prisma.user.createMany({ data: users })

  const nameToId = new Map(users.map((u) => [u.name, u.id]))

  await prisma.package.createMany({
    data: seedPackages.map((p) => ({
      id: p.id,
      photographerId: p.photographerId,
      name: p.name,
      description: p.description,
      price: p.price,
      subsidyPrice: p.subsidyPrice,
      subsidyEnabled: p.subsidyEnabled,
      kipkOnly: p.kipkOnly,
      features: JSON.stringify(p.features),
      isActive: p.isActive,
      popular: p.popular ?? false,
    })),
  })

  await prisma.booking.createMany({
    data: seedBookings.map((b) => ({
      id: b.id,
      userId: b.userId,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      photographerId: b.photographerId,
      packageId: b.packageId,
      eventDate: b.eventDate,
      eventTime: b.eventTime,
      location: b.location,
      note: b.note,
      price: b.price,
      contribution: b.contribution,
      total: b.total,
      status: b.status,
      subsidized: b.subsidized,
      createdAt: d(b.createdAt),
    })),
  })

  await prisma.paymentProof.createMany({
    data: seedBookings
      .filter((b) => b.payment)
      .map((b) => ({
        bookingId: b.id,
        fileKey: `seed/${b.payment!.name}`,
        name: b.payment!.name,
        sizeKb: b.payment!.sizeKb,
        uploadedAt: d(b.payment!.uploadedAt),
        verifiedById: b.payment!.verifiedBy ? nameToId.get(b.payment!.verifiedBy) ?? null : null,
        verifiedAt: b.payment!.verifiedAt ? d(b.payment!.verifiedAt) : null,
      })),
  })

  await prisma.subsidyApplication.createMany({
    data: seedSubsidyApplications.map((a) => ({
      id: a.id,
      userId: a.userId,
      docType: a.docType,
      docName: a.docName,
      fileKey: `seed/${a.docName}`,
      kelurahan: a.kelurahan,
      address: a.address,
      status: a.status,
      submittedAt: d(a.submittedAt),
      reviewedById: a.reviewedBy ? nameToId.get(a.reviewedBy) ?? null : null,
      reviewedAt: a.reviewedAt ? d(a.reviewedAt) : null,
      rejectReason: a.rejectReason ?? null,
    })),
  })

  await prisma.notification.createMany({
    data: seedNotifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      readAt: n.readAt ? d(n.readAt) : null,
      createdAt: d(n.createdAt),
    })),
  })

  await prisma.portfolioItem.createMany({
    data: seedPortfolio.map((p) => ({
      id: p.id,
      photographerId: p.photographerId,
      title: p.title,
      packageName: p.packageName,
      clientName: p.clientName,
      location: p.location,
      shotDate: p.shotDate,
      tone: p.tone,
      fileKey: null,
    })),
  })

  await prisma.highlightCard.createMany({
    data: seedHighlights.map((h) => ({
      id: h.id,
      photographerId: h.photographerId,
      icon: h.icon,
      title: h.title,
      text: h.text,
    })),
  })

  await prisma.testimonial.createMany({
    data: seedTestimonials.map((t) => ({
      id: t.id,
      photographerId: t.photographerId,
      clientName: t.clientName,
      rating: t.rating,
      message: t.message,
    })),
  })

  await prisma.ledgerEntry.createMany({
    data: seedLedger.map((l) => ({
      id: l.id,
      bookingId: l.bookingId,
      type: l.type,
      amount: l.amount,
      label: l.label,
      createdAt: d(l.createdAt),
    })),
  })

  await prisma.withdrawal.createMany({
    data: seedWithdrawals.map((w) => ({
      id: w.id,
      photographerId: w.photographerId,
      amount: w.amount,
      bankAccount: w.bankAccount,
      status: w.status,
      createdAt: d(w.createdAt),
    })),
  })

  // Continue new ids after the seeded ones.
  const maxBooking = Math.max(...seedBookings.map((b) => Number(b.id.split("_")[2])))
  const maxSubsidy = Math.max(...seedSubsidyApplications.map((a) => Number(a.id.split("_")[2])))
  await prisma.counter.createMany({
    data: [
      { name: "booking", value: maxBooking },
      { name: "subsidy", value: maxSubsidy },
    ],
  })

  const counts = {
    users: await prisma.user.count(),
    packages: await prisma.package.count(),
    bookings: await prisma.booking.count(),
    paymentProofs: await prisma.paymentProof.count(),
    subsidyApplications: await prisma.subsidyApplication.count(),
    notifications: await prisma.notification.count(),
    portfolio: await prisma.portfolioItem.count(),
    highlights: await prisma.highlightCard.count(),
    testimonials: await prisma.testimonial.count(),
    ledger: await prisma.ledgerEntry.count(),
    withdrawals: await prisma.withdrawal.count(),
    counters: await prisma.counter.count(),
  }
  console.log("Seed complete:", counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
