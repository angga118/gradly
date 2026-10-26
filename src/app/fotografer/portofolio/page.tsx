"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDate } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { FileDrop, type PickedFile } from "@/components/ui/file-drop";
import { Modal } from "@/components/ui/modal";
import { EmptyState, Rating } from "@/components/ui/misc";
import { Icon, type IconName } from "@/components/ui/icons";
import { PhotoPlaceholder } from "@/components/fotografer/photo-placeholder";
import { ConfirmModal } from "@/components/fotografer/confirm-modal";
import type { PortfolioItem } from "@/lib/types";

const TONES = ["butter", "sky", "sage"];

const HIGHLIGHT_ICONS: Record<string, IconName> = {
  clock: "clock",
  heart: "heart",
  spark: "sparkles",
  sparkles: "sparkles",
  star: "star",
  camera: "camera",
};

export default function PortofolioFotografer() {
  const {
    session,
    portfolio,
    highlights,
    testimonials,
    packages,
    addPortfolio,
    removePortfolio,
  } = useGradly();

  const [year, setYear] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortfolioItem | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [title, setTitle] = useState("");
  const [packageName, setPackageName] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [shotDate, setShotDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mine = useMemo(
    () => portfolio.filter((p) => p.photographerId === session?.id),
    [portfolio, session?.id],
  );
  const myPackages = useMemo(
    () => packages.filter((p) => p.photographerId === session?.id),
    [packages, session?.id],
  );

  const years = useMemo(
    () =>
      Array.from(new Set(mine.map((p) => p.shotDate.slice(0, 4))))
        .filter(Boolean)
        .sort((a, b) => b.localeCompare(a)),
    [mine],
  );

  const filtered = useMemo(
    () => (year === "all" ? mine : mine.filter((p) => p.shotDate.startsWith(year))),
    [mine, year],
  );

  function openUpload() {
    setPicked(null);
    setTitle("");
    setPackageName(myPackages[0]?.name ?? "");
    setClientName("");
    setLocation("");
    setShotDate(new Date().toISOString().slice(0, 10));
    setError(null);
    setFileKey((k) => k + 1);
    setUploadOpen(true);
  }

  async function submit() {
    if (!picked) {
      setError("Pilih foto yang ingin diunggah.");
      return;
    }
    if (!title.trim()) {
      setError("Judul foto wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await addPortfolio({
        title: title.trim(),
        packageName: packageName.trim() || "Sesi bebas",
        clientName: clientName.trim() || "Klien",
        location: location.trim(),
        shotDate: shotDate || new Date().toISOString().slice(0, 10),
        tone: TONES[title.trim().length % TONES.length],
        file: picked.file,
      });
      setUploadOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {mine.length} karya di galeri
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36 shrink-0">
            <Select
              aria-label="Filter tahun"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="all">Semua tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <Button size="sm" onClick={openUpload}>
            <Icon name="upload" size={16} />
            Unggah foto
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="image"
          title="Galeri masih kosong"
          description="Unggah karya terbaikmu untuk menarik perhatian klien."
          action={
            <Button size="sm" onClick={openUpload}>
              <Icon name="upload" size={16} />
              Unggah foto
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <PhotoPlaceholder
                tone={item.tone}
                fileKey={item.key}
                alt={item.title}
                label={item.title}
                className="aspect-[4/3] w-full"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base leading-tight">{item.title}</h3>
                  <button
                    type="button"
                    aria-label={`Hapus ${item.title}`}
                    onClick={() => setDeleteTarget(item)}
                    className="shrink-0 rounded-full p-1.5 text-ink/45 transition-colors hover:bg-danger-soft/50 hover:text-danger"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-ink/55">
                  {item.packageName} · {item.clientName}
                </p>
                <p className="mt-0.5 text-xs text-ink/45">
                  {item.location || "—"} · {formatDate(item.shotDate)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <CardHeader
          title="Yang klien rasakan"
          subtitle="Keunggulan yang membuat sesi terasa nyaman"
        />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {highlights.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl border border-ink/10 bg-white/60 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky/70 text-ink">
                <Icon name={HIGHLIGHT_ICONS[h.icon] ?? "sparkles"} size={18} />
              </span>
              <p className="mt-3 font-serif text-lg">{h.title}</p>
              <p className="mt-1 text-sm text-ink/60">{h.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <CardHeader title="Kata Mereka" subtitle="Testimoni klien setelah sesi" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col rounded-2xl border border-ink/10 bg-white/60 p-5"
            >
              <Icon name="quote" size={22} className="text-ink/25" />
              <blockquote className="mt-3 flex-1 text-sm text-ink/75">
                {t.message}
              </blockquote>
              <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-ink/8 pt-3">
                <span className="truncate text-sm font-medium">
                  {t.clientName}
                </span>
                <Rating value={t.rating} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Card>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        size="lg"
        title="Unggah foto"
        description="Tambahkan karya baru ke galeri portofoliomu."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUploadOpen(false)}
            >
              Batal
            </Button>
            <Button size="sm" onClick={submit} disabled={submitting}>
              {submitting ? "Mengunggah…" : "Unggah"}
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

          <FileDrop
            key={fileKey}
            accept=".jpg,.jpeg,.png"
            maxMb={100}
            label="Tarik foto ke sini atau klik untuk memilih"
            hint="JPG atau PNG · maks. 100 MB"
            onPick={setPicked}
          />

          <Field label="Judul foto" required htmlFor="pf-title">
            <Input
              id="pf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Senja di Dago"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama paket" htmlFor="pf-package">
              <Input
                id="pf-package"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="mis. Golden Graduate"
                list="pf-package-list"
              />
              <datalist id="pf-package-list">
                {myPackages.map((p) => (
                  <option key={p.id} value={p.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Nama klien" htmlFor="pf-client">
              <Input
                id="pf-client"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="mis. Rani P."
              />
            </Field>
            <Field label="Lokasi" htmlFor="pf-location">
              <Input
                id="pf-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="mis. Dago Pakar"
              />
            </Field>
            <Field label="Tanggal pemotretan" htmlFor="pf-date">
              <Input
                id="pf-date"
                type="date"
                value={shotDate}
                onChange={(e) => setShotDate(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removePortfolio(deleteTarget.id)}
        title="Hapus foto"
        message={`Foto "${deleteTarget?.title ?? ""}" akan dihapus dari galeri portofolio.`}
      />
    </div>
  );
}
