"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { formatDate, formatDateTime, rupiah } from "@/lib/format";
import type { Booking } from "@/lib/types";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm text-ink/55">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

export function BookingDetailModal({
  booking,
  onClose,
  onConfirm,
  onSetStatus,
}: {
  booking: Booking | null;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  onSetStatus?: (id: string, status: "Selesai" | "Dibatalkan") => void;
}) {
  const canConfirm = booking?.status === "Menunggu konfirmasi" && !!onConfirm;
  const canSetStatus =
    !!booking &&
    booking.status !== "Selesai" &&
    booking.status !== "Dibatalkan" &&
    !!onSetStatus;

  return (
    <Modal
      open={!!booking}
      onClose={onClose}
      title={booking ? `Detail ${booking.id}` : "Detail booking"}
      description={
        booking
          ? `${booking.packageName} · ${formatDate(booking.eventDate)}`
          : undefined
      }
      footer={
        booking ? (
          <>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Tutup
            </Button>
            {canConfirm ? (
              <Button
                variant="butter"
                size="sm"
                onClick={() => {
                  onConfirm?.(booking.id);
                  onClose();
                }}
              >
                Konfirmasi booking
              </Button>
            ) : null}
            {canSetStatus && booking ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onSetStatus?.(booking.id, "Selesai");
                    onClose();
                  }}
                >
                  Tandai Selesai
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    onSetStatus?.(booking.id, "Dibatalkan");
                    onClose();
                  }}
                >
                  Batalkan
                </Button>
              </>
            ) : null}
          </>
        ) : null
      }
    >
      {booking ? (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusChip status={booking.status} />
            {booking.subsidized ? (
              <Chip tone="butter">Subsidi</Chip>
            ) : (
              <Chip tone="outline">Reguler</Chip>
            )}
            {booking.payment ? (
              <Chip tone="sky">Bukti transfer ada</Chip>
            ) : (
              <Chip tone="outline">Belum bayar</Chip>
            )}
          </div>

          <dl className="divide-y divide-ink/8 rounded-xl border border-ink/10 bg-white/50 px-4">
            <Row label="Klien">{booking.customerName}</Row>
            <Row label="Kontak">{booking.customerPhone || "—"}</Row>
            <Row label="Jadwal">
              {`${formatDate(booking.eventDate)} · ${booking.eventTime}`}
            </Row>
            <Row label="Lokasi">{booking.location || "—"}</Row>
            <Row label="Catatan">{booking.note || "—"}</Row>
            <Row label="Harga paket">{rupiah(booking.price)}</Row>
            {booking.contribution > 0 ? (
              <Row label="Kontribusi subsidi">
                {rupiah(booking.contribution)}
              </Row>
            ) : null}
            <Row label="Total dibayar">{rupiah(booking.total)}</Row>
            <Row label="Dibuat">{formatDateTime(booking.createdAt)}</Row>
          </dl>

          {booking.payment ? (
            <div className="mt-4 rounded-xl border border-sky-deep/50 bg-sky/40 p-4 text-sm">
              <p className="font-medium">Bukti pembayaran</p>
              <p className="mt-1 text-ink/70">
                {booking.payment.name} · {booking.payment.sizeKb} KB
              </p>
              {booking.payment.verifiedAt ? (
                <p className="mt-0.5 text-xs text-ink/55">
                  Diverifikasi {formatDateTime(booking.payment.verifiedAt)}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}
