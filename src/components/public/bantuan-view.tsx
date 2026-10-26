"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FAQ } from "@/lib/mock-data";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/field";
import { EmptyState, SectionHeading } from "@/components/ui/misc";
import { Accordion } from "./accordion";
import { PageHeader } from "./page-header";
import { Reveal } from "./reveal";

const GUIDES = [
  {
    icon: "grid" as const,
    title: "Cara memesan paket",
    text: "Pilih paket, isi detail acara, bayar, lalu unggah bukti transfer.",
    href: "/paket",
    cta: "Mulai dari paket",
  },
  {
    icon: "shield" as const,
    title: "Cara mengajukan subsidi",
    text: "Unggah SKTM atau KIP-K dan tunggu verifikasi maksimal 1×24 jam kerja.",
    href: "/subsidi",
    cta: "Pelajari subsidi",
  },
  {
    icon: "wallet" as const,
    title: "Pembayaran & bukti transfer",
    text: "Transfer manual ke rekening yang tertera, lalu unggah bukti di halaman booking.",
    href: "/riwayat",
    cta: "Lihat riwayat booking",
  },
];

const CONTACT_CARD =
  "flex h-full items-start gap-4 rounded-[var(--radius-card)] border border-ink/10 bg-white/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:shadow-lift";

const CONTACTS = [
  {
    icon: "mail" as const,
    label: "Email",
    value: siteConfig.contactEmail,
    hint: "Dibalas dalam 1×24 jam kerja",
    href: siteConfig.contactEmail ? `mailto:${siteConfig.contactEmail}` : null,
  },
  {
    icon: "phone" as const,
    label: "WhatsApp",
    value: siteConfig.contactPhone,
    hint: "Senin–Sabtu, 08.00–20.00 WIB",
    href: siteConfig.contactPhone
      ? `https://wa.me/${siteConfig.contactPhone.replace(/\D/g, "")}`
      : null,
  },
  {
    icon: "mapPin" as const,
    label: "Studio",
    value: siteConfig.contactAddress,
    hint: "Kunjungi saat jam kerja",
    href: siteConfig.contactAddress
      ? `https://maps.google.com/?q=${encodeURIComponent(siteConfig.contactAddress)}`
      : null,
  },
];

export function BantuanView() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ;
    return FAQ.filter(
      (item) =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      {/* ── Header + pencarian ─────────────────────────────── */}
      <Reveal>
        <PageHeader
          eyebrow="Pusat bantuan"
          title="Ada yang bisa kami bantu?"
          description="Cari jawaban cepat di bawah, atau hubungi kami langsung. Kami senang membantu."
        />
      </Reveal>

      <Reveal delay={80}>
        <div className="relative mt-8 max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/40">
            <Icon name="search" size={18} />
          </span>
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pertanyaan, misalnya: subsidi atau pembayaran"
            aria-label="Cari pertanyaan"
            className="pl-11"
          />
        </div>
      </Reveal>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="mt-10">
        {results.length === 0 ? (
          <EmptyState
            icon="search"
            title="Tidak ada hasil"
            description={`Tidak ada pertanyaan yang cocok dengan "${query}". Coba kata kunci lain atau hubungi kami.`}
            action={
              <Button variant="secondary" onClick={() => setQuery("")}>
                Hapus pencarian
              </Button>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-ink/55">
              {query.trim()
                ? `${results.length} pertanyaan cocok dengan pencarianmu`
                : `${results.length} pertanyaan yang sering diajukan`}
            </p>
            <Accordion key={query} items={results} defaultOpen={query.trim() ? null : 0} />
          </>
        )}
      </section>

      {/* ── Panduan ────────────────────────────────────────── */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Panduan singkat"
            title="Langkah demi langkah"
            description="Tiga hal yang paling sering ditanyakan klien baru."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Reveal key={g.title} delay={i * 90}>
              <Card className="flex h-full flex-col p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/70 text-ink">
                  <Icon name={g.icon} size={20} />
                </span>
                <h3 className="mt-4 text-lg leading-tight">{g.title}</h3>
                <p className="mt-2 flex-1 text-sm text-ink/65">{g.text}</p>
                <Link
                  href={g.href}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink transition-colors hover:text-ink-soft"
                >
                  {g.cta}
                  <Icon name="arrowRight" size={15} />
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Kontak ─────────────────────────────────────────── */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Kontak"
            title="Belum terjawab? Hubungi kami"
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.label} delay={i * 90}>
              <div className={CONTACT_CARD}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                  <Icon name={c.icon} size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    {c.label}
                  </p>
                  {c.value ? (
                    c.href ? (
                      <a
                        href={c.href}
                        className="mt-1 block truncate font-serif text-lg leading-tight underline-offset-4 hover:underline"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="mt-1 truncate font-serif text-lg leading-tight">
                        {c.value}
                      </p>
                    )
                  ) : (
                    <p className="mt-1 font-serif text-lg leading-tight text-ink/45">
                      Belum tersedia
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink/55">
                    {c.value ? c.hint : "Belum dikonfigurasi"}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
