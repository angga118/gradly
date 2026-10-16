import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/** Header halaman publik: eyebrow, judul serif, deskripsi, dan aksi opsional. */
export function PageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Kembali",
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {backHref ? (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
        >
          <Icon name="arrowLeft" size={16} />
          {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-base text-ink/65">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
