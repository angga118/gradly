"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGradly } from "@/lib/store";
import { formatDate, rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { FileDrop, type PickedFile } from "@/components/ui/file-drop";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { StepIndicator } from "./step-indicator";
import { PriceBreakdown } from "./price-breakdown";
import { Reveal } from "./reveal";
import { canUseSubsidy, computePricing } from "./pricing";

export function BookingStepPayment() {
  const router = useRouter();
  const { session, draft, packageById, createBooking, attachPayment, resetDraft } =
    useGradly();

  const pkg = draft.packageId ? packageById(draft.packageId) : undefined;
  const [file, setFile] = useState<PickedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subsidyEligible = canUseSubsidy(pkg, session?.subsidyValidUntil);
  const useSubsidy = Boolean(draft.useSubsidy && subsidyEligible);
  const { price, contribution, total, subsidyApplies } = computePricing(pkg, useSubsidy);

  const ready = Boolean(
    pkg &&
      draft.customerName &&
      draft.customerPhone &&
      draft.eventDate &&
      draft.eventTime &&
      draft.location,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || !pkg || !draft.packageId) return;
    if (!file) {
      setError("Unggah bukti transfer dulu sebelum mengirim booking.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const booking = await createBooking({
        packageId: draft.packageId,
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        eventDate: draft.eventDate,
        eventTime: draft.eventTime,
        location: draft.location,
        note: draft.note,
        subsidized: subsidyApplies,
      });
      await attachPayment(booking.id, file.file);
      resetDraft();
      router.push(`/booking/berhasil?id=${booking.id}`);
    } catch (err) {
      setSubmitting(false);
      setError(err instanceof Error ? err.message : "Gagal mengirim booking.");
    }
  }

  const header = (
    <>
      <PageIntro
        eyebrow="Booking · Langkah 3 dari 3"
        title="Pembayaran"
        description="Transfer sesuai nominal, lalu unggah bukti transfer untuk diverifikasi admin."
        backHref="/booking/acara"
        backLabel="Kembali ke detail acara"
      />
      <div className="mt-6">
        <StepIndicator current={3} />
      </div>
    </>
  );

  if (!ready || !pkg) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        {header}
        <div className="mt-8">
          <EmptyState
            icon="info"
            title="Detail acara belum lengkap"
            description="Lengkapi paket dan detail acara dulu sebelum melanjutkan ke pembayaran."
            action={<Button href="/booking/acara">Isi detail acara</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      {header}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <Reveal className="space-y-6">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-ink/10 bg-sky/50 px-6 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper">
                <Icon name="bank" size={20} />
              </span>
              <div>
                <p className="font-medium">Transfer Bank BNI</p>
                <p className="text-xs text-ink/60">Rekening penampung Gradly</p>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">Bank</dt>
                  <dd className="mt-1 font-medium">BNI</dd>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    Nomor rekening
                  </dt>
                  <dd className="mt-1 font-medium tracking-wide">[...]</dd>
                </div>
                <div className="rounded-2xl border border-ink/10 bg-white/60 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    Atas nama
                  </dt>
                  <dd className="mt-1 font-medium">[...]</dd>
                </div>
                <div className="rounded-2xl border border-ink/15 bg-butter/50 p-4">
                  <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    Nominal transfer
                  </dt>
                  <dd className="mt-1 font-serif text-xl">{rupiah(total)}</dd>
                </div>
              </dl>

              <ol className="mt-6 space-y-3">
                {[
                  "Buka aplikasi m-banking atau ATM dan pilih transfer antar bank ke BNI.",
                  "Masukkan nomor rekening di atas dan nominal tepat sesuai total bayar.",
                  "Simpan struk atau tangkapan layar bukti transfer yang berhasil.",
                  "Unggah bukti transfer di bawah agar admin bisa memverifikasi.",
                ].map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-ink/75">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/8 text-xs font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <p className="mt-5 flex items-start gap-2 rounded-2xl bg-sage/40 p-4 text-xs text-ink/70">
                <Icon name="info" size={16} className="mt-0.5 shrink-0" />
                Nomor rekening dan nominal masih placeholder dan akan dikonfirmasi admin.
                Transfer nominal tepat sampai digit terakhir agar verifikasi lebih cepat.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <p className="font-medium">Unggah bukti transfer</p>
                <p className="mt-1 text-xs text-ink/60">
                  Format JPG, PNG, atau PDF maksimal 5 MB.
                </p>
              </div>
              <FileDrop
                label="Pilih atau seret bukti transfer"
                onPick={(f) => {
                  setFile(f);
                  if (f) setError(null);
                }}
              />
              {error ? <p className="text-xs text-danger">{error}</p> : null}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Mengirim…" : "Kirim booking"}
                <Icon name="send" size={18} />
              </Button>
              <p className="text-center text-xs text-ink/55">
                Dengan mengirim, kamu menyetujui pemrosesan data sesuai kebijakan privasi Gradly.
              </p>
            </form>
          </Card>
        </Reveal>

        <Reveal delay={80} className="space-y-6 lg:sticky lg:top-24">
          <Card className="p-6">
            <p className="text-sm font-semibold">Rincian pesanan</p>
            <ul className="mt-4 space-y-3 text-sm">
              <SummaryRow icon="tag" label="Paket" value={pkg.name} />
              <SummaryRow icon="user" label="Nama" value={draft.customerName} />
              <SummaryRow icon="phone" label="WhatsApp" value={draft.customerPhone} />
              <SummaryRow
                icon="calendar"
                label="Tanggal"
                value={formatDate(draft.eventDate)}
              />
              <SummaryRow icon="clock" label="Jam" value={`${draft.eventTime} WIB`} />
              <SummaryRow icon="mapPin" label="Lokasi" value={draft.location} />
            </ul>
            {subsidyApplies ? (
              <div className="mt-4">
                <Chip tone="butter">
                  <Icon name="tag" size={13} />
                  Harga subsidi
                </Chip>
              </div>
            ) : null}
            <div className="mt-5 border-t border-ink/10 pt-5">
              <PriceBreakdown
                price={price}
                contribution={contribution}
                total={total}
                subsidyApplies={subsidyApplies}
              />
            </div>
          </Card>

          <Button href="/booking/acara" variant="ghost" size="sm" className="w-full">
            <Icon name="arrowLeft" size={16} />
            Ubah detail acara
          </Button>
        </Reveal>
      </div>
    </div>
  );
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-start justify-between gap-4">
      <span className="flex items-center gap-2 text-ink/60">
        <Icon name={icon} size={16} />
        {label}
      </span>
      <span className="max-w-[60%] text-right font-medium">{value}</span>
    </li>
  );
}
