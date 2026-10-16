import type {
  Booking as PrismaBooking,
  HighlightCard as PrismaHighlightCard,
  LedgerEntry as PrismaLedgerEntry,
  Notification as PrismaNotification,
  Package as PrismaPackage,
  PaymentProof as PrismaPaymentProof,
  PortfolioItem as PrismaPortfolioItem,
  SubsidyApplication as PrismaSubsidyApplication,
  Testimonial as PrismaTestimonial,
  User as PrismaUser,
  Withdrawal as PrismaWithdrawal,
} from "@/generated/prisma/client"
import type { IconName } from "@/components/ui/icons"
import type {
  AppNotification,
  Booking,
  BookingStatus,
  DocType,
  HighlightCard,
  LedgerEntry,
  Package,
  PaymentProof,
  PortfolioItem,
  Role,
  SubsidyApplication,
  SubsidyStatus,
  Testimonial,
  User,
  Withdrawal,
} from "./types"

/* ------------------------------------------------------------------ *
 * Row types — structural shapes accepted by the serializers.
 * Route lanes pass Prisma results (with `include`) straight in.
 * ------------------------------------------------------------------ */

export type UserRow = PrismaUser
export type PackageRow = PrismaPackage
export type NotificationRow = PrismaNotification
export type PortfolioItemRow = PrismaPortfolioItem
export type HighlightCardRow = PrismaHighlightCard
export type TestimonialRow = PrismaTestimonial
export type LedgerEntryRow = PrismaLedgerEntry

export type PaymentProofRow = PrismaPaymentProof & {
  verifiedBy?: { name: string } | null
}

export type BookingRowWithRelations = PrismaBooking & {
  photographer: { name: string }
  package: { name: string }
  payment?: PaymentProofRow | null
}

export type SubsidyRowWithRelations = PrismaSubsidyApplication & {
  user: { name: string }
  reviewedBy?: { name: string } | null
}

export type WithdrawalRowWithRelations = PrismaWithdrawal & {
  photographer: { name: string }
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const ROLE_VALUES: Role[] = ["user", "fotografer", "admin"]

function asRole(value: string): Role {
  return (ROLE_VALUES as string[]).includes(value) ? (value as Role) : "user"
}

/** `tags`/`features` are JSON string columns in SQLite. */
export function parseStringArray(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : []
  } catch {
    return []
  }
}

function iso(date: Date): string {
  return date.toISOString()
}

/* ------------------------------------------------------------------ *
 * Serializers
 * ------------------------------------------------------------------ */

export function serializeUser(u: UserRow): Omit<User, "password"> {
  const role = asRole(u.role)
  const out: Omit<User, "password"> = {
    id: u.id,
    email: u.email,
    role,
    name: u.name,
    phone: u.phone,
    city: u.city,
    createdAt: iso(u.createdAt),
    subsidyValidUntil: u.subsidyValidUntil,
  }
  if (role === "fotografer") {
    out.bio = u.bio ?? ""
    out.studio = u.studio ?? ""
    out.tags = parseStringArray(u.tags)
    out.acceptingBookings = u.acceptingBookings
    out.rating = u.rating
    out.sessions = u.sessions
  }
  return out
}

/**
 * Public-safe projection of a user for unauthenticated routes
 * (e.g. `/api/photographers`). Never emits `email`, `phone`, or `password`.
 * Field set is exactly what the public consumers read:
 * landing.tsx (role, rating, sessions), portofolio-view.tsx
 * (role, name, tags, studio, city, rating, sessions, acceptingBookings, bio),
 * store.tsx (id).
 */
export type PublicUser = Pick<
  User,
  | "id"
  | "role"
  | "name"
  | "city"
  | "bio"
  | "studio"
  | "tags"
  | "acceptingBookings"
  | "rating"
  | "sessions"
>

export function serializePublicUser(u: UserRow): PublicUser {
  const role = asRole(u.role)
  const out: PublicUser = {
    id: u.id,
    role,
    name: u.name,
    city: u.city,
  }
  if (role === "fotografer") {
    out.bio = u.bio ?? ""
    out.studio = u.studio ?? ""
    out.tags = parseStringArray(u.tags)
    out.acceptingBookings = u.acceptingBookings
    out.rating = u.rating
    out.sessions = u.sessions
  }
  return out
}

export function serializePackage(p: PackageRow): Package {
  return {
    id: p.id,
    photographerId: p.photographerId,
    name: p.name,
    description: p.description,
    price: p.price,
    subsidyPrice: p.subsidyPrice,
    subsidyEnabled: p.subsidyEnabled,
    features: parseStringArray(p.features),
    isActive: p.isActive,
    popular: p.popular,
  }
}

function serializePayment(p: PaymentProofRow): PaymentProof {
  return {
    key: p.fileKey,
    name: p.name,
    sizeKb: p.sizeKb,
    uploadedAt: iso(p.uploadedAt),
    verifiedBy: p.verifiedBy?.name ?? undefined,
    verifiedAt: p.verifiedAt ? iso(p.verifiedAt) : undefined,
  }
}

export function serializeBooking(b: BookingRowWithRelations): Booking {
  const out: Booking = {
    id: b.id,
    userId: b.userId,
    customerName: b.customerName,
    customerPhone: b.customerPhone,
    photographerId: b.photographerId,
    photographerName: b.photographer.name,
    packageId: b.packageId,
    packageName: b.package.name,
    eventDate: b.eventDate,
    eventTime: b.eventTime,
    location: b.location,
    note: b.note,
    price: b.price,
    contribution: b.contribution,
    total: b.total,
    status: b.status as BookingStatus,
    subsidized: b.subsidized,
    createdAt: iso(b.createdAt),
  }
  if (b.payment) out.payment = serializePayment(b.payment)
  return out
}

export function serializeSubsidy(a: SubsidyRowWithRelations): SubsidyApplication {
  return {
    id: a.id,
    userId: a.userId,
    userName: a.user.name,
    docType: a.docType as DocType,
    docName: a.docName,
    docKey: a.fileKey ?? "",
    kelurahan: a.kelurahan,
    address: a.address,
    status: a.status as SubsidyStatus,
    submittedAt: iso(a.submittedAt),
    reviewedBy: a.reviewedBy?.name ?? undefined,
    reviewedAt: a.reviewedAt ? iso(a.reviewedAt) : undefined,
    rejectReason: a.rejectReason ?? undefined,
  }
}

export function serializeNotification(n: NotificationRow): AppNotification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as AppNotification["type"],
    title: n.title,
    body: n.body,
    readAt: n.readAt ? iso(n.readAt) : null,
    createdAt: iso(n.createdAt),
  }
}

export function serializePortfolio(p: PortfolioItemRow): PortfolioItem {
  return {
    id: p.id,
    photographerId: p.photographerId,
    title: p.title,
    packageName: p.packageName,
    clientName: p.clientName,
    location: p.location,
    shotDate: p.shotDate,
    tone: p.tone,
  }
}

export function serializeHighlight(h: HighlightCardRow): HighlightCard {
  return {
    id: h.id,
    photographerId: h.photographerId,
    icon: h.icon as IconName,
    title: h.title,
    text: h.text,
  }
}

export function serializeTestimonial(t: TestimonialRow): Testimonial {
  return {
    id: t.id,
    photographerId: t.photographerId,
    clientName: t.clientName,
    rating: t.rating,
    message: t.message,
  }
}

export function serializeLedger(l: LedgerEntryRow): LedgerEntry {
  return {
    id: l.id,
    bookingId: l.bookingId,
    type: l.type as LedgerEntry["type"],
    amount: l.amount,
    label: l.label,
    createdAt: iso(l.createdAt),
  }
}

export function serializeWithdrawal(w: WithdrawalRowWithRelations): Withdrawal {
  return {
    id: w.id,
    photographerId: w.photographerId,
    photographerName: w.photographer.name,
    amount: w.amount,
    bankAccount: w.bankAccount,
    status: w.status as Withdrawal["status"],
    createdAt: iso(w.createdAt),
  }
}
