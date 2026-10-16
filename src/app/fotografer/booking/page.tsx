"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Field, Input, Select } from "@/components/ui/field";
import { Tabs } from "@/components/ui/tabs";
import { Avatar, EmptyState, Stat } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import { BookingDetailModal } from "@/components/fotografer/booking-detail-modal";
import type { Booking } from "@/lib/types";

export default function BookingFotografer() {
  const { session, bookings, packages, setBookingStatus } = useGradly();
  const [status, setStatus] = useState("all");
  const [packageId, setPackageId] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const mine = useMemo(
    () => bookings.filter((b) => b.photographerId === session?.id),
    [bookings, session?.id],
  );
  const myPackages = useMemo(
    () => packages.filter((p) => p.photographerId === session?.id),
    [packages, session?.id],
  );

  const count = (s: string) => mine.filter((b) => b.status === s).length;

  const tabs = [
    { value: "all", label: "Semua", count: mine.length },
    { value: "Menunggu konfirmasi", label: "Menunggu", count: count("Menunggu konfirmasi") },
    { value: "Confirmed", label: "Terkonfirmasi", count: count("Confirmed") },
    { value: "Selesai", label: "Selesai", count: count("Selesai") },
    { value: "Dibatalkan", label: "Dibatalkan", count: count("Dibatalkan") },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mine
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => packageId === "all" || b.packageId === packageId)
      .filter((b) => q === "" || b.customerName.toLowerCase().includes(q))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [mine, status, packageId, query]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total booking" value={mine.length} icon={<Icon name="calendar" size={18} />} />
        <Stat
          label="Terkonfirmasi"
          value={count("Confirmed")}
          tone="sky"
          icon={<Icon name="check" size={18} />}
        />
        <Stat
          label="Menunggu konfirmasi"
          value={count("Menunggu konfirmasi")}
          tone="butter"
          icon={<Icon name="clock" size={18} />}
        />
        <Stat
          label="Selesai"
          value={count("Selesai")}
          tone="sage"
          icon={<Icon name="camera" size={18} />}
        />
      </section>

      <Card className="p-4 sm:p-5">
        <Tabs tabs={tabs} value={status} onChange={setStatus} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <Field label="Paket" htmlFor="filter-paket" className="sm:col-span-2 lg:col-span-1">
            <Select
              id="filter-paket"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="all">Semua paket</option>
              {myPackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cari klien" htmlFor="filter-cari" className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <Input
                id="filter-cari"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nama klien…"
              />
            </div>
          </Field>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Tidak ada booking yang cocok"
          description="Coba ubah filter status, paket, atau kata kunci pencarian."
        />
      ) : (
        <ul className="space-y-4">
          {filtered.map((b) => {
            const pending = b.status === "Menunggu konfirmasi";
            return (
              <li key={b.id}>
                <Card className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar name={b.customerName} size={42} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{b.customerName}</p>
                        <p className="truncate text-xs text-ink/55">
                          {b.id} · {b.customerPhone}
                        </p>
                      </div>
                    </div>
                    <StatusChip status={b.status} />
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Paket</dt>
                      <dd className="mt-0.5 truncate font-medium">{b.packageName}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Jadwal</dt>
                      <dd className="mt-0.5 truncate font-medium">
                        {formatDate(b.eventDate, { short: true })} · {b.eventTime}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Lokasi</dt>
                      <dd className="mt-0.5 truncate font-medium">{b.location || "—"}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-ink/50">Total</dt>
                      <dd className="mt-0.5 truncate font-medium">{rupiah(b.total)}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/8 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {b.subsidized ? (
                        <Chip tone="butter">Subsidi</Chip>
                      ) : (
                        <Chip tone="outline">Reguler</Chip>
                      )}
                      {b.payment ? <Chip tone="sky">Sudah bayar</Chip> : null}
                    </div>
                    <div className="flex gap-2">
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
            );
          })}
        </ul>
      )}

      <BookingDetailModal
        booking={selected}
        onClose={() => setSelected(null)}
        onConfirm={(id) => setBookingStatus(id, "Confirmed")}
        onSetStatus={(id, status) => setBookingStatus(id, status)}
      />
    </div>
  );
}
