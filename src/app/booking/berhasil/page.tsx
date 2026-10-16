import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { RequireRole } from "@/components/guards";
import { BookingSuccess } from "@/components/user/booking-success";
import { PageLoading } from "@/components/user/page-loading";

export const metadata: Metadata = { title: "Booking terkirim" };

export default function BookingSuccessPage() {
  return (
    <PublicShell>
      <RequireRole role="user">
        <Suspense fallback={<PageLoading />}>
          <BookingSuccess />
        </Suspense>
      </RequireRole>
    </PublicShell>
  );
}
