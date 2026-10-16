"use client";

import { useState } from "react";
import { useGradly } from "@/lib/store";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/password-input";
import { PageIntro } from "./page-intro";
import { AccountNav } from "./account-nav";

export function PasswordView() {
  const { changePassword } = useGradly();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rules = [
    { label: "Minimal 8 karakter", ok: next.length >= 8 },
    { label: "Huruf dan angka", ok: /[a-zA-Z]/.test(next) && /[0-9]/.test(next) },
    { label: "Kata sandi baru sama dengan konfirmasi", ok: next.length > 0 && next === confirm },
  ];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(false);
    if (!current) {
      setError("Masukkan kata sandi saat ini.");
      return;
    }
    if (next.length < 8) {
      setError("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (next !== confirm) {
      setError("Konfirmasi kata sandi belum cocok.");
      return;
    }
    setSubmitting(true);
    const res = await changePassword(current, next);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Gagal mengubah kata sandi.");
      return;
    }
    setError(null);
    setSuccess(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <PageIntro
        eyebrow="Akun"
        title="Ubah kata sandi"
        description="Ganti kata sandi secara berkala agar akunmu tetap aman."
        backHref="/profil"
        backLabel="Kembali ke profil"
      />

      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
        <AccountNav className="md:sticky md:top-24" />

        <div className="space-y-6">
          <Card className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <Field label="Kata sandi saat ini" htmlFor="current" required>
                <PasswordInput
                  id="current"
                  value={current}
                  onChange={(e) => {
                    setCurrent(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  autoComplete="current-password"
                />
              </Field>

              <Field label="Kata sandi baru" htmlFor="next" required>
                <PasswordInput
                  id="next"
                  value={next}
                  onChange={(e) => {
                    setNext(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  autoComplete="new-password"
                />
              </Field>

              <Field label="Konfirmasi kata sandi baru" htmlFor="confirm" required>
                <PasswordInput
                  id="confirm"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setError(null);
                    setSuccess(false);
                  }}
                  autoComplete="new-password"
                />
              </Field>

              <ul className="space-y-2 rounded-2xl border border-ink/10 bg-white/50 p-4">
                {rules.map((rule) => (
                  <li
                    key={rule.label}
                    className={cn(
                      "flex items-center gap-2 text-sm",
                      rule.ok ? "text-success" : "text-ink/55",
                    )}
                  >
                    <Icon name={rule.ok ? "check" : "info"} size={16} />
                    {rule.label}
                  </li>
                ))}
              </ul>

              {error ? (
                <p className="flex items-center gap-2 rounded-2xl bg-danger-soft/60 px-4 py-3 text-sm text-danger">
                  <Icon name="alert" size={16} />
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="flex items-center gap-2 rounded-2xl bg-sky/50 px-4 py-3 text-sm text-ink">
                  <Icon name="check" size={16} />
                  Kata sandi berhasil diubah.
                </p>
              ) : null}

              <div className="border-t border-ink/10 pt-5">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Menyimpan…" : "Simpan kata sandi baru"}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="flex gap-4 bg-sage/40 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
              <Icon name="shield" size={18} />
            </span>
            <div>
              <p className="font-medium">Tips keamanan</p>
              <p className="mt-1 text-sm text-ink/70">
                Jangan pakai kata sandi yang sama dengan akun lain, dan jangan bagikan
                kode OTP kepada siapa pun.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
