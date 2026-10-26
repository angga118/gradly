"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGradly } from "@/lib/store";
import { cn } from "@/lib/cn";
import { rupiah } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { StepIndicator } from "./step-indicator";
import { PackageBanner } from "./package-banner";
import { PriceBreakdown } from "./price-breakdown";
import { Reveal } from "./reveal";
import { canUseSubsidy, computePricing } from "./pricing";

export function BookingStepPrice() {
  const params = useSearchParams();
  const router = useRouter();
  const { session, draft, setDraft, packageById, userById, portfolio } = useGradly();

  const queryId = params.get("paket");
  const resolvedId = queryId && packageById(queryId) ? queryId : draft.packageId;
  const pkg = resolvedId ? packageById(resolvedId) : undefined;
  const photographer = pkg ? userById(pkg.photographerId) : undefined;
  const cover = pkg
    ? portfolio.find((item) => item.photographerId === pkg.photographerId && item.key)
    : undefined;
  const kipkVerified =
    session?.subsidyDocType === "KIP-K" && Boolean(session?.subsidyValidUntil);

  // Simpan pilihan dari query ke draft agar langkah berikutnya punya konteks.
  useEffect(() => {
    if (queryId && packageById(queryId) && queryId !== draft.packageId) {
      setDraft({ packageId: queryId });
    }
  }, [queryId, packageById, draft.packageId, setDraft]);

  const subsidyEligible = canUseSubsidy(pkg, session?.subsidyValidUntil);
  const useSubsidy = Boolean(draft.useSubsidy && subsidyEligible);

  // Kalau pilihan paket berubah jadi tidak layak subsidi, matikan toggle.
  useEffect(() => {
    if (!subsidyEligible && draft.useSubsidy) setDraft({ useSubsidy: false });
  }, [subsidyEligible, draft.useSubsidy, setDraft]);

  const { price, contribution, total, subsidyApplies } = computePricing(pkg, useSubsidy);

  const header = (
    <>
      <PageIntro
        eyebrow="Booking · Langkah 1 dari 3"
        title="Ringkasan pesanan"
        description="Periksa paket pilihanmu dan harga yang akan dibayar sebelum mengisi detail acara."
      />
      <div className="mt-6">
        <StepIndicator current={1} />
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
            title="Belum ada paket dipilih"
            description="Pilih paket dulu untuk mulai memesan sesi foto wisuda."
            action={<Button href="/paket">Lihat paket</Button>}
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
            <PackageBanner
              name={pkg.name}
              tone="sky"
              fileKey={cover?.key}
              alt={
                cover
                  ? `Karya terbaru ${cover.title}${photographer ? ` oleh ${photographer.name}` : ""}`
                  : ""
              }
            />
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl">{pkg.name}</h2>
                {pkg.popular ? <Chip tone="butter">Favorit</Chip> : null}
                {pkg.kipkOnly ? (
                  <Chip tone="sage">Khusus penerima KIP-K</Chip>
                ) : null}
                {subsidyEligible ? <Chip tone="sage">Bisa subsidi</Chip> : null}
              </div>
              <p className="mt-2 text-sm text-ink/65">{pkg.description}</p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink/75">
                    <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
                <span className="text-sm text-ink/60">Fotografer</span>
                <span className="text-sm font-medium">
                  {photographer?.name ?? "Fotografer"}
                </span>
              </div>
            </div>
          </Card>

          {pkg.kipkOnly ? (
            <KipkNotice verified={kipkVerified} />
          ) : (
            <SubsidyToggle
              eligible={subsidyEligible}
              active={subsidyApplies}
              pkg={pkg}
              sessionVerified={Boolean(session?.subsidyValidUntil)}
              onToggle={() => setDraft({ useSubsidy: !draft.useSubsidy })}
            />
          )}

          <div className="text-center lg:hidden">
            <Button href="/paket" variant="ghost" size="sm">
              <Icon name="chevronLeft" size={16} />
              Ganti paket
            </Button>
          </div>
        </Reveal>

        <Reveal delay={80} className="lg:sticky lg:top-24">
          <Card className="p-6">
            <p className="text-sm font-semibold">Ringkasan harga</p>
            <div className="mt-4">
              <PriceBreakdown
                price={price}
                contribution={contribution}
                total={total}
                subsidyApplies={subsidyApplies}
                note={
                  subsidyApplies
                    ? "Kamu memakai harga subsidi terverifikasi. Kontribusi 5% dibebaskan."
                    : "Kontribusi 5% membantu klien subsidi lain mendapat harga lebih ringan."
                }
              />
            </div>
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => router.push("/booking/acara")}
            >
              Lanjut
              <Icon name="arrowRight" size={18} />
            </Button>
            <div className="mt-3 text-center">
              <Link
                href="/paket"
                className="text-xs text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Ganti paket
              </Link>
            </div>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}

function KipkNotice({ verified }: { verified: boolean }) {
  return (
    <Card className="flex items-start gap-4 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/70 text-ink">
        <Icon name="graduation" size={18} />
      </span>
      <div className="min-w-0">
        <p className="font-medium">Paket khusus penerima KIP-K</p>
        <p className="mt-1 text-xs text-ink/60">
          {verified ? (
            "Verifikasi KIP-K kamu masih aktif, paket ini bisa langsung dipesan."
          ) : (
            <>
              Paket ini hanya untuk penerima KIP-K yang sudah diverifikasi.{" "}
              <Link
                href="/subsidi/ajukan"
                className="font-medium underline underline-offset-4"
              >
                Ajukan verifikasi KIP-K
              </Link>{" "}
              dulu.
            </>
          )}
        </p>
      </div>
    </Card>
  );
}

function SubsidyToggle({
  eligible,
  active,
  pkg,
  sessionVerified,
  onToggle,
}: {
  eligible: boolean;
  active: boolean;
  pkg: { price: number; subsidyPrice: number | null };
  sessionVerified: boolean;
  onToggle: () => void;
}) {
  const savings =
    pkg.subsidyPrice != null
      ? pkg.price + Math.round(pkg.price * 0.05) - pkg.subsidyPrice
      : 0;

  let helper: React.ReactNode;
  if (pkg.subsidyPrice == null) {
    helper = "Paket ini tidak menyediakan harga subsidi.";
  } else if (!sessionVerified) {
    helper = (
      <>
        Verifikasi SKTM atau KIP-K dulu untuk memakai harga subsidi.{" "}
        <Link href="/subsidi/ajukan" className="font-medium underline underline-offset-4">
          Ajukan verifikasi
        </Link>
      </>
    );
  } else if (active) {
    helper =
      savings > 0
        ? `Harga subsidi aktif. Kamu hemat ${rupiah(savings)} dari harga reguler.`
        : "Harga subsidi aktif untuk paket ini.";
  } else {
    helper = "Kamu terverifikasi. Aktifkan untuk memakai harga subsidi.";
  }

  return (
    <Card
      className={cn(
        "flex items-start justify-between gap-4 p-5 transition-colors",
        eligible && active ? "border-ink/20 bg-butter/40" : undefined,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon name="tag" size={18} className="text-ink/70" />
          <p className="font-medium">Gunakan Harga Subsidi</p>
        </div>
        <p className="mt-1 text-xs text-ink/60">{helper}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label="Gunakan harga subsidi"
        disabled={!eligible}
        onClick={onToggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40",
          active ? "bg-ink" : "bg-ink/20",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-paper shadow-soft transition-all",
            active ? "left-6" : "left-1",
          )}
        />
      </button>
    </Card>
  );
}
