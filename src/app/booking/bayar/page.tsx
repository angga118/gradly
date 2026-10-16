import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { BookingStepPayment } from "@/components/user/booking-step-payment";

export const metadata: Metadata = { title: "Booking · Pembayaran" };

export default function BookingPaymentPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <BookingStepPayment />
      </RequireRole>
    </PublicShell>
  );
}
