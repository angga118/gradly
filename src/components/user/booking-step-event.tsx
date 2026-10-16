"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGradly } from "@/lib/store";
import { todayISO } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { StepIndicator } from "./step-indicator";
import { PackageBanner } from "./package-banner";
import { PriceBreakdown } from "./price-breakdown";
import { Reveal } from "./reveal";
import { canUseSubsidy, computePricing } from "./pricing";

type FieldKey = "customerName" | "customerPhone" | "eventDate" | "eventTime" | "location";
type Errors = Partial<Record<FieldKey, string>>;

export function BookingStepEvent() {
  const router = useRouter();
  const { session, draft, setDraft, packageById } = useGradly();

  const pkg = draft.packageId ? packageById(draft.packageId) : undefined;

  const [form, setForm] = useState({
    customerName: draft.customerName || session?.name || "",
    customerPhone: draft.customerPhone || session?.phone || "",
    eventDate: draft.eventDate,
    eventTime: draft.eventTime,
    location: draft.location,
    note: draft.note,
  });
  const [errors, setErrors] = useState<Errors>({});

  const subsidyEligible = canUseSubsidy(pkg, session?.subsidyValidUntil);
  const useSubsidy = Boolean(draft.useSubsidy && subsidyEligible);
  const { price, contribution, total, subsidyApplies } = computePricing(pkg, useSubsidy);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as FieldKey] ? { ...prev, [key]: undefined } : prev));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.customerName.trim()) next.customerName = "Nama lengkap wajib diisi.";
    if (!form.customerPhone.trim()) {
      next.customerPhone = "Nomor WhatsApp wajib diisi.";
    } else if (!/^[0-9+\-\s()]{8,}$/.test(form.customerPhone.trim())) {
      next.customerPhone = "Masukkan nomor WhatsApp yang valid.";
    }
    if (!form.eventDate) next.eventDate = "Tanggal acara wajib diisi.";
    else if (form.eventDate < todayISO()) next.eventDate = "Tanggal acara tidak boleh di masa lalu.";
    if (!form.eventTime) next.eventTime = "Jam acara wajib diisi.";
    if (!form.location.trim()) next.location = "Lokasi acara wajib diisi.";
    return next;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setDraft({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      location: form.location.trim(),
      note: form.note.trim(),
    });
    router.push("/booking/bayar");
  }

  const header = (
    <>
      <PageIntro
        eyebrow="Booking · Langkah 2 dari 3"
        title="Detail acara"
        description="Isi data pemesan dan rencana sesi. Fotografer memakai ini untuk menyiapkan jadwal."
        backHref="/booking"
        backLabel="Kembali ke ringkasan"
      />
      <div className="mt-6">
        <StepIndicator current={2} />
      </div>
    </>
  );

  if (!pkg) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
        {header}
        <div className="mt-8">
          <EmptyState
            icon="tag"
            title="Paket belum dipilih"
            description="Pilih paket dulu sebelum mengisi detail acara."
            action={<Button href="/booking">Pilih paket</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      {header}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <Reveal>
          <Card className="p-6">
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nama lengkap"
                  required
                  htmlFor="customerName"
                  error={errors.customerName}
                >
                  <Input
                    id="customerName"
                    name="customerName"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="Nama sesuai KTP"
                    autoComplete="name"
                  />
                </Field>
                <Field
                  label="Nomor WhatsApp"
                  required
                  htmlFor="customerPhone"
                  error={errors.customerPhone}
                  hint="Dipakai fotografer untuk konfirmasi jadwal."
                >
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    inputMode="tel"
                    value={form.customerPhone}
                    onChange={(e) => set("customerPhone", e.target.value)}
                    placeholder="0812-3456-7890"
                    autoComplete="tel"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Tanggal acara"
                  required
                  htmlFor="eventDate"
                  error={errors.eventDate}
                >
                  <Input
                    id="eventDate"
                    name="eventDate"
                    type="date"
                    min={todayISO()}
                    value={form.eventDate}
                    onChange={(e) => set("eventDate", e.target.value)}
                  />
                </Field>
                <Field label="Jam acara" required htmlFor="eventTime" error={errors.eventTime}>
                  <Input
                    id="eventTime"
                    name="eventTime"
                    type="time"
                    value={form.eventTime}
                    onChange={(e) => set("eventTime", e.target.value)}
                  />
                </Field>
              </div>

              <Field
                label="Lokasi acara"
                required
                htmlFor="location"
                error={errors.location}
                hint="Sertakan nama gedung atau titik temu bila perlu."
              >
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Contoh: Gerbang utama Kampus Unpad, Bandung"
                />
              </Field>

              <Field
                label="Catatan untuk fotografer"
                htmlFor="note"
                hint="Opsional. Jumlah orang, konsep, atau permintaan khusus."
              >
                <Textarea
                  id="note"
                  name="note"
                  value={form.note}
                  onChange={(e) => set("note", e.target.value)}
                  placeholder="Contoh: ada sesi keluarga setelah foto berdua."
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-5 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/booking")}
                >
                  <Icon name="arrowLeft" size={18} />
                  Kembali
                </Button>
                <Button type="submit" size="lg">
                  Lanjut ke pembayaran
                  <Icon name="arrowRight" size={18} />
                </Button>
              </div>
            </form>
          </Card>
        </Reveal>

        <Reveal delay={80} className="space-y-6 lg:sticky lg:top-24">
          <Card className="overflow-hidden">
            <PackageBanner name={pkg.name} tone="butter" ratio="aspect-[16/7]" />
            <div className="p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-ink/50">Paket dipilih</p>
              <p className="mt-1 font-serif text-xl">{pkg.name}</p>
              {subsidyApplies ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink">
                  <Icon name="tag" size={14} />
                  Memakai harga subsidi
                </p>
              ) : null}
              <div className="mt-4">
                <PriceBreakdown
                  price={price}
                  contribution={contribution}
                  total={total}
                  subsidyApplies={subsidyApplies}
                />
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
