import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { rupiah } from "@/lib/format";

export function PriceBreakdown({
  price,
  contribution,
  total,
  subsidyApplies,
  note,
}: {
  price: number;
  contribution: number;
  total: number;
  subsidyApplies: boolean;
  note?: ReactNode;
}) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-ink/65">Harga paket</dt>
        <dd className="font-medium">{rupiah(price)}</dd>
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-ink/65">Kontribusi subsidi (5%)</dt>
        <dd className={cn("font-medium", subsidyApplies && "text-success")}>
          {subsidyApplies ? "Rp 0 · dibebaskan" : rupiah(contribution)}
        </dd>
      </div>
      <div className="h-px bg-ink/10" />
      <div className="flex items-baseline justify-between gap-4">
        <dt className="font-medium">Total bayar</dt>
        <dd className="font-serif text-2xl">{rupiah(total)}</dd>
      </div>
      {note ? <p className="text-xs text-ink/55">{note}</p> : null}
    </dl>
  );
}
