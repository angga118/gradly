"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { lastMonthKeys, monthlyRevenue } from "@/lib/stats";
import { formatDate, monthKey, rupiahShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, EmptyState, Stat } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import { RevenueChart } from "@/components/fotografer/revenue-chart";
import { BookingDetailModal } from "@/components/fotografer/booking-detail-modal";
import type { Booking } from "@/lib/types";

export default function DashboardFotografer() {
  const { session, bookings, setBookingStatus, portfolio } = useGradly();
  const [selected, setSelected] = useState<Booking | null>(null);

  const mine = useMemo(
    () => bookings.filter((b) => b.photographerId === session?.id),
    [bookings, session?.id],
  );

  const chartData = useMemo(() => monthlyRevenue(mine, lastMonthKeys()), [mine]);
  const currentMonth = monthKey(new Date().toISOString());
  const revenue =
    chartData.find((m) => m.key === currentMonth) ?? chartData[chartData.length - 1];

  const bookingsThisMonth = mine.filter(
    (b) => monthKey(b.createdAt) === currentMonth,
  ).length;
  const pendingCount = mine.filter(
    (b) => b.status === "Menunggu konfirmasi",
  ).length;
  const doneCount = mine.filter((b) => b.status === "Selesai").length;
  const portfolioCount = portfolio.filter(
    (item) => item.photographerId === session?.id,
  ).length;

  const recent = useMemo(
    () =>
      [...mine]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 6),
    [mine],
  );

  const firstName = session?.name.split(" ")[0] ?? "Fotografer";
  const accepting = session?.acceptingBookings ?? true;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-ink text-paper shadow-soft">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/55">
              Studio {session?.studio ?? "Gradly"}
            </p>
            <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl">
              Selamat datang, {firstName}
            </h2>
            <p className="mt-1.5 text-sm text-paper/70">
              {accepting
                ? "Kamu sedang menerima booking baru dari klien."
                : "Kamu sedang tidak menerima booking. Profilmu disembunyikan sementara."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/fotografer/booking" variant="butter" size="sm">
              Lihat booking
            </Button>
            <Link
              href="/fotografer/paket"
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-paper/40 px-4 text-sm text-paper transition-colors hover:border-paper hover:bg-paper/10"
            >
              Atur paket
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Booking bulan ini"
          value={bookingsThisMonth}
          tone="sky"
          icon={<Icon name="calendar" size={18} />}
          hint={`${pendingCount} menunggu konfirmasi`}
        />
        <Stat
          label="Rating"
          value={(session?.rating ?? 0).toFixed(1)}
          tone="butter"
          icon={<Icon name="star" size={18} />}
          hint={`${session?.sessions ?? 0} sesi selesai`}
        />
        <Stat
          label="Pendapatan bulan ini"
          value={rupiahShort(revenue.reguler + revenue.subsidi)}
          icon={<Icon name="wallet" size={18} />}
          hint={`Reguler ${rupiahShort(revenue.reguler)} · Subsidi ${rupiahShort(revenue.subsidi)}`}
        />
        <Stat
          label="Karya portofolio"
          value={portfolioCount}
          tone="sage"
          icon={<Icon name="image" size={18} />}
          hint={`Foto dipublikasikan · ${doneCount} sesi selesai`}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <CardHeader
            title="Pendapatan 6 bulan"
            subtitle="Perbandingan pemasukan sesi reguler dan subsidi"
          />
          <div className="mt-6">
            <RevenueChart data={chartData} />
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6">
          <CardHeader
            title="Booking terbaru"
            action={
              <Link
                href="/fotografer/booking"
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
            <ul className="mt-3 divide-y divide-ink/8">
              {recent.map((b) => {
                const pending = b.status === "Menunggu konfirmasi";
                return (
                  <li key={b.id} className="flex items-center gap-3 py-3">
                    <Avatar name={b.customerName} size={38} />
                    <button
                      type="button"
                      onClick={() => setSelected(b)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-medium">
                        {b.customerName}
                      </p>
                      <p className="truncate text-xs text-ink/55">
                        {b.packageName} · {formatDate(b.eventDate, { short: true })}
                      </p>
                    </button>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                      <StatusChip status={b.status} />
                      {pending ? (
                        <Button
                          size="sm"
                          variant="butter"
                          onClick={() => setBookingStatus(b.id, "Confirmed")}
                        >
                          Konfirm
                        </Button>
                      ) : null}
                      {b.status !== "Selesai" && b.status !== "Dibatalkan" ? (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setBookingStatus(b.id, "Selesai")}
                          >
                            Selesai
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setBookingStatus(b.id, "Dibatalkan")}
                          >
                            Batalkan
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      <BookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setBookingStatus(id, "Confirmed")}
        onSetStatus={(id, status) => setBookingStatus(id, status)}
      />
    </div>
  );
}
