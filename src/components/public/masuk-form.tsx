"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useGradly } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";
import { AuthShell } from "./auth-shell";
import { roleHome } from "./role-home";

export function MasukForm() {
  const router = useRouter();
  const { login, session } = useGradly();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") ? rawNext : null;
  const verified = searchParams.get("verified") === "1";
  const verifyError = searchParams.get("verify_error") === "1";

  // Setelah sesi terisi, arahkan ke tujuan (next atau beranda sesuai peran).
  useEffect(() => {
    if (submitted && session) {
      router.replace(next ?? roleHome(session.role));
    }
  }, [submitted, session, next, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerify(false);
    setResendStatus(null);
    if (!email.trim() || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Gagal masuk. Coba lagi.");
      setNeedsVerify(res.code === "email_not_verified");
      return;
    }
    setSubmitted(true);
  }

  async function onResend() {
    setResending(true);
    setResendStatus(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendStatus(
        res.ok
          ? "Email verifikasi telah dikirim ulang. Cek kotak masuk Anda."
          : "Gagal mengirim ulang. Coba lagi.",
      );
    } catch {
      setResendStatus("Gagal mengirim ulang. Coba lagi.");
    }
    setResending(false);
  }

  return (
    <AuthShell
      quote={{
        text: "Hasilnya hangat banget dan prosesnya santai. Aku yang awalnya kaku jadi lupa sedang difoto.",
        name: "Rani Puspita",
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
          Masuk
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
          Selamat datang kembali
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          Masuk untuk memesan paket, melacak booking, atau mengelola portalmu.
        </p>

        {next ? (
          <div className="mt-5 flex items-start gap-2 rounded-2xl bg-sky/50 p-3.5 text-xs text-ink/70">
            <Icon name="info" size={16} className="mt-0.5 shrink-0" />
            Kamu akan diarahkan kembali ke halaman sebelumnya setelah masuk.
          </div>
        ) : null}

        {verified ? (
          <div
            role="status"
            className="mt-5 flex items-start gap-2 rounded-2xl bg-sage/50 p-3.5 text-sm text-ink/80"
          >
            <Icon name="check" size={16} className="mt-0.5 shrink-0" />
            Email berhasil diverifikasi. Silakan masuk.
          </div>
        ) : null}

        {verifyError ? (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft/70 p-3.5 text-sm text-danger"
          >
            <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
            Tautan verifikasi tidak valid atau kedaluwarsa.
          </div>
        ) : null}

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          {error ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft/70 p-3.5 text-sm text-danger"
            >
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}

          {needsVerify ? (
            <div className="rounded-2xl border border-ink/15 bg-white/60 p-3.5 text-sm">
              <p className="text-ink/70">Belum menerima email verifikasi?</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={onResend}
                disabled={resending}
              >
                {resending ? "Mengirim…" : "Kirim ulang email verifikasi"}
              </Button>
              {resendStatus ? (
                <p className="mt-2 text-xs text-ink/60">{resendStatus}</p>
              ) : null}
            </div>
          ) : null}

          <Field label="Email" required htmlFor="email">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              placeholder="nama@email.com"
            />
          </Field>

          <Field
            label="Kata sandi"
            required
            htmlFor="password"
            hint="Lupa kata sandi? Hubungi admin lewat halaman bantuan."
          >
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Memproses…" : "Masuk"}
            <Icon name="arrowRight" size={18} />
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          Sudah punya akun?{" "}
          <Link
            href="/daftar"
            className="font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
          >
            Daftar di sini
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
