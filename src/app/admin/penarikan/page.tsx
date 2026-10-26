"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDateTime, rupiah } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import type { Withdrawal } from "@/lib/types";

export default function AdminPenarikan() {
  const { withdrawals, processWithdrawal } = useGradly();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const count = (s: Withdrawal["status"]) =>
    withdrawals.filter((w) => w.status === s).length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return withdrawals
      .filter((w) => tab === "all" || w.status === tab)
      .filter((w) => {
        if (!q) return true;
        return (
          w.photographerName.toLowerCase().includes(q) ||
          w.bankAccount.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [withdrawals, tab, query]);

  async function advance(w: Withdrawal, status: "Diproses" | "Selesai") {
    setError(null);
    setBusy(w.id);
    const res = await processWithdrawal(w.id, status);
    setBusy(null);
    if (!res.ok) setError(res.error ?? "Gagal memproses penarikan.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "all", label: "Semua", count: withdrawals.length },
            { value: "Menunggu", label: "Menunggu", count: count("Menunggu") },
            { value: "Diproses", label: "Diproses", count: count("Diproses") },
            { value: "Selesai", label: "Selesai", count: count("Selesai") },
          ]}
        />
        <div className="relative lg:w-72">
          <Icon
            name="search"
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari fotografer atau rekening"
            aria-label="Cari penarikan"
            className="pl-10"
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft/70 p-3.5 text-sm text-danger"
        >
          <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : null}

      <TabPanel value={tab}>
        <p className="text-sm text-ink/55">
          Menampilkan {list.length} dari {withdrawals.length} penarikan
        </p>

        {list.length === 0 ? (
          <EmptyState
            icon="wallet"
            title="Belum ada penarikan"
            description="Pengajuan pencairan dana dari fotografer akan muncul di sini."
          />
        ) : (
          <ul className="space-y-3">
            {list.map((w) => (
              <li key={w.id}>
                <Card className="p-4 transition-shadow hover:shadow-soft sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky/60 text-ink">
                        <Icon name="bank" size={18} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{w.photographerName}</p>
                          <StatusChip status={w.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-ink/50">{w.id}</p>
                        <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/70">
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="bank" size={14} className="text-ink/45" />
                            <span className="break-all">{w.bankAccount}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Icon name="clock" size={14} className="text-ink/45" />
                            {formatDateTime(w.createdAt)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                      <div className="text-left sm:text-right">
                        <p className="font-medium tabular-nums">
                          {rupiah(w.amount)}
                        </p>
                        <p className="text-xs text-ink/50">Nominal penarikan</p>
                      </div>
                      {w.status === "Selesai" ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink/45">
                          <Icon name="check" size={14} />
                          Selesai
                        </span>
                      ) : (
                        <Button
                          variant={w.status === "Menunggu" ? "butter" : "primary"}
                          size="sm"
                          disabled={busy === w.id}
                          onClick={() =>
                            advance(
                              w,
                              w.status === "Menunggu" ? "Diproses" : "Selesai",
                            )
                          }
                        >
                          <Icon
                            name={w.status === "Menunggu" ? "refresh" : "check"}
                            size={16}
                          />
                          {busy === w.id
                            ? "Memproses…"
                            : w.status === "Menunggu"
                              ? "Proses"
                              : "Selesaikan"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>
    </div>
  );
}
