"use client";

import { useSearchParams } from "next/navigation";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "./reveal";

export function BookingSuccess() {
  const params = useSearchParams();
  const { bookings } = useGradly();
  const id = params.get("id");
  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        <EmptyState
          icon="info"
          title="Booking tidak ditemukan"
          description="Kami tidak menemukan booking dengan ID tersebut. Cek riwayat booking untuk melihat status terbaru."
          action={<Button href="/riwayat">Lihat riwayat booking</Button>}
        />
      </div>
    );
  }

  const steps = [
    {
      icon: "clock" as const,
      title: "Menunggu konfirmasi admin",
      body: "Admin memverifikasi bukti transfer dan mengonfirmasi jadwal maksimal 1×24 jam kerja.",
    },
    {
      icon: "bell" as const,
      title: "Pengingat 3 hari sebelum sesi",
      body: "Kami kirim notifikasi dan email pengingat agar kamu siap sebelum hari-H.",
    },
    {
      icon: "image" as const,
      title: "Hasil foto lewat Google Drive",
      body: "File foto dikirim lewat Google Drive maksimal 7 hari kerja setelah sesi selesai.",
    },
  ];

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
      <Reveal className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky text-ink shadow-soft">
          <Icon name="check" size={30} />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
          Booking terkirim
        </p>
        <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
          Terima kasih, {booking.customerName.split(" ")[0]}!
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink/65">
          Pesananmu sudah masuk. Simpan ID booking berikut untuk memudahkan pengecekan status.
        </p>
      </Reveal>

      <Reveal delay={80} className="mt-8">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 bg-butter/40 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/50">ID Booking</p>
              <p className="font-mono text-lg font-medium">{booking.id}</p>
            </div>
            <StatusChip status={booking.status} />
          </div>
          <div className="grid gap-px bg-ink/10 sm:grid-cols-2">
            <Detail label="Paket" value={booking.packageName} />
            <Detail label="Fotografer" value={booking.photographerName} />
            <Detail
              label="Tanggal & jam"
              value={`${formatDate(booking.eventDate)} · ${booking.eventTime} WIB`}
            />
            <Detail label="Lokasi" value={booking.location} />
            <Detail label="Total bayar" value={rupiah(booking.total)} />
            <Detail
              label="Status pembayaran"
              value={booking.payment ? "Bukti terkirim" : "Belum ada bukti"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 px-6 py-4">
            {booking.subsidized ? (
              <Chip tone="butter">
                <Icon name="tag" size={13} />
                Harga subsidi
              </Chip>
            ) : (
              <Chip tone="sage">
                <Icon name="heart" size={13} />
                Termasuk kontribusi 5%
              </Chip>
            )}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={140} className="mt-8">
        <Card className="p-6">
          <h2 className="text-lg">Langkah selanjutnya</h2>
          <ul className="mt-4 space-y-4">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink/8 text-ink">
                  <Icon name={step.icon} size={18} />
                </span>
                <div>
                  <p className="font-medium">
                    {i + 1}. {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/65">{step.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/riwayat" size="lg">
          Lihat riwayat booking
          <Icon name="arrowRight" size={18} />
        </Button>
        <Button href="/paket" variant="secondary" size="lg">
          Pesan paket lain
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-paper/60 px-6 py-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/50">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
