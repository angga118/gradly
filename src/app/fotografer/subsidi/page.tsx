"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah, rupiahShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Avatar, EmptyState, Stat } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import { BookingDetailModal } from "@/components/fotografer/booking-detail-modal";
import type { Booking } from "@/lib/types";

export default function SubsidiFotografer() {
  const { session, bookings, ledger, setBookingStatus } = useGradly();
  const [selected, setSelected] = useState<Booking | null>(null);

  const subsidized = useMemo(
    () =>
      bookings
        .filter((b) => b.photographerId === session?.id && b.subsidized)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookings, session?.id],
  );

  const compensation = useMemo(
    () =>
      ledger
        .filter((l) => l.type === "distribution")
        .reduce((sum, l) => sum + l.amount, 0),
    [ledger],
  );

  const pending = subsidized.filter(
    (b) => b.status === "Menunggu konfirmasi",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Total sesi subsidi"
          value={subsidized.length}
          tone="butter"
          icon={<Icon name="heart" size={18} />}
          hint="Sesi dengan tarif khusus"
        />
        <Stat
          label="Kompensasi diterima"
          value={rupiahShort(compensation)}
          tone="sky"
          icon={<Icon name="wallet" size={18} />}
          hint="Dari dana subsidi Gradly"
        />
        <Stat
          label="Menunggu konfirmasi"
          value={pending}
          icon={<Icon name="clock" size={18} />}
          hint={pending === 0 ? "Semua sudah ditindak" : "Perlu konfirmasi"}
        />
      </section>

      <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-sage-deep/40 bg-sage/40 p-4 text-sm text-ink/80">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/70" />
        <p>
          Untuk sesi subsidi, dana subsidi menutup selisih harga sehingga
          pendapatanmu tetap penuh. Kompensasi masuk otomatis setelah sesi
          selesai dan dikonfirmasi.
        </p>
      </div>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Booking bersubsidi"
          subtitle="Daftar klien penerima tarif khusus"
        />
        {subsidized.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="heart"
              title="Belum ada sesi subsidi"
              description="Booking bersubsidi dari klien penerima SKTM/KIP-K akan tampil di sini."
            />
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {subsidized.map((b) => (
              <li key={b.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar name={b.customerName} size={40} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{b.customerName}</p>
                        <p className="truncate text-xs text-ink/55">
                          {b.id} · {b.packageName}
                        </p>
                      </div>
                    </div>
                    <StatusChip status={b.status} />
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Jadwal</dt>
                      <dd className="mt-0.5 truncate font-medium">
                        {formatDate(b.eventDate, { short: true })} · {b.eventTime}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Lokasi</dt>
                      <dd className="mt-0.5 truncate font-medium">
                        {b.location || "—"}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Tarif subsidi</dt>
                      <dd className="mt-0.5 truncate font-medium">
                        {rupiah(b.price)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4">
                    <Chip tone="butter">
                      <Icon name="heart" size={14} />
                      Kompensasi {rupiah(b.price)}
                    </Chip>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelected(b)}
                      >
                        Detail
                      </Button>
                      {b.status === "Menunggu konfirmasi" ? (
                        <Button
                          variant="butter"
                          size="sm"
                          onClick={() => setBookingStatus(b.id, "Confirmed")}
                        >
                          Konfirm
                        </Button>
                      ) : null}
                      {b.status !== "Selesai" && b.status !== "Dibatalkan" ? (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setBookingStatus(b.id, "Selesai")}
                          >
                            Selesai
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setBookingStatus(b.id, "Dibatalkan")}
                          >
                            Batalkan
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setBookingStatus(id, "Confirmed")}
        onSetStatus={(id, status) => setBookingStatus(id, status)}
      />
    </div>
  );
}
