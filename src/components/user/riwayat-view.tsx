"use client";

import { useMemo, useState } from "react";
import type { Booking, BookingStatus } from "@/lib/types";
import { useGradly } from "@/lib/store";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";

const STATUS_TABS: BookingStatus[] = [
  "Menunggu konfirmasi",
  "Confirmed",
  "Selesai",
  "Dibatalkan",
];

export function RiwayatView() {
  const { session, bookings } = useGradly();
  const [tab, setTab] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const mine = useMemo(() => {
    if (!session) return [];
    return bookings
      .filter((b) => b.userId === session.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [bookings, session]);

  const filtered = tab === "all" ? mine : mine.filter((b) => b.status === tab);

  const tabs: TabItem[] = [
    { value: "all", label: "Semua", count: mine.length },
    ...STATUS_TABS.map((s) => ({
      value: s,
      label: s,
      count: mine.filter((b) => b.status === s).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-10 sm:px-6">
      <PageIntro
        eyebrow="Akun"
        title="Riwayat booking"
        description="Pantau status pesanan foto wisudamu dan riwayat verifikasi subsidi."
        actions={
          <Button href="/paket" size="sm">
            <Icon name="plus" size={16} />
            Booking baru
          </Button>
        }
      />

      <div className="mt-6">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon="camera"
            title={
              tab === "all"
                ? "Belum ada booking"
                : `Tidak ada booking ${tab.toLowerCase()}`
            }
            description={
              tab === "all"
                ? "Pesan sesi foto wisudamu dan riwayatnya akan muncul di sini."
                : "Coba pilih tab lain untuk melihat booking dengan status berbeda."
            }
            action={
              tab === "all" ? <Button href="/paket">Lihat paket</Button> : undefined
            }
          />
        ) : (
          <ul className="space-y-4">
            {filtered.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                open={expanded === booking.id}
                onToggle={() =>
                  setExpanded((prev) => (prev === booking.id ? null : booking.id))
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BookingRow({
  booking,
  open,
  onToggle,
}: {
  booking: Booking;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card as="li" className={cn("overflow-hidden transition-shadow", open && "shadow-soft")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-5 py-5 text-left sm:px-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg leading-tight">{booking.packageName}</h2>
              {booking.subsidized ? <Chip tone="butter">Subsidi</Chip> : null}
            </div>
            <p className="mt-1 font-mono text-xs text-ink/55">{booking.id}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/65">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={15} />
                {formatDate(booking.eventDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={15} />
                {booking.eventTime} WIB
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="mapPin" size={15} />
                {booking.location}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-right">
              <span className="block font-serif text-lg">{rupiah(booking.total)}</span>
              <span className="text-xs text-ink/55">Total</span>
            </span>
            <StatusChip status={booking.status} />
            <Icon
              name="chevronDown"
              size={18}
              className={cn("text-ink/45 transition-transform", open && "rotate-180")}
            />
          </div>
        </div>
      </button>

      {open ? (
        <div className="border-t border-ink/10 bg-paper/50 px-5 py-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3 text-sm">
              <DetailRow label="Nama pemesan" value={booking.customerName} />
              <DetailRow label="WhatsApp" value={booking.customerPhone} />
              <DetailRow label="Fotografer" value={booking.photographerName} />
              <DetailRow
                label="Catatan"
                value={booking.note || "Tidak ada catatan."}
              />
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                  Rincian biaya
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/65">Harga paket</span>
                    <span className="font-medium">{rupiah(booking.price)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-ink/65">Kontribusi 5%</span>
                    <span className="font-medium">{rupiah(booking.contribution)}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-ink/10 pt-2">
                    <span>Total</span>
                    <span className="font-serif">{rupiah(booking.total)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                  Bukti transfer
                </p>
                {booking.payment ? (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="file" size={16} className="text-ink/60" />
                      <span className="truncate font-medium">{booking.payment.name}</span>
                    </div>
                    <p className="text-xs text-ink/55">
                      {booking.payment.sizeKb} KB · diunggah{" "}
                      {formatDateTime(booking.payment.uploadedAt)}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs">
                      {booking.payment.verifiedAt ? (
                        <>
                          <Icon name="check" size={14} className="text-success" />
                          <span className="text-success">
                            Terverifikasi {formatDateTime(booking.payment.verifiedAt)}
                          </span>
                        </>
                      ) : (
                        <>
                          <Icon name="clock" size={14} className="text-ink/50" />
                          <span className="text-ink/55">Menunggu verifikasi admin</span>
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">Belum ada bukti transfer.</p>
                )}
              </div>
            </div>
          </div>

          <p className="mt-5 text-xs text-ink/45">
            Dibuat {formatDateTime(booking.createdAt)}
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-ink/60">{label}</span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </div>
  );
}
