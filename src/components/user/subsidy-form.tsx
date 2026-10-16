"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import type { DocType, SubsidyApplication } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FileDrop, type PickedFile } from "@/components/ui/file-drop";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { Reveal } from "./reveal";

export function SubsidyForm() {
  const { session, subsidyApplications, submitSubsidy } = useGradly();

  const [docType, setDocType] = useState<DocType>("SKTM");
  const [file, setFile] = useState<PickedFile | null>(null);
  const [kelurahan, setKelurahan] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{
    docType?: string;
    file?: string;
    kelurahan?: string;
    address?: string;
  }>({});
  const [created, setCreated] = useState<SubsidyApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setFormError] = useState<string | null>(null);

  const active = useMemo(() => {
    if (!session) return undefined;
    return subsidyApplications.find(
      (a) =>
        a.userId === session.id &&
        (a.status === "Menunggu review" || a.status === "Terverifikasi"),
    );
  }, [subsidyApplications, session]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!file) next.file = "Unggah dokumen SKTM atau KIP-K.";
    if (!kelurahan.trim()) next.kelurahan = "Kelurahan wajib diisi.";
    if (!address.trim()) next.address = "Alamat wajib diisi.";
    setErrors(next);
    if (Object.keys(next).length > 0 || !file) return;

    setFormError(null);
    setSubmitting(true);
    try {
      const app = await submitSubsidy({
        docType,
        kelurahan: kelurahan.trim(),
        address: address.trim(),
        file: file.file,
      });
      setCreated(app);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal mengirim ajuan.");
    } finally {
      setSubmitting(false);
    }
  }

  const header = (
    <PageIntro
      eyebrow="Subsidi"
      title="Ajukan verifikasi subsidi"
      description="Unggah SKTM atau KIP-K untuk memakai harga subsidi. Verifikasi selesai maksimal 1×24 jam kerja."
      backHref="/subsidi"
      backLabel="Kembali ke program subsidi"
    />
  );

  if (created) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        {header}
        <Reveal className="mt-8">
          <Card className="overflow-hidden bg-sky/40 p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                <Icon name="check" size={22} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                  Ajuan terkirim
                </p>
                <h2 className="mt-1 font-serif text-2xl">Terima kasih!</h2>
                <p className="mt-1 font-mono text-sm">{created.id}</p>
                <p className="mt-3 text-sm text-ink/70">
                  Ajuanmu sedang ditinjau admin. Hasil verifikasi dikabari maksimal 1×24
                  jam kerja lewat email dan notifikasi. Setelah terverifikasi, kamu bisa
                  memakai harga subsidi saat booking.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/profil/dokumen" size="sm">
                    Lihat dokumen saya
                  </Button>
                  <Button href="/paket" variant="secondary" size="sm">
                    Lihat paket
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    );
  }

  if (active) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
        {header}
        <Reveal className="mt-8">
          <Card
            className={
              active.status === "Terverifikasi" ? "bg-sky/40 p-6" : "bg-butter/40 p-6"
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
                  <Icon name={active.status === "Terverifikasi" ? "shield" : "clock"} size={22} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink/50">
                    Status ajuan
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="font-serif text-xl">
                      {active.status === "Terverifikasi"
                        ? "Sudah terverifikasi"
                        : "Sedang ditinjau"}
                    </p>
                    <StatusChip status={active.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-ink/55">{active.id}</p>
                  <p className="mt-3 max-w-md text-sm text-ink/70">
                    {active.status === "Terverifikasi"
                      ? session?.subsidyValidUntil
                        ? `Harga subsidi bisa dipakai sampai ${formatDate(session.subsidyValidUntil)}.`
                        : "Harga subsidi sudah bisa kamu pakai saat booking."
                      : "Hasil verifikasi dikabari maksimal 1×24 jam kerja lewat email dan notifikasi."}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button href="/profil/dokumen" variant="secondary" size="sm">
                Lihat dokumen
              </Button>
              {active.status === "Terverifikasi" ? (
                <Button href="/paket" size="sm">
                  Pilih paket subsidi
                </Button>
              ) : null}
            </div>
          </Card>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[720px] px-4 py-10 sm:px-6">
      {header}

      <Reveal className="mt-8">
        <Card className="p-6">
          <form onSubmit={onSubmit} noValidate className="space-y-5">
            <Field
              label="Jenis dokumen"
              required
              htmlFor="docType"
              hint="Pilih dokumen yang kamu punya. Keduanya sama-sama sah."
            >
              <Select
                id="docType"
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
              >
                <option value="SKTM">SKTM (Surat Keterangan Tidak Mampu)</option>
                <option value="KIP-K">KIP-K (Kartu Indonesia Pintar Kuliah)</option>
              </Select>
            </Field>

            <div>
              <p className="mb-1.5 block text-sm font-medium text-ink">
                Berkas dokumen <span className="text-danger">*</span>
              </p>
              <FileDrop
                label="Unggah SKTM atau KIP-K"
                onPick={(f) => {
                  setFile(f);
                  if (f) setErrors((prev) => ({ ...prev, file: undefined }));
                }}
              />
              {errors.file ? (
                <p className="mt-1 text-xs text-danger">{errors.file}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/55">
                  Pastikan seluruh halaman terbaca jelas. Data disimpan privat.
                </p>
              )}
            </div>

            <Field label="Kelurahan" required htmlFor="kelurahan" error={errors.kelurahan}>
              <Input
                id="kelurahan"
                value={kelurahan}
                onChange={(e) => {
                  setKelurahan(e.target.value);
                  setErrors((prev) => ({ ...prev, kelurahan: undefined }));
                }}
                placeholder="Contoh: Dago"
              />
            </Field>

            <Field label="Alamat lengkap" required htmlFor="address" error={errors.address}>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="Contoh: Jl. Cihampelas No. 88, Bandung"
              />
            </Field>

            <div className="flex items-start gap-2 rounded-2xl bg-sage/40 p-4 text-xs text-ink/70">
              <Icon name="info" size={16} className="mt-0.5 shrink-0" />
              Dokumen SKTM/KIP-K dan bukti transfer disimpan di penyimpanan privat. Hanya
              kamu dan admin yang bisa membukanya, sesuai UU PDP.
            </div>

            {submitError ? (
              <p className="flex items-center gap-2 rounded-2xl bg-danger-soft/60 px-4 py-3 text-sm text-danger">
                <Icon name="alert" size={16} />
                {submitError}
              </p>
            ) : null}

            <div className="border-t border-ink/10 pt-5">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Mengirim…" : "Kirim ajuan verifikasi"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip tone="butter">Verifikasi ≤ 1×24 jam kerja</Chip>
          <Chip tone="outline">JPG, PNG, PDF · maks. 5 MB</Chip>
        </div>
      </Reveal>
    </div>
  );
}
