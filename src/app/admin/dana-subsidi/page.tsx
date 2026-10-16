"use client";

import { useMemo } from "react";
import { useGradly } from "@/lib/store";
import { formatDateTime, rupiah, rupiahShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { EmptyState, Progress, Stat } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";

export default function AdminDanaSubsidi() {
  const { ledger, stats } = useGradly();
  const fund = stats.subsidyFund;

  const { rows, totalIn, totalOut } = useMemo(() => {
    // honey: payouts are photographer income, not fund movement — exclude them entirely.
    const ascending = ledger
      .filter((e) => e.type !== "payout")
      .sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
    const deltas = ascending.map((entry) =>
      entry.type === "contribution" || entry.type === "topup" ? entry.amount : -entry.amount,
    );
    const withBalance = ascending.map((entry, i) => ({
      ...entry,
      balance: deltas.slice(0, i + 1).reduce((sum, d) => sum + d, 0),
    }));
    return {
      rows: [...withBalance].reverse(),
      totalIn: ascending
        .filter((e) => e.type === "contribution" || e.type === "topup")
        .reduce((sum, e) => sum + e.amount, 0),
      totalOut: ascending
        .filter((e) => e.type === "distribution")
        .reduce((sum, e) => sum + e.amount, 0),
    };
  }, [ledger]);

  const pct = Math.round((fund.available / fund.target) * 100);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Dana tersedia"
          value={rupiahShort(fund.available)}
          tone="butter"
          icon={<Icon name="wallet" size={18} />}
          hint={`${pct}% dari target ${rupiahShort(fund.target)}`}
        />
        <Stat
          label="Total didistribusikan"
          value={rupiahShort(fund.distributed)}
          tone="sky"
          icon={<Icon name="send" size={18} />}
          hint="Kompensasi untuk sesi bersubsidi"
        />
        <Stat
          label="Kontribusi bulan ini"
          value={rupiahShort(fund.monthlyContribution)}
          tone="sage"
          icon={<Icon name="trending" size={18} />}
          hint="Dari 5% harga paket reguler"
        />
        <Stat
          label="Mutasi tercatat"
          value={ledger.length}
          icon={<Icon name="refresh" size={18} />}
          hint={`Masuk ${rupiahShort(totalIn)} · Keluar ${rupiahShort(totalOut)}`}
        />
      </section>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Progres ke target dana"
          subtitle="Akumulasi saldo dana subsidi dibanding target pengumpulan"
          action={
            <span className="font-serif text-2xl leading-none">{pct}%</span>
          }
        />
        <div className="mt-6">
          <Progress
            value={fund.available}
            max={fund.target}
            tone="butter"
            className="h-3"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-ink/60">
              Terkumpul {rupiah(fund.available)}
            </span>
            <span className="text-ink/60">
              Target {rupiah(fund.target)}
            </span>
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-ink/10 bg-white/50 p-4 text-sm text-ink/70">
            <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/50" />
            <p>
              Setiap klien reguler menambahkan kontribusi 5% dari harga paket.
              Dana itu dikumpulkan sebagai saldo dan disalurkan sebagai potongan
              harga untuk klien bersubsidi. Dana awal dari mitra/CSR juga
              menambah saldo dana.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Riwayat mutasi dana"
          subtitle="Kontribusi & dana awal masuk, kompensasi keluar, terbaru di atas"
          action={
            <div className="flex flex-wrap gap-2">
              <Chip tone="sage">Masuk</Chip>
              <Chip tone="danger">Keluar</Chip>
            </div>
          }
        />
        {rows.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon="wallet"
              title="Belum ada mutasi"
              description="Kontribusi dan kompensasi subsidi akan tercatat di sini."
            />
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-ink/8">
            {rows.map((entry) => {
              const isIn = entry.type === "contribution" || entry.type === "topup";
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-3 py-3.5 sm:items-center"
                >
                  <span
                    className={
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:mt-0 " +
                      (isIn
                        ? "bg-sage/60 text-ink"
                        : "bg-danger-soft text-danger")
                    }
                  >
                    <Icon name={isIn ? "download" : "send"} size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {entry.label}
                    </p>
                    <p className="truncate text-xs text-ink/50">
                      {entry.bookingId ? `${entry.bookingId} · ` : ""}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={
                        "text-sm font-medium tabular-nums " +
                        (isIn ? "text-success" : "text-danger")
                      }
                    >
                      {isIn ? "+" : "−"}
                      {rupiah(entry.amount)}
                    </p>
                    <p className="text-xs tabular-nums text-ink/50">
                      Saldo {rupiah(entry.balance)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
