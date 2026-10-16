"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import type { SubsidyApplication } from "@/lib/types";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { Field, Input } from "@/components/ui/field";
import { Avatar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { AccountNav } from "./account-nav";

export function ProfilView() {
  const { session, subsidyApplications, updateProfile } = useGradly();

  const [form, setForm] = useState({
    name: session?.name ?? "",
    phone: session?.phone ?? "",
    city: session?.city ?? "",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const myApps = useMemo(() => {
    if (!session) return [];
    return subsidyApplications
      .filter((a) => a.userId === session.id)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [subsidyApplications, session]);

  if (!session) return null;

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Nama tidak boleh kosong.");
      setSaved(false);
      return;
    }
    setError(null);
    updateProfile({
      name: form.name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
    });
    setSaved(true);
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <PageIntro
        eyebrow="Akun"
        title="Profil"
        description="Kelola data diri dan lihat status verifikasi subsidi kamu."
      />

      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
        <AccountNav className="md:sticky md:top-24" />

        <div className="space-y-6">
          <Card className="flex flex-wrap items-center gap-4 p-6">
            <Avatar name={session.name} size={56} />
            <div className="min-w-0">
              <p className="font-serif text-xl">{session.name}</p>
              <p className="truncate text-sm text-ink/60">{session.email}</p>
            </div>
            <Chip tone="outline" className="ml-auto">
              {session.role === "user" ? "Klien" : session.role}
            </Chip>
          </Card>

          <Card className="p-6">
            <form onSubmit={onSave} className="space-y-5">
              <div>
                <h2 className="text-lg">Data diri</h2>
                <p className="mt-1 text-sm text-ink/60">
                  Nama ini dipakai pada detail booking dan komunikasi dengan fotografer.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nama lengkap" htmlFor="profile-name" required error={error ?? undefined}>
                  <Input
                    id="profile-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Nomor WhatsApp" htmlFor="profile-phone">
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Kota / wilayah" htmlFor="profile-city">
                  <Input
                    id="profile-city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    autoComplete="address-level2"
                  />
                </Field>
                <Field
                  label="Email"
                  htmlFor="profile-email"
                  hint="Email tidak dapat diubah. Hubungi admin bila perlu."
                >
                  <Input id="profile-email" value={session.email} readOnly disabled />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
                <Button type="submit">Simpan perubahan</Button>
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-success">
                    <Icon name="check" size={16} />
                    Perubahan tersimpan
                  </span>
                ) : null}
              </div>
            </form>
          </Card>

          <SubsidyCard session={session} apps={myApps} />
        </div>
      </div>
    </div>
  );
}

function SubsidyCard({
  session,
  apps,
}: {
  session: { subsidyValidUntil?: string | null };
  apps: SubsidyApplication[];
}) {
  const latest = apps[0];
  const verified = Boolean(session.subsidyValidUntil);

  let tone: "sky" | "butter" | "danger" | "plain" = "plain";
  let status: string | null = null;
  let headline = "Belum terverifikasi";
  let body = "Ajukan verifikasi SKTM atau KIP-K untuk memakai harga subsidi.";
  let action: React.ReactNode = (
    <Button href="/subsidi/ajukan" size="sm">
      Ajukan verifikasi
    </Button>
  );

  if (verified) {
    tone = "sky";
    status = "Terverifikasi";
    headline = "Verifikasi aktif";
    body = session.subsidyValidUntil
      ? `Kamu bisa memakai harga subsidi sampai ${formatDate(session.subsidyValidUntil)}.`
      : "Kamu bisa memakai harga subsidi untuk paket yang mendukung.";
    action = (
      <Button href="/paket" size="sm" variant="secondary">
        Pilih paket subsidi
      </Button>
    );
  } else if (latest?.status === "Menunggu review") {
    tone = "butter";
    status = "Menunggu review";
    headline = "Sedang ditinjau";
    body = `Ajuan ${latest.id} sedang ditinjau admin. Hasil dikabari maksimal 1×24 jam kerja.`;
    action = (
      <Button href="/profil/dokumen" size="sm" variant="secondary">
        Lihat dokumen
      </Button>
    );
  } else if (latest?.status === "Ditolak") {
    tone = "danger";
    status = "Ditolak";
    headline = "Perlu diajukan ulang";
    body = latest.rejectReason
      ? latest.rejectReason
      : "Dokumen belum bisa diverifikasi. Silakan ajukan ulang.";
    action = (
      <Button href="/subsidi/ajukan" size="sm">
        Ajukan ulang
      </Button>
    );
  } else if (latest?.status === "Terverifikasi") {
    tone = "sky";
    status = "Terverifikasi";
    headline = "Verifikasi aktif";
    body = "Ajuan subsidimu sudah disetujui.";
  }

  const icon = verified || tone === "sky" ? "shield" : tone === "danger" ? "alert" : "clock";

  return (
    <Card
      className={cn(
        "p-6",
        tone === "sky" && "bg-sky/40",
        tone === "butter" && "bg-butter/40",
        tone === "danger" && "bg-danger-soft/50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-4">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
              tone === "danger" ? "bg-danger text-paper" : "bg-ink text-paper",
            )}
          >
            <Icon name={icon} size={20} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-ink/50">Status subsidi</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="font-serif text-xl">{headline}</p>
              {status ? <StatusChip status={status} /> : null}
            </div>
            <p className="mt-2 max-w-md text-sm text-ink/70">{body}</p>
          </div>
        </div>
        <div className="flex items-center">{action}</div>
      </div>
    </Card>
  );
}
