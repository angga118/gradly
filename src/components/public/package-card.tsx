"use client";

import Link from "next/link";
import { useGradly } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { PhotoTile } from "@/components/public/photo-tile";
import { cn } from "@/lib/cn";
import { rupiah } from "@/lib/format";
import type { Package } from "@/lib/types";

/**
 * Kartu paket untuk katalog publik. Harga subsidi ditampilkan menonjol
 * hanya bila fotografer menyetel `subsidyPrice`.
 */
export function PackageCard({
  pkg,
  className,
}: {
  pkg: Package;
  className?: string;
}) {
  const { userById, portfolio } = useGradly();
  const photographer = userById(pkg.photographerId);
  const hasSubsidy = pkg.subsidyEnabled && pkg.subsidyPrice != null;
  const popular = Boolean(pkg.popular);
  const cover = portfolio.find(
    (item) => item.photographerId === pkg.photographerId && item.key,
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-[var(--radius-card)] border bg-white/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift",
        popular ? "border-ink/30 ring-1 ring-ink/15" : "border-ink/10 shadow-soft",
        className,
      )}
    >
      {popular ? (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-xs font-medium text-paper shadow-soft">
          <Icon name="sparkles" size={13} />
          Paling dipilih
        </span>
      ) : null}

      {cover ? (
        <PhotoTile
          fileKey={cover.key}
          alt={`Karya terbaru ${cover.title}${photographer ? ` oleh ${photographer.name}` : ""}`}
          tone="sky"
          className="-m-6 mb-6 aspect-[16/9] rounded-t-[var(--radius-card)]"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-2xl leading-tight">{pkg.name}</h3>
        {hasSubsidy ? <Chip tone="butter">Harga subsidi</Chip> : null}
        {pkg.kipkOnly ? <Chip tone="sage">Khusus penerima KIP-K</Chip> : null}
      </div>

      {photographer ? (
        <Link
          href={`/portofolio/${photographer.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink/55 transition-colors hover:text-ink"
        >
          <Icon name="user" size={13} />
          {photographer.name}
        </Link>
      ) : null}

      <p className="mt-2 text-sm text-ink/65">{pkg.description}</p>

      <div className="mt-5 border-y border-ink/10 py-4">
        {hasSubsidy && pkg.subsidyPrice != null ? (
          <div className="flex items-end gap-2">
            <span className="font-serif text-3xl leading-none">
              {rupiah(pkg.subsidyPrice)}
            </span>
            <span className="pb-0.5 text-xs text-ink/55">untuk penerima subsidi</span>
          </div>
        ) : (
          <span className="font-serif text-3xl leading-none">{rupiah(pkg.price)}</span>
        )}
        <p className="mt-1.5 text-xs text-ink/55">
          {pkg.kipkOnly
            ? "Khusus penerima KIP-K terverifikasi · belum termasuk kontribusi 5%"
            : hasSubsidy
              ? "Wajib verifikasi SKTM atau KIP-K"
              : "Belum termasuk kontribusi subsidi 5%"}
        </p>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-ink/80">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage/70 text-ink">
              <Icon name="check" size={11} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button
          href={`/booking?paket=${pkg.id}`}
          variant={popular ? "primary" : "secondary"}
          className="w-full"
        >
          Pesan paket ini
          <Icon name="arrowRight" size={16} />
        </Button>
      </div>
    </article>
  );
}
