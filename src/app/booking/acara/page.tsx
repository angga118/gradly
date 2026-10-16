import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { BookingStepEvent } from "@/components/user/booking-step-event";

export const metadata: Metadata = { title: "Booking · Detail Acara" };

export default function BookingEventPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <BookingStepEvent />
      </RequireRole>
    </PublicShell>
  );
}
