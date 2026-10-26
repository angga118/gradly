"use client";

import Link from "next/link";
import { useGradly } from "@/lib/store";
import { FAQ } from "@/lib/mock-data";
import { rupiah, rupiahShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import {
  Avatar,
  Progress,
  Rating,
  SectionHeading,
  Stat,
} from "@/components/ui/misc";
import { Accordion } from "./accordion";
import { PackageCard } from "./package-card";
import { PhotoTile } from "./photo-tile";
import { Reveal } from "./reveal";

const STEPS = [
  {
    icon: "grid",
    title: "Pilih paket",
    text: "Bandingkan paket aktif, lihat harga, fasilitas, dan tanda subsidi.",
  },
  {
    icon: "calendar",
    title: "Isi detail acara",
    text: "Tentukan tanggal, jam, dan lokasi sesi fotomu.",
  },
  {
    icon: "wallet",
    title: "Bayar & unggah bukti",
    text: "Transfer manual, lalu unggah bukti transfer di halaman booking.",
  },
  {
    icon: "check",
    title: "Konfirmasi & sesi",
    text: "Admin memverifikasi, fotografer datang tepat waktu sesuai jadwal.",
  },
] as const;

const SUBSIDY_POINTS = [
  "Pemegang SKTM (Surat Keterangan Tidak Mampu)",
  "Penerima KIP-K (Kartu Indonesia Pintar Kuliah)",
  "Verifikasi selesai maksimal 1×24 jam kerja",
  "Dibiayai kontribusi 5% dari klien reguler",
];

export function Landing() {
  const { packages, portfolio, testimonials, users, stats } = useGradly();

  const fotografer = users.find((u) => u.role === "fotografer");
  const activePackages = packages.filter((p) => p.isActive);
  const harapan = activePackages.find((p) => p.kipkOnly);
  const heroShot = portfolio.find((item) => item.key);
  const featured = [...activePackages]
    .sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)))
    .slice(0, 3);

  const fund = stats.subsidyFund;

  const revenueTotal = stats.monthlyRevenue.reduce(
    (sum, m) => sum + m.reguler + m.subsidi,
    0,
  );

  const statItems = [
    {
      label: "Sesi difoto",
      value:
        fotografer?.sessions != null ? String(fotografer.sessions) : "—",
      hint: "sejak 2025 di Bandung",
      icon: <Icon name="camera" size={18} />,
      tone: "sky" as const,
    },
    {
      label: "Rating rata-rata",
      value:
        fotografer?.rating != null
          ? fotografer.rating.toFixed(1).replace(".", ",")
          : "—",
      hint: "dari klien yang sudah sesi",
      icon: <Icon name="star" size={18} />,
      tone: "butter" as const,
    },
    {
      label: "Dana subsidi tersalurkan",
      value: rupiahShort(fund.distributed),
      hint: "dari kontribusi 5% klien reguler",
      icon: <Icon name="heart" size={18} />,
      tone: "sage" as const,
    },
    {
      label: "Transaksi 6 bulan terakhir",
      value: rupiahShort(revenueTotal),
      hint: "reguler dan subsidi",
      icon: <Icon name="trending" size={18} />,
      tone: "paper" as const,
    },
  ];

  const fundPct = Math.round((fund.available / fund.target) * 100);

  return (
    <div className="overflow-x-clip">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(60% 55% at 12% 0%, rgba(252,230,183,0.75) 0, transparent 60%), radial-gradient(55% 50% at 92% 12%, rgba(216,235,249,0.8) 0, transparent 62%)",
        }}
      >
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-medium text-ink shadow-soft">
              <span className="flex h-2 w-2 rounded-full bg-butter-deep" />
              Program subsidi hingga 60% lebih hemat
            </div>

            <h1 className="mt-6 font-serif text-[2.5rem] leading-[1.04] sm:text-5xl lg:text-[3.75rem]">
              Foto wisuda yang hangat,
              <br className="hidden sm:block" />{" "}
              <span className="italic text-ink-soft">harga yang bersahabat</span>.
            </h1>

            <p className="mt-6 max-w-xl text-base text-ink/70 sm:text-lg">
              Gradly mempertemukanmu dengan fotografer wisuda pilihan di Bandung —
              lengkap dengan program subsidi untuk pemegang SKTM dan penerima KIP-K.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/paket" size="lg">
                Lihat paket
                <Icon name="arrowRight" size={18} />
              </Button>
              <Button href="/subsidi" variant="secondary" size="lg">
                Ajukan subsidi
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink/70">
              <span className="inline-flex items-center gap-2">
                {fotografer?.rating != null ? (
                  <Rating value={fotografer.rating} />
                ) : (
                  <span className="text-ink/50">Belum ada rating</span>
                )}
                <span className="text-ink/50">·</span>
                <span>
                  {fotografer ? `${fotografer.sessions} sesi` : "Belum ada sesi"}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="shield" size={16} className="text-ink/55" />
                Verifikasi ≤ 1×24 jam kerja
              </span>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative mx-auto h-[400px] w-full max-w-[440px] sm:h-[470px]">
              <div
                className="absolute left-1 top-3 h-[76%] w-[68%] -rotate-6 rounded-[1.75rem] bg-butter/70 shadow-soft"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-6 right-0 h-[68%] w-[60%] rotate-6 rounded-[1.75rem] bg-sky/70 shadow-soft"
                aria-hidden="true"
              />

              <div className="absolute left-1/2 top-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 rotate-[-2deg]">
                <PhotoTile
                  tone="sage"
                  fileKey={heroShot?.key}
                  alt={heroShot?.title ?? "Karya fotografer Gradly"}
                  label={heroShot?.title ?? "Senja di Dago"}
                  meta={heroShot?.location ?? "Golden Graduate · Bandung"}
                  className="aspect-[4/5] rounded-[1.75rem] shadow-lift"
                />
              </div>

              {fotografer?.rating != null ? (
                <div className="absolute right-0 top-0 rounded-full border border-ink/10 bg-paper/95 px-3 py-2 shadow-soft">
                  <Rating value={fotografer.rating} />
                </div>
              ) : null}

              {harapan ? (
                <Card className="absolute -bottom-1 left-0 w-[60%] rotate-[-2deg] bg-paper/95 p-4 shadow-lift">
                  <p className="text-[0.7rem] uppercase tracking-[0.14em] text-ink/50">
                    Mulai dari
                  </p>
                  <p className="mt-1 font-serif text-2xl leading-none">
                    {rupiah(harapan.price)}
                  </p>
                  <div className="mt-2">
                    <Chip tone="butter">{harapan.name} · KIP-K</Chip>
                  </div>
                </Card>
              ) : null}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Trust stats ──────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-4 sm:px-6">
        <Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((s) => (
              <Stat
                key={s.label}
                label={s.label}
                value={s.value}
                hint={s.hint}
                icon={s.icon}
                tone={s.tone}
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <SectionHeading
            eyebrow="Cara kerja"
            title="Empat langkah, sesi foto siap"
            description="Dari memilih paket sampai hasil foto dikirim, semuanya jelas dan tanpa langkah yang membingungkan."
          />
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-ink/10 bg-white/60 p-6 transition-colors hover:border-ink/25">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper">
                    <Icon name={step.icon} size={20} />
                  </span>
                  <span className="font-serif text-3xl text-ink/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg leading-tight">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured packages ────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Paket pilihan"
              title="Paket yang paling sering dipesan"
              description="Harga transparan, fasilitas jelas. Paket favorit ditandai supaya kamu tidak bingung memilih."
            />
            <Button href="/paket" variant="secondary" className="shrink-0">
              Lihat semua paket
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((pkg, i) => (
            <Reveal key={pkg.id} delay={i * 90} className="h-full">
              <PackageCard pkg={pkg} className="h-full" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Subsidy highlight ────────────────────────────────── */}
      <section className="relative overflow-hidden bg-butter/50 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-butter-deep/50 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <Chip tone="ink">Program subsidi</Chip>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Harga wisuda bisa{" "}
              <span className="italic">hingga 60% lebih ringan</span>.
            </h2>
            <p className="mt-4 max-w-lg text-base text-ink/70">
              Setiap klien reguler menambahkan kontribusi 5% dari harga paket. Dana itu
              dikumpulkan dan disalurkan sebagai potongan harga untuk pemegang SKTM dan
              penerima KIP-K.
            </p>
            <ul className="mt-6 space-y-3">
              {SUBSIDY_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-ink/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                    <Icon name="check" size={12} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/subsidi" size="lg">
                Ajukan subsidi
              </Button>
              <Button href="/bantuan" variant="secondary" size="lg">
                Pelajari program
              </Button>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <Card className="bg-paper/90 p-6 shadow-lift sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                    Dana subsidi
                  </p>
                  <p className="mt-2 font-serif text-3xl leading-none">
                    {rupiah(fund.available)}
                  </p>
                  <p className="mt-1.5 text-sm text-ink/60">
                    tersedia dari target {rupiahShort(fund.target)}
                  </p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
                  <Icon name="heart" size={22} />
                </span>
              </div>

              <div className="mt-6">
                <Progress value={fund.available} max={fund.target} tone="butter" />
                <div className="mt-2 flex items-center justify-between text-xs text-ink/55">
                  <span>{fundPct}% dari target</span>
                  <span>{rupiahShort(fund.monthlyContribution)} masuk / bulan</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink/10 pt-6">
                <div>
                  <p className="text-xs text-ink/50">Sudah tersalurkan</p>
                  <p className="mt-1 font-serif text-xl">
                    {rupiahShort(fund.distributed)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink/50">Paket KIP-K</p>
                  <p className="mt-1 font-serif text-xl">
                    {harapan ? rupiah(harapan.price) : "Belum tersedia"}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* ── Portfolio preview ────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Portofolio"
              title="Hasil yang bicara sendiri"
              description="Warna hangat, arahan santai, dan momen yang apa adanya — seperti inilah hasil sesi Gradly."
            />
            <Button href="/portofolio" variant="secondary" className="shrink-0">
              Lihat portofolio
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {portfolio.slice(0, 6).map((item, i) => (
            <Reveal key={item.id} delay={i * 70}>
              <PhotoTile
                tone={item.tone as "butter" | "sky" | "sage"}
                fileKey={item.key}
                alt={item.title}
                label={item.title}
                meta={item.location}
                className="aspect-[4/5] rounded-[var(--radius-card)] shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-lift"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="bg-sage/40 py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Kata mereka"
              title="Cerita dari klien yang sudah sesi"
            />
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
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
        </div>
      </section>

      {/* ── FAQ teaser ───────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Bantuan"
              title="Pertanyaan yang sering muncul"
              description="Belum menemukan jawabannya? Semua pertanyaan lengkap ada di halaman bantuan."
            />
            <Button href="/bantuan" variant="secondary" className="mt-6">
              Buka pusat bantuan
              <Icon name="arrowRight" size={16} />
            </Button>
          </Reveal>
          <Reveal delay={120}>
            <Accordion items={FAQ.slice(0, 4)} />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center shadow-lift sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "radial-gradient(50% 60% at 15% 10%, rgba(252,230,183,0.5) 0, transparent 60%), radial-gradient(45% 55% at 88% 90%, rgba(216,235,249,0.45) 0, transparent 60%)",
              }}
              aria-hidden="true"
            />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/60">
                Siap mengabadikan momen?
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-paper sm:text-4xl lg:text-5xl">
                Mulai dari satu langkah kecil, hasilnya untuk selamanya.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base text-paper/70">
                Pilih paketmu hari ini, atau ajukan verifikasi subsidi lebih dulu. Prosesnya
                cepat dan ramah.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Button href="/paket" variant="butter" size="lg">
                  Lihat paket
                  <Icon name="arrowRight" size={18} />
                </Button>
                <Button
                  href="/daftar"
                  variant="secondary"
                  size="lg"
                  className="border-paper/40 text-paper hover:border-paper hover:bg-paper/10"
                >
                  Daftar akun
                </Button>
              </div>
              <p className="mt-6 text-xs text-paper/50">
                Sudah punya akun?{" "}
                <Link href="/masuk" className="underline underline-offset-4 hover:text-paper">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
