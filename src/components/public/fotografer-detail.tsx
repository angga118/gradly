"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Avatar, EmptyState, Rating, SectionHeading } from "@/components/ui/misc";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { PackageCard } from "./package-card";
import { PhotoTile } from "./photo-tile";
import { Reveal } from "./reveal";

export function FotograferDetail({ id }: { id: string }) {
  const { users, portfolio, packages, highlights, testimonials, hydrated } = useGradly();
  const fotografer = users.find((u) => u.id === id && u.role === "fotografer");
  const [year, setYear] = useState("semua");

  const items = useMemo(
    () => portfolio.filter((p) => p.photographerId === id),
    [portfolio, id],
  );

  const years = useMemo(() => {
    const set = new Set(items.map((p) => p.shotDate.slice(0, 4)));
    return ["semua", ...[...set].sort((a, b) => b.localeCompare(a))];
  }, [items]);

  const visible = useMemo(
    () =>
      year === "semua"
        ? items
        : items.filter((p) => p.shotDate.startsWith(year)),
    [items, year],
  );

  const fotograferPackages = useMemo(
    () => packages.filter((p) => p.photographerId === id && p.isActive),
    [packages, id],
  );

  const fotograferHighlights = useMemo(
    () => highlights.filter((h) => h.photographerId === id),
    [highlights, id],
  );

  const fotograferTestimonials = useMemo(
    () => testimonials.filter((t) => t.photographerId === id),
    [testimonials, id],
  );

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16" aria-busy="true">
        <span className="sr-only">Memuat profil fotografer…</span>
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-ink/5" />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-[var(--radius-card)] bg-ink/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!fotografer) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
        <EmptyState
          icon="user"
          title="Fotografer tidak ditemukan"
          description="Profil ini mungkin sudah tidak tersedia atau tautannya salah."
          action={<Button href="/portofolio">Lihat semua fotografer</Button>}
        />
      </div>
    );
  }

  const name = fotografer.name;
  const tags = fotografer.tags ?? [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      {/* ── Profil fotografer ──────────────────────────────── */}
      <Reveal>
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-br from-sage via-sage/60 to-sky/70 sm:h-44">
            <div
              className="absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(81,50,41,0.6) 0, rgba(81,50,41,0.6) 1px, transparent 1px, transparent 16px)",
              }}
              aria-hidden="true"
            />
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <span className="rounded-full border-4 border-paper">
                  <Avatar name={name} size={88} />
                </span>
                <div className="pb-1">
                  <h1 className="font-serif text-2xl leading-tight sm:text-3xl">{name}</h1>
                  <p className="text-sm text-ink/60">
                    {fotografer.studio || "Fotografer"} · {fotografer.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <Rating value={fotografer.rating ?? 0} count={fotografer.sessions} />
                {fotografer.acceptingBookings ? (
                  <Chip tone="sky">Menerima booking</Chip>
                ) : (
                  <Chip tone="outline">Jadwal penuh</Chip>
                )}
              </div>
            </div>

            {fotografer.bio ? (
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/70">
                {fotografer.bio}
              </p>
            ) : null}

            {tags.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Chip key={tag} tone="outline">
                    {tag}
                  </Chip>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3 border-t border-ink/10 pt-5">
              <Button href="#paket">
                Lihat paket
                <Icon name="arrowRight" size={16} />
              </Button>
              <Button href={`/portofolio/${id}/chat`} variant="secondary">
                Tanya dulu
              </Button>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* ── Highlight ──────────────────────────────────────── */}
      {fotograferHighlights.length > 0 ? (
        <section className="mt-14">
          <Reveal>
            <SectionHeading
              eyebrow="Kenapa memilih"
              title="Yang kamu dapat di setiap sesi"
            />
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {fotograferHighlights.map((h, i) => (
              <Reveal key={h.id} delay={i * 90}>
                <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-ink/10 bg-white/60 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky/70 text-ink">
                    <Icon name={h.icon} size={20} />
                  </span>
                  <h3 className="mt-4 text-lg leading-tight">{h.title}</h3>
                  <p className="mt-2 text-sm text-ink/65">{h.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Galeri portofolio ──────────────────────────────── */}
      {items.length > 0 ? (
        <section className="mt-14">
          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Portofolio"
                title="Galeri hasil sesi"
                description="Disaring per tahun supaya mudah melihat perkembangan gaya."
              />
              {years.length > 1 ? (
                <Tabs
                  tabs={years.map((y) => ({
                    value: y,
                    label: y === "semua" ? "Semua" : y,
                  }))}
                  value={year}
                  onChange={setYear}
                  className="shrink-0"
                />
              ) : null}
            </div>
          </Reveal>

          <TabPanel value={year} className="mt-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {visible.map((item, i) => (
                <Reveal key={item.id} delay={i * 60}>
                  <figure>
                    <PhotoTile
                      tone={item.tone as "butter" | "sky" | "sage"}
                      fileKey={item.key}
                      alt={item.title}
                      label={item.title}
                      meta={item.location}
                      className="aspect-[4/5] rounded-[var(--radius-card)] shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift"
                    />
                    <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs text-ink/55">
                      <span className="truncate">{item.packageName}</span>
                      <span className="shrink-0">{formatDate(item.shotDate, { short: true })}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </TabPanel>
        </section>
      ) : null}

      {/* ── Paket ──────────────────────────────────────────── */}
      <section id="paket" className="mt-14 scroll-mt-24">
        <Reveal>
          <SectionHeading
            eyebrow="Paket"
            title={`Paket dari ${name}`}
            description="Pilih paket yang paling pas dengan kebutuhan sesimu."
          />
        </Reveal>
        {fotograferPackages.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon="grid"
              title="Belum ada paket aktif"
              description={`${name} sedang tidak membuka paket. Coba kunjungi lagi nanti.`}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fotograferPackages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 70} className="h-full">
                <PackageCard pkg={pkg} className="h-full" />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ── Kata mereka ────────────────────────────────────── */}
      {fotograferTestimonials.length > 0 ? (
        <section className="mt-16">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Kata mereka"
              title="Cerita dari klien"
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {fotograferTestimonials.map((t, i) => (
              <Reveal key={t.id} delay={i * 90}>
                <Card className="flex h-full flex-col bg-paper/85 p-6">
                  <Icon name="quote" size={26} className="text-ink/20" />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">
                    {t.message}
                  </p>
                  <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                    <Avatar name={t.clientName} size={38} />
                    <div>
                      <p className="text-sm font-medium">{t.clientName}</p>
                      <Rating value={t.rating} size={13} />
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
