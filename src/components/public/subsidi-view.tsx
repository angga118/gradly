"use client";

import { FAQ } from "@/lib/mock-data";
import { useGradly } from "@/lib/store";
import { cn } from "@/lib/cn";
import { rupiah, rupiahShort } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { Progress, SectionHeading } from "@/components/ui/misc";
import { Accordion } from "./accordion";
import { Reveal } from "./reveal";

const QUALIFY = [
  {
    icon: "file" as const,
    title: "Pemegang SKTM",
    text: "Surat Keterangan Tidak Mampu dari kelurahan setempat, berlaku sesuai masa berlakunya.",
    tone: "sky" as const,
  },
  {
    icon: "graduation" as const,
    title: "Penerima KIP-K",
    text: "Kartu Indonesia Pintar Kuliah aktif milikmu, atau surat keterangan penerima KIP-K.",
    tone: "butter" as const,
  },
];

const FLOW = [
  {
    icon: "wallet" as const,
    title: "Klien reguler menambah 5%",
    text: "Setiap booking reguler menambahkan kontribusi 5% dari harga paket ke dana subsidi.",
  },
  {
    icon: "heart" as const,
    title: "Dana terkumpul & terkelola",
    text: "Dana dicatat transparan di buku besar dan dilaporkan tiap bulan.",
  },
  {
    icon: "tag" as const,
    title: "Disalurkan sebagai potongan",
    text: "Dana dipakai menutup selisih harga paket subsidi untuk klien yang terverifikasi.",
  },
];

export function SubsidiView() {
  const { stats, packages } = useGradly();
  const fund = stats.subsidyFund;
  const fundPct = Math.round((fund.available / fund.target) * 100);
  const harapan = packages.find((p) => p.kipkOnly);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      {/* ── Hero ───────────────────────────────────────────── */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-butter/60 px-6 py-12 sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-butter-deep/50 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <Chip tone="ink">Program subsidi Gradly</Chip>
            <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Foto wisuda layak untuk semua, bukan cuma yang mampu.
            </h1>
            <p className="mt-5 text-base text-ink/70 sm:text-lg">
              Lewat dana yang dikumpulkan dari klien reguler, pemegang SKTM dan penerima
              KIP-K bisa menikmati sesi foto dengan harga hingga 60% lebih ringan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/subsidi/ajukan" size="lg">
                Ajukan verifikasi
                <Icon name="arrowRight" size={18} />
              </Button>
              <Button href="/paket" variant="secondary" size="lg">
                Lihat paket subsidi
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Chip tone="outline">Verifikasi ≤ 1×24 jam kerja</Chip>
              <Chip tone="outline">Data dokumen privat</Chip>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Siapa yang berhak ──────────────────────────────── */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Siapa yang berhak"
            title="Dua dokumen, satu tujuan"
            description="Cukup salah satu dokumen berikut untuk mengajukan harga subsidi."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {QUALIFY.map((q, i) => (
            <Reveal key={q.title} delay={i * 90}>
              <Card className="flex h-full items-start gap-4 p-6">
                <span
                  className={
                    q.tone === "sky"
                      ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky text-ink"
                      : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-butter text-ink"
                  }
                >
                  <Icon name={q.icon} size={22} />
                </span>
                <div>
                  <h3 className="text-lg leading-tight">{q.title}</h3>
                  <p className="mt-2 text-sm text-ink/65">{q.text}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Cara kerja dana ────────────────────────────────── */}
      <section className="mt-16">
        <Reveal>
          <SectionHeading
            eyebrow="Cara kerja dana"
            title="Dari klien reguler, untuk yang membutuhkan"
            description="Dana subsidi tidak datang dari mana-mana. Ia tumbuh dari solidaritas antar klien."
          />
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FLOW.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-ink/10 bg-white/60 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-paper">
                    <Icon name={f.icon} size={20} />
                  </span>
                  <span className="font-serif text-3xl text-ink/15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 text-lg leading-tight">{f.title}</h3>
                <p className="mt-2 text-sm text-ink/65">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Dana + Paket Harapan ───────────────────────────── */}
      <section
        className={cn(
          "mt-16 grid gap-6",
          harapan ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-1",
        )}
      >
        <Reveal>
          <Card className="h-full p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink/50">
                  Dana subsidi saat ini
                </p>
                <p className="mt-2 font-serif text-4xl leading-none">
                  {rupiah(fund.available)}
                </p>
                <p className="mt-2 text-sm text-ink/60">
                  dari target {rupiahShort(fund.target)}
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
                <Icon name="heart" size={22} />
              </span>
            </div>

            <div className="mt-6">
              <Progress
                value={fund.available}
                max={fund.target}
                tone="butter"
              />
              <div className="mt-2 flex items-center justify-between text-xs text-ink/55">
                <span>{fundPct}% dari target</span>
                <span>{rupiahShort(fund.monthlyContribution)} masuk / bulan</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/10 pt-6">
              <div>
                <p className="text-xs text-ink/50">Sudah tersalurkan</p>
                <p className="mt-1 font-serif text-2xl">
                  {rupiahShort(fund.distributed)}
                </p>
                <p className="mt-1 text-xs text-ink/55">ke penerima terverifikasi</p>
              </div>
              <div>
                <p className="text-xs text-ink/50">Kontribusi per booking</p>
                <p className="mt-1 font-serif text-2xl">5%</p>
                <p className="mt-1 text-xs text-ink/55">dari harga paket reguler</p>
              </div>
            </div>
          </Card>
        </Reveal>

        {harapan ? (
          <Reveal delay={120}>
            <Card className="flex h-full flex-col bg-ink p-6 text-paper sm:p-8">
              <Chip tone="butter" className="self-start">
                Paket unggulan
              </Chip>
              <h3 className="mt-4 font-serif text-3xl leading-tight text-paper">
                {harapan.name}
              </h3>
              <p className="mt-3 text-sm text-paper/70">{harapan.description}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-serif text-4xl leading-none text-paper">
                  {rupiah(harapan.price)}
                </span>
                <span className="pb-1 text-xs text-paper/60">/ sesi</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm text-paper/80">
                {harapan.features.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-butter text-ink">
                      <Icon name="check" size={11} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Button href="/subsidi/ajukan" variant="butter" className="w-full">
                  Ajukan verifikasi dulu
                </Button>
              </div>
            </Card>
          </Reveal>
        ) : null}
      </section>

      {/* ── Verifikasi ─────────────────────────────────────── */}
      <section className="mt-16">
        <Reveal>
          <div className="flex flex-col items-start gap-5 rounded-[var(--radius-card)] border border-ink/10 bg-sky/40 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
              <Icon name="shield" size={26} />
            </span>
            <div className="flex-1">
              <h3 className="text-xl leading-tight">Verifikasi cepat, maksimal 1×24 jam kerja</h3>
              <p className="mt-2 text-sm text-ink/70">
                Unggah SKTM atau KIP-K, isi kelurahan dan alamat, lalu kirim. Admin meninjau
                dan mengabari hasilnya lewat email serta notifikasi. Dokumen disimpan privat
                sesuai UU PDP.
              </p>
            </div>
            <Button href="/subsidi/ajukan" className="shrink-0">
              Mulai ajukan
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            eyebrow="Tanya jawab"
            title="Hal yang sering ditanyakan soal subsidi"
            description="Masih ragu? Halaman bantuan memuat pertanyaan lain seputar booking dan pembayaran."
          />
          <Button href="/bantuan" variant="secondary" className="mt-6">
            Buka pusat bantuan
            <Icon name="arrowRight" size={16} />
          </Button>
        </Reveal>
        <Reveal delay={120}>
          <Accordion items={FAQ.slice(0, 4)} />
        </Reveal>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <Reveal>
        <div className="mt-16 flex flex-col items-center gap-4 rounded-[2rem] border border-ink/10 bg-white/60 px-6 py-12 text-center">
          <h2 className="max-w-xl font-serif text-3xl leading-tight sm:text-4xl">
            Siap memakai harga subsidi?
          </h2>
          <p className="max-w-lg text-sm text-ink/65">
            Ajukan verifikasi sekarang. Setelah disetujui, harga subsidi langsung bisa
            dipakai saat booking.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button href="/subsidi/ajukan" size="lg">
              Ajukan verifikasi
            </Button>
            <Button href="/masuk" variant="secondary" size="lg">
              Masuk ke akun
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
