"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/field";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { AdminBookingDetailModal } from "@/components/admin/booking-detail-modal";
import type { Booking, BookingStatus } from "@/lib/types";

const STATUS_FILTERS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua status" },
  { value: "Menunggu konfirmasi", label: "Menunggu konfirmasi" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Selesai", label: "Selesai" },
  { value: "Dibatalkan", label: "Dibatalkan" },
];

export default function AdminBooking() {
  const { bookings, setBookingStatus } = useGradly();
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const subsidizedCount = bookings.filter((b) => b.subsidized).length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => (tab === "subsidi" ? b.subsidized : true))
      .filter((b) => (status === "all" ? true : b.status === status))
      .filter((b) => {
        if (!q) return true;
        return (
          b.customerName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, tab, status, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "Semua", count: bookings.length },
            { value: "subsidi", label: "Subsidi", count: subsidizedCount },
          ]}
        />
        <div className="relative lg:w-72">
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama klien atau ID booking"
            aria-label="Cari booking"
            className="pl-10"
          />
        </div>
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {STATUS_FILTERS.map((f) => {
          const active = status === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                active
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 text-ink/65 hover:border-ink/40 hover:text-ink",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <TabPanel value={tab}>
        <p className="text-sm text-ink/55">
          Menampilkan {list.length} dari {bookings.length} booking
        </p>

        {list.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Tidak ada booking cocok"
            description="Coba ubah kata kunci pencarian atau filter status."
          />
        ) : (
          <ul className="space-y-3">
            {list.map((b) => {
              const pending = b.status === "Menunggu konfirmasi";
              return (
                <li key={b.id}>
                  <Card className="p-4 transition-shadow hover:shadow-soft sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <Avatar name={b.customerName} size={42} />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{b.customerName}</p>
                            <StatusChip status={b.status} />
                            {b.subsidized ? (
                              <Chip tone="butter">Subsidi</Chip>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-ink/50">{b.id}</p>
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/70">
                            <span className="inline-flex items-center gap-1.5">
                              <Icon name="tag" size={14} className="text-ink/45" />
                              {b.packageName}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Icon
                                name="calendar"
                                size={14}
                                className="text-ink/45"
                              />
                              {formatDate(b.eventDate, { short: true })} ·{" "}
                              {b.eventTime}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                        <div className="text-left sm:text-right">
                          <p className="font-medium tabular-nums">
                            {rupiah(b.total)}
                          </p>
                          <p className="text-xs text-ink/50">
                            {b.payment
                              ? "Bukti transfer ada"
                              : "Belum ada bukti transfer"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelected(b)}
                          >
                            Detail
                          </Button>
                          {pending ? (
                            <Button
                              variant="butter"
                              size="sm"
                              onClick={() =>
                                setBookingStatus(b.id, "Confirmed")
                              }
                            >
                              <Icon name="check" size={16} />
                              Konfirmasi
                            </Button>
                          ) : null}
                          {b.status !== "Selesai" && b.status !== "Dibatalkan" ? (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setBookingStatus(b.id, "Selesai")}
                              >
                                <Icon name="check" size={16} />
                                Tandai Selesai
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  setBookingStatus(b.id, "Dibatalkan")
                                }
                              >
                                <Icon name="x" size={16} />
                                Batalkan
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </TabPanel>

      <AdminBookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setBookingStatus(id, "Confirmed")}
        onSetStatus={(id, status) => setBookingStatus(id, status)}
      />
    </div>
  );
}
