import { z } from "zod"

/** Registration — role is limited to user|fotografer; admin can never self-register. */
export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(1),
  city: z.string().min(1),
  role: z.enum(["user", "fotografer"]),
})

/** Profile self-update — whitelisted fields only. */
export const profileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  studio: z.string().optional(),
  tags: z.array(z.string()).optional(),
  acceptingBookings: z.boolean().optional(),
})

export const passwordSchema = z.object({
  current: z.string().min(1),
  next: z.string().min(8),
})

export const bookingSchema = z.object({
  packageId: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid.")
    .refine((d) => d >= new Date().toISOString().slice(0, 10), {
      message: "Tanggal acara tidak boleh di masa lalu.",
    }),
  eventTime: z.string().regex(/^\d{2}:\d{2}$/, "Jam tidak valid."),
  location: z.string().min(1),
  note: z.string().optional(),
  subsidized: z.boolean(),
})

export const subsidySchema = z.object({
  docType: z.enum(["SKTM", "KIP-K"]),
  kelurahan: z.string().min(1),
  address: z.string().min(1),
})

export const packageSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  price: z.number().positive(),
  subsidyPrice: z.number().positive().optional(),
  subsidyEnabled: z.boolean(),
  features: z.array(z.string()),
  isActive: z.boolean(),
  popular: z.boolean().optional(),
}).refine((d) => d.subsidyPrice == null || d.subsidyPrice < d.price, {
  message: "Harga subsidi harus lebih rendah dari harga normal.",
})

export const portfolioSchema = z.object({
  title: z.string().min(1),
  packageName: z.string().optional(),
  clientName: z.string().optional(),
  location: z.string().optional(),
  shotDate: z.string().min(1),
  tone: z.string().optional(),
})

export const withdrawalSchema = z.object({
  amount: z.number().positive().int("Jumlah harus bilangan bulat."),
  bankAccount: z.string().min(1),
})

export const reviewSchema = z.object({
  decision: z.enum(["Terverifikasi", "Ditolak"]),
  reason: z.string().optional(),
})
