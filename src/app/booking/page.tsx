import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { BookingStepPrice } from "@/components/user/booking-step-price";
import { PageLoading } from "@/components/user/page-loading";

export const metadata: Metadata = { title: "Booking · Ringkasan" };

export default function BookingPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <Suspense fallback={<PageLoading />}>
          <BookingStepPrice />
        </Suspense>
      </RequireRole>
    </PublicShell>
  );
}
