"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { lastMonthKeys, monthlyRevenue, PLATFORM_FEE } from "@/lib/stats";
import { formatDateTime, monthKey, monthLabel, rupiah, rupiahShort } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Progress, Stat } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";

export default function PendapatanFotografer() {
  const { session, bookings, ledger, withdrawals, requestWithdrawal } = useGradly();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mine = useMemo(
    () =>
      withdrawals
        .filter((w) => w.photographerId === session?.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [withdrawals, session?.id],
  );

  const mineBookings = useMemo(
    () => bookings.filter((b) => b.photographerId === session?.id),
    [bookings, session?.id],
  );
  const chartData = useMemo(() => monthlyRevenue(mineBookings, lastMonthKeys()), [mineBookings]);
  const currentMonth = monthKey(new Date().toISOString());
  const revenue =
    chartData.find((m) => m.key === currentMonth) ?? chartData[chartData.length - 1];
  const totalMonth = revenue.reguler + revenue.subsidi;
  const commission = Math.round(totalMonth * PLATFORM_FEE);

  // honey: mirrors the server rule in src/app/api/withdrawals/route.ts —
  // available = Σ(payout + distribution) for this photographer's bookings − Σ(withdrawals).
  const balance = useMemo(() => {
    const flow = ledger
      .filter((e) => e.type === "payout" || e.type === "distribution")
      .reduce((sum, e) => sum + e.amount, 0);
    const drawn = mine.reduce((sum, w) => sum + w.amount, 0);
    return Math.max(0, flow - drawn);
  }, [ledger, mine]);

  const withdrawn = mine
    .filter((w) => w.status === "Selesai")
    .reduce((sum, w) => sum + w.amount, 0);

  function openModal() {
    setAmount("");
    setBankAccount(mine[0]?.bankAccount ?? "");
    setError(null);
    setOpen(true);
  }

  async function submit() {
    const value = Number(amount) || 0;
    if (value <= 0) {
      setError("Masukkan jumlah penarikan yang valid.");
      return;
    }
    setSubmitting(true);
    const result = await requestWithdrawal(value, bankAccount.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Gagal mengajukan penarikan.");
      return;
    }
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={`Pendapatan ${monthLabel(revenue.key)}`}
          value={rupiahShort(totalMonth)}
          tone="sky"
          icon={<Icon name="trending" size={18} />}
          hint={`Reguler ${rupiahShort(revenue.reguler)} · Subsidi ${rupiahShort(revenue.subsidi)}`}
        />
        <Stat
          label="Saldo tersedia"
          value={rupiahShort(balance)}
          tone="sage"
          icon={<Icon name="wallet" size={18} />}
          hint={`Sudah ditarik ${rupiahShort(withdrawn)}`}
        />
        <Stat
          label="Komisi platform (10%)"
          value={rupiahShort(commission)}
          tone="butter"
          icon={<Icon name="card" size={18} />}
          hint="Dipotong dari tiap sesi selesai"
        />
      </section>

      <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-butter-deep/50 bg-butter/50 p-4 text-sm text-ink/80">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/70" />
        <p>
          Gradly mengenakan <strong>komisi platform 10%</strong> dari setiap sesi
          yang selesai. Nilainya otomatis dipotong sebelum masuk ke saldo
          tersedia, jadi angka di atas sudah bersih.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 sm:p-6">
          <CardHeader
            title="Rincian bulan ini"
            subtitle="Perbandingan sumber pemasukan"
          />
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/65">Reguler</span>
                <span className="font-medium">{rupiah(revenue.reguler)}</span>
              </div>
              <Progress
                value={revenue.reguler}
                max={totalMonth}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/65">Subsidi</span>
                <span className="font-medium">{rupiah(revenue.subsidi)}</span>
              </div>
              <Progress
                value={revenue.subsidi}
                max={totalMonth}
                tone="butter"
                className="mt-2"
              />
            </div>
            <div className="flex items-center justify-between border-t border-ink/8 pt-4 text-sm">
              <span className="text-ink/65">Setelah komisi</span>
              <span className="font-medium">
                {rupiah(totalMonth - commission)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col p-5 sm:p-6 lg:col-span-2">
          <CardHeader
            title="Riwayat penarikan"
            subtitle="Pengajuan dana ke rekening bank"
            action={
              <Button size="sm" onClick={openModal}>
                <Icon name="bank" size={16} />
                Ajukan penarikan
              </Button>
            }
          />
          {mine.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon="wallet"
                title="Belum ada penarikan"
                description="Ajukan penarikan pertama saat saldo sudah terkumpul."
              />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-ink/8">
              {mine.map((w) => (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-serif text-lg">{rupiah(w.amount)}</p>
                    <p className="truncate text-xs text-ink/55">
                      {w.bankAccount}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink/50">
                      {formatDateTime(w.createdAt)}
                    </span>
                    <StatusChip status={w.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ajukan penarikan"
        description="Dana dikirim ke rekening bank terdaftar."
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={submit} disabled={submitting}>
              {submitting ? "Mengirim…" : "Ajukan"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error ? (
            <p className="rounded-xl border border-danger-soft bg-danger-soft/40 px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex items-center justify-between rounded-xl border border-sage-deep/40 bg-sage/40 px-4 py-3 text-sm">
            <span className="text-ink/70">Saldo tersedia</span>
            <span className="font-medium">{rupiah(balance)}</span>
          </div>

          <Field
            label="Jumlah penarikan (Rp)"
            required
            htmlFor="wd-amount"
            hint="Tidak boleh melebihi saldo tersedia."
          >
            <Input
              id="wd-amount"
              type="number"
              min={0}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </Field>

          <button
            type="button"
            onClick={() => setAmount(String(balance))}
            className="text-sm text-ink/60 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Tarik semua saldo
          </button>

          <Field label="Rekening bank" required htmlFor="wd-bank">
            <Input
              id="wd-bank"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="mis. BCA · 1234567890 · Nama Pemilik"
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
