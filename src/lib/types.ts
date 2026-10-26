import type { IconName } from "@/components/ui/icons";

export type Role = "user" | "fotografer" | "admin";

export type BookingStatus =
  | "Menunggu konfirmasi"
  | "Confirmed"
  | "Selesai"
  | "Dibatalkan";

export type SubsidyStatus = "Menunggu review" | "Terverifikasi" | "Ditolak";

export type DocType = "SKTM" | "KIP-K";

export interface User {
  id: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
  /** Only for role "fotografer" */
  bio?: string;
  studio?: string;
  tags?: string[];
  acceptingBookings?: boolean;
  rating?: number;
  sessions?: number;
  subsidyValidUntil?: string | null;
  /** Document type the subsidy verification was granted for. */
  subsidyDocType?: DocType;
}

export interface SubsidyApplication {
  id: string;
  userId: string;
  userName: string;
  docType: DocType;
  docName: string;
  docKey: string;
  kelurahan: string;
  address: string;
  status: SubsidyStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
}

export interface Package {
  id: string;
  photographerId: string;
  name: string;
  description: string;
  price: number;
  subsidyPrice: number | null;
  subsidyEnabled: boolean;
  /** Reserved for verified KIP-K recipients only. */
  kipkOnly: boolean;
  features: string[];
  isActive: boolean;
  popular?: boolean;
}

export interface PaymentProof {
  key: string;
  name: string;
  sizeKb: number;
  uploadedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Booking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  photographerId: string;
  photographerName: string;
  packageId: string;
  packageName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  note: string;
  price: number;
  contribution: number;
  total: number;
  status: BookingStatus;
  subsidized: boolean;
  createdAt: string;
  payment?: PaymentProof;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: "subsidi" | "booking" | "pembayaran" | "sistem";
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  photographerId: string;
  title: string;
  packageName: string;
  clientName: string;
  location: string;
  shotDate: string;
  tone: string;
  /** Storage key of the showcase image ("" when the item has no file). */
  key: string;
}

export interface HighlightCard {
  id: string;
  photographerId: string;
  icon: IconName;
  title: string;
  text: string;
}

export interface Testimonial {
  id: string;
  photographerId: string;
  clientName: string;
  rating: number;
  message: string;
}

export interface LedgerEntry {
  id: string;
  /** Null for fund top-ups (outside capital), which belong to no booking. */
  bookingId: string | null;
  type: "contribution" | "distribution" | "payout" | "topup";
  amount: number;
  label: string;
  createdAt: string;
}

export interface Withdrawal {
  id: string;
  photographerId: string;
  photographerName: string;
  amount: number;
  bankAccount: string;
  status: "Menunggu" | "Diproses" | "Selesai";
  createdAt: string;
}

export interface RevenuePoint {
  key: string;
  reguler: number;
  subsidi: number;
}

export interface SubsidyFund {
  available: number;
  target: number;
  distributed: number;
  monthlyContribution: number;
}

export interface Stats {
  monthlyRevenue: RevenuePoint[];
  subsidyFund: SubsidyFund;
}

export interface BookingDraft {
  packageId: string | null;
  useSubsidy: boolean;
  customerName: string;
  customerPhone: string;
  eventDate: string;
  eventTime: string;
  location: string;
  note: string;
}
