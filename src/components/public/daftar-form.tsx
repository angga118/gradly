"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useGradly } from "@/lib/store";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Icon, type IconName } from "@/components/ui/icons";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell } from "./auth-shell";
import { roleHome } from "./role-home";

const ROLES: { value: Role; label: string; hint: string; icon: IconName }[] = [
  {
    value: "user",
    label: "Klien",
    hint: "Pesan sesi foto wisuda",
    icon: "user",
  },
  {
    value: "fotografer",
    label: "Fotografer",
    hint: "Tawarkan paket & kelola pesanan",
    icon: "camera",
  },
];

interface FormState {
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
}

const EMPTY: FormState = { name: "", email: "", password: "", phone: "", city: "" };

export function DaftarForm() {
  const router = useRouter();
  const { register } = useGradly();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [role, setRole] = useState<Role>("user");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [verifyUrl, setVerifyUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setFormError(null);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) next.email = "Email wajib diisi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Format email belum benar.";
    if (!form.password) next.password = "Kata sandi wajib diisi.";
    else if (form.password.length < 8) next.password = "Minimal 8 karakter.";
    if (!form.phone.trim()) next.phone = "Nomor telepon wajib diisi.";
    if (!form.city.trim()) next.city = "Kota wajib diisi.";
    if (!consent) next.consent = "Kamu perlu menyetujui pemrosesan data.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setVerifyUrl(null);
    if (!validate()) return;

    setSubmitting(true);
    const res = await register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
      city: form.city.trim(),
      role,
    });
    setSubmitting(false);

    if (!res.ok) {
      if (res.verifyUrl) {
        setVerifyUrl(res.verifyUrl);
        return;
      }
      setFormError(res.error ?? "Pendaftaran gagal. Coba lagi.");
      return;
    }
    router.replace(roleHome(role));
  }

  return (
    <AuthShell
      quote={{
        text: "Sebagai penerima KIP-K, harga subsidinya sangat membantu. Kualitasnya tetap juara.",
        name: "Bagas Nugroho",
      }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
          Daftar
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">
          Buat akun Gradly
        </h1>
        <p className="mt-2 text-sm text-ink/65">
          Gratis dan cepat. Pilih peranmu, lalu mulai pesan atau tawarkan paket.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
          {formError ? (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-danger/20 bg-danger-soft/70 p-3.5 text-sm text-danger"
            >
              <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          ) : null}

          {verifyUrl ? (
            <div
              role="status"
              className="flex items-start gap-2 rounded-2xl bg-sage/50 p-3.5 text-sm text-ink/80"
            >
              <Icon name="check" size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>
                  Akun berhasil dibuat, tetapi email belum diverifikasi. Di
                  lingkungan lokal email dilewati, jadi gunakan tautan ini.
                </p>
                <a
                  href={verifyUrl}
                  className="mt-1 inline-block font-medium text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
                >
                  Verifikasi sekarang
                </a>
              </div>
            </div>
          ) : null}

          {/* Peran */}
          <div>
            <p className="mb-1.5 block text-sm font-medium text-ink">
              Daftar sebagai <span className="text-danger">*</span>
            </p>
            <div
              role="radiogroup"
              aria-label="Daftar sebagai"
              className="grid grid-cols-2 gap-3"
            >
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <label
                    key={r.value}
                    className={cn(
                      "cursor-pointer rounded-2xl border p-4 transition-colors",
                      active
                        ? "border-ink bg-ink/5"
                        : "border-ink/15 hover:border-ink/30",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={active}
                      onChange={() => setRole(r.value)}
                      className="sr-only"
                    />
                    <span className="flex items-center gap-2">
                      <Icon name={r.icon} size={18} />
                      <span className="font-medium">{r.label}</span>
                      {active ? (
                        <Icon name="check" size={15} className="ml-auto text-ink" />
                      ) : null}
                    </span>
                    <span className="mt-1 block text-xs text-ink/55">{r.hint}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <Field label="Nama lengkap" required htmlFor="name" error={errors.name}>
            <Input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Rani Puspita"
            />
          </Field>

          <Field label="Email" required htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="nama@email.com"
            />
          </Field>

          <Field
            label="Kata sandi"
            required
            htmlFor="password"
            error={errors.password}
            hint={errors.password ? undefined : "Minimal 8 karakter."}
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nomor telepon" required htmlFor="phone" error={errors.phone}>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="0812-3456-7890"
              />
            </Field>
            <Field label="Kota" required htmlFor="city" error={errors.city}>
              <Input
                id="city"
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="Contoh: Bandung"
              />
            </Field>
          </div>

          {/* Persetujuan data */}
          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/15 bg-white/60 p-4">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  setErrors((prev) => ({ ...prev, consent: "" }));
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-ink"
              />
              <span className="text-xs leading-relaxed text-ink/70">
                Saya menyetujui Gradly memproses data pribadi saya untuk keperluan
                pemesanan, verifikasi subsidi, dan komunikasi terkait layanan, sesuai
                UU Perlindungan Data Pribadi (UU PDP). Dokumen sensitif disimpan privat.
              </span>
            </label>
            {errors.consent ? (
              <p className="mt-1.5 text-xs text-danger">{errors.consent}</p>
            ) : null}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Memproses…" : "Daftar sekarang"}
            <Icon name="arrowRight" size={18} />
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/65">
          Sudah punya akun?{" "}
          <Link
            href="/masuk"
            className="font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
