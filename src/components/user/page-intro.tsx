import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

export function PageIntro({
  eyebrow,
  title,
  description,
  backHref,
  backLabel = "Kembali",
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  backHref?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {backHref ? (
          <Link
            href={backHref}
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink/60 transition-colors hover:text-ink"
          >
            <Icon name="arrowLeft" size={16} />
            {backLabel}
          </Link>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-ink/65">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
