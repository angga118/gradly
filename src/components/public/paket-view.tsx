"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { rupiah } from "@/lib/format";
import { Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/misc";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { PackageCard } from "./package-card";
import { PageHeader } from "./page-header";
import { Reveal } from "./reveal";

type Filter = "semua" | "subsidi" | "murah";
type Sort = "populer" | "termurah" | "termahal";

const FILTERS = [
  { value: "semua", label: "Semua" },
  { value: "subsidi", label: "Bisa subsidi" },
  { value: "murah", label: "Di bawah Rp 1 jt" },
];

const SORTS: { value: Sort; label: string }[] = [
  { value: "populer", label: "Paling populer" },
  { value: "termurah", label: "Harga terendah" },
  { value: "termahal", label: "Harga tertinggi" },
];

export function PaketView() {
  const { packages, users } = useGradly();
  const [filter, setFilter] = useState<Filter>("semua");
  const [sort, setSort] = useState<Sort>("populer");
  const [fotograferId, setFotograferId] = useState("semua");

  const active = useMemo(() => packages.filter((p) => p.isActive), [packages]);
  const fotografer = useMemo(
    () => users.filter((u) => u.role === "fotografer"),
    [users],
  );

  const visible = useMemo(() => {
    let list = active;
    if (filter === "subsidi") list = list.filter((p) => p.subsidyEnabled);
    if (filter === "murah") list = list.filter((p) => p.price < 1_000_000);
    if (fotograferId !== "semua") {
      list = list.filter((p) => p.photographerId === fotograferId);
    }

    return [...list].sort((a, b) => {
      if (sort === "termurah") return a.price - b.price;
      if (sort === "termahal") return b.price - a.price;
      return Number(Boolean(b.popular)) - Number(Boolean(a.popular)) || a.price - b.price;
    });
  }, [active, filter, sort, fotograferId]);

  const cheapest = active.reduce(
    (min, p) => (p.price < min ? p.price : min),
    active[0]?.price ?? 0,
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      <Reveal>
        <PageHeader
          eyebrow="Katalog"
          title="Pilih paket sesi fotomu"
          description={`Semua paket aktif dari fotografer, lengkap dengan fasilitas dan tanda subsidi. Harga mulai ${rupiah(cheapest)}.`}
        />
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-8 flex flex-col gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            tabs={FILTERS}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            className="w-full sm:w-auto"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <Icon name="user" size={16} className="text-ink/50" />
              <span className="sr-only sm:not-sr-only">Fotografer</span>
              <Select
                value={fotograferId}
                onChange={(e) => setFotograferId(e.target.value)}
                aria-label="Saring paket per fotografer"
                className="w-full sm:w-52"
              >
                <option value="semua">Semua fotografer</option>
                {fotografer.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <Icon name="filter" size={16} className="text-ink/50" />
              <span className="sr-only sm:not-sr-only">Urutkan</span>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="w-full sm:w-48"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>
      </Reveal>

      <TabPanel value={filter} className="mt-10">
        {visible.length === 0 ? (
          <EmptyState
            icon="grid"
            title="Belum ada paket yang cocok"
            description="Coba ubah filter atau urutkan ulang untuk melihat paket lain."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 70} className="h-full">
                <PackageCard pkg={pkg} className="h-full" />
              </Reveal>
            ))}
          </div>
        )}
      </TabPanel>

      <Reveal>
        <div className="mt-12 flex items-start gap-3 rounded-[var(--radius-card)] border border-ink/10 bg-butter/40 p-5 text-sm text-ink/75">
          <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/60" />
          <p>
            Paket dengan harga di atas <strong>Rp 1 juta</strong> tidak ikut program
            subsidi. Untuk harga subsidi, ajukan verifikasi SKTM atau KIP-K lebih dulu
            lewat halaman{" "}
            <Link href="/subsidi" className="font-medium underline underline-offset-4">
              Program Subsidi
            </Link>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
}
