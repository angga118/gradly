"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah, rupiahShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, Stat } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { DistributionDonut } from "@/components/admin/distribution-donut";
import { AdminBookingDetailModal } from "@/components/admin/booking-detail-modal";
import type { Booking } from "@/lib/types";

export default function AdminRingkasan() {
  const { session, bookings, subsidyApplications, setBookingStatus, stats } =
    useGradly();
  const fund = stats.subsidyFund;
  const [selected, setSelected] = useState<Booking | null>(null);

  const pendingVerifications = subsidyApplications.filter(
    (a) => a.status === "Menunggu review",
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "Menunggu konfirmasi",
  ).length;

  const regularRevenue = useMemo(
    () =>
      bookings
        .filter((b) => !b.subsidized && b.status !== "Dibatalkan")
        .reduce((sum, b) => sum + b.total, 0),
    [bookings],
  );

  const subsidyClients = useMemo(
    () =>
      new Set(
        subsidyApplications
          .filter((a) => a.status === "Terverifikasi")
          .map((a) => a.userId),
      ).size,
    [subsidyApplications],
  );

  const { regularClients, subsidizedClients } = useMemo(() => {
    const reg = new Set<string>();
    const sub = new Set<string>();
    for (const b of bookings) {
      if (b.subsidized) sub.add(b.userId);
      else reg.add(b.userId);
    }
    return { regularClients: reg.size, subsidizedClients: sub.size };
  }, [bookings]);

  const recent = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [bookings],
  );

  const firstName = session?.name.split(" ")[0] ?? "Admin";

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink text-paper shadow-soft">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/55">
              Panel Admin Gradly
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl">
              Selamat datang, {firstName}
            </h2>
            <p className="mt-1.5 text-sm text-paper/70">
              {pendingVerifications > 0
                ? `${pendingVerifications} pengajuan subsidi menunggu peninjauan.`
                : "Tidak ada pengajuan subsidi yang menunggu."}{" "}
              {pendingBookings > 0
                ? `${pendingBookings} booking perlu dikonfirmasi.`
                : "Semua booking sudah ditindaklanjuti."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/admin/verifikasi" variant="butter" size="sm">
              Tinjau verifikasi
            </Button>
            <Link
              href="/admin/booking"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-paper/40 px-4 text-sm text-paper transition-colors hover:border-paper hover:bg-paper/10"
            >
              Lihat booking
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Total booking"
          value={bookings.length}
          tone="sky"
          icon={<Icon name="calendar" size={18} />}
          hint={`${pendingBookings} menunggu konfirmasi`}
        />
        <Stat
          label="Dana subsidi tersedia"
          value={rupiahShort(fund.available)}
          tone="butter"
          icon={<Icon name="wallet" size={18} />}
          hint={`Target ${rupiahShort(fund.target)}`}
        />
        <Stat
          label="Pendapatan reguler"
          value={rupiahShort(regularRevenue)}
          icon={<Icon name="trending" size={18} />}
          hint="Dari booking reguler aktif"
        />
        <Stat
          label="Klien subsidi"
          value={subsidyClients}
          tone="sage"
          icon={<Icon name="users" size={18} />}
          hint="Penerima subsidi terverifikasi"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader
            title="Pendapatan 6 bulan"
            subtitle="Perbandingan pemasukan sesi reguler dan subsidi"
          />
          <div className="mt-6">
            <RevenueChart data={stats.monthlyRevenue} />
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader
            title="Sebaran klien"
            subtitle="Reguler dibanding penerima subsidi"
          />
          <div className="mt-6">
            <DistributionDonut
              centerLabel="klien unik"
              centerValue={String(regularClients + subsidizedClients)}
              slices={[
                {
                  label: "Klien reguler",
                  value: regularClients,
                  className: "bg-ink",
                  color: "#513229",
                },
                {
                  label: "Klien subsidi",
                  value: subsidizedClients,
                  className: "bg-butter-deep",
                  color: "#f6d68c",
                },
              ]}
            />
          </div>
        </Card>
      </section>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Booking terbaru"
          subtitle="Enam pengajuan terakhir dari klien"
          action={
            <Link
              href="/admin/booking"
              className="text-sm text-ink/60 transition-colors hover:text-ink"
            >
              Semua
            </Link>
          }
        />
        {recent.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="calendar"
              title="Belum ada booking"
              description="Booking baru dari klien akan muncul di sini."
            />
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-ink/8">
            {recent.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setSelected(b)}
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left transition-colors hover:bg-ink/[0.03]"
                >
                  <Avatar name={b.customerName} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {b.customerName}
                    </p>
                    <p className="truncate text-xs text-ink/55">
                      {b.packageName} · {formatDate(b.eventDate, { short: true })}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-medium tabular-nums">
                      {rupiah(b.total)}
                    </p>
                    <div className="mt-1 flex justify-end">
                      <StatusChip status={b.status} />
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <AdminBookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setBookingStatus(id, "Confirmed")}
        onSetStatus={(id, status) => setBookingStatus(id, status)}
      />
    </div>
  );
}
