"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useGradly } from "@/lib/store";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { Avatar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { FilePreview } from "@/components/ui/file-preview";
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

export function AdminBookingDetailModal({
  booking: initialBooking,
  onClose,
  onConfirm,
  onSetStatus,
}: {
  booking: Booking | null;
  onClose: () => void;
  onConfirm?: (id: string) => void;
  onSetStatus?: (id: string, status: "Selesai" | "Dibatalkan") => void;
}) {
  const { bookings, verifyPayment } = useGradly();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read the latest copy from the store so data refreshes after verification.
  const booking = initialBooking
    ? (bookings.find((b) => b.id === initialBooking.id) ?? initialBooking)
    : null;

  useEffect(() => {
    setError(null);
    setVerifying(false);
  }, [booking?.id]);

  async function verify(bookingId: string) {
    setVerifying(true);
    const res = await verifyPayment(bookingId);
    setVerifying(false);
    if (!res.ok) setError(res.error ?? "Gagal memverifikasi pembayaran.");
  }

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
      size="lg"
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
                <Icon name="check" size={16} />
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
                  <Icon name="check" size={16} />
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
                  <Icon name="x" size={16} />
                  Batalkan
                </Button>
              </>
            ) : null}
          </>
        ) : null
      }
    >
      {booking ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white/50 p-3">
            <Avatar name={booking.customerName} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {booking.customerName}
              </p>
              <p className="truncate text-xs text-ink/55">
                {booking.customerPhone || "Kontak belum diisi"}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-2">
              <StatusChip status={booking.status} />
              {booking.subsidized ? (
                <Chip tone="butter">Subsidi</Chip>
              ) : (
                <Chip tone="outline">Reguler</Chip>
              )}
            </div>
          </div>

          <dl className="divide-y divide-ink/8 rounded-xl border border-ink/10 bg-white/50 px-4">
            <Row label="Paket">{booking.packageName}</Row>
            <Row label="Fotografer">{booking.photographerName}</Row>
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
            <div className="rounded-xl border border-sky-deep/50 bg-sky/40 p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon name="card" size={16} />
                Bukti pembayaran
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-ink/10 bg-white/60 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky text-ink">
                  <Icon name="file" size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {booking.payment.name}
                  </p>
                  <p className="text-xs text-ink/55">
                    {booking.payment.sizeKb} KB · diunggah{" "}
                    {formatDateTime(booking.payment.uploadedAt)}
                  </p>
                </div>
              </div>
              <FilePreview
                fileKey={booking.payment.key}
                name={booking.payment.name}
                className="mt-3"
              />
              {booking.payment.verifiedAt ? (
                <p className="mt-2 text-xs text-ink/55">
                  {`Diverifikasi ${booking.payment.verifiedBy ?? "admin"} · ${formatDateTime(
                    booking.payment.verifiedAt,
                  )}`}
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-xs text-ink/55">
                    Menunggu verifikasi pembayaran.
                  </p>
                  {error ? (
                    <div
                      role="alert"
                      className="flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft/70 p-3.5 text-sm text-danger"
                    >
                      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                      {error}
                    </div>
                  ) : null}
                  <Button
                    variant="butter"
                    size="sm"
                    disabled={verifying}
                    onClick={() => verify(booking.id)}
                  >
                    <Icon name="shield" size={16} />
                    {verifying ? "Memverifikasi…" : "Verifikasi pembayaran"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-butter-deep/60 bg-butter/40 p-4 text-sm">
              <p className="font-medium">Belum ada bukti pembayaran</p>
              <p className="mt-1 text-ink/65">
                Klien belum mengunggah bukti transfer untuk booking ini.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
