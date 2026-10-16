"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icons";
import { Toggle } from "./toggle";
import type { Package } from "@/lib/types";

const SUBSIDY_LIMIT = 1_000_000;

function newPackageId() {
  return `pk_${Math.random().toString(36).slice(2, 10)}`;
}

export function PackageFormModal({
  open,
  onClose,
  initial,
  photographerId,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Package | null;
  photographerId: string;
  onSave: (pkg: Package) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [subsidyPrice, setSubsidyPrice] = useState("");
  const [subsidyEnabled, setSubsidyEnabled] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setPrice(initial ? String(initial.price) : "");
    setSubsidyPrice(
      initial?.subsidyPrice != null ? String(initial.subsidyPrice) : "",
    );
    setSubsidyEnabled(initial?.subsidyEnabled ?? false);
    setFeatures(initial && initial.features.length ? initial.features : [""]);
    setIsActive(initial?.isActive ?? true);
    setError(null);
  }, [open, initial]);

  const priceNum = Number(price) || 0;
  const subsidyBlocked = priceNum > SUBSIDY_LIMIT;

  useEffect(() => {
    if (subsidyBlocked) setSubsidyEnabled(false);
  }, [subsidyBlocked]);

  function submit() {
    if (!name.trim()) {
      setError("Nama paket wajib diisi.");
      return;
    }
    if (priceNum <= 0) {
      setError("Harga paket harus lebih dari 0.");
      return;
    }
    const subsidyNum = Number(subsidyPrice) || 0;
    if (subsidyEnabled) {
      if (subsidyNum <= 0) {
        setError("Isi harga subsidi bila subsidi diaktifkan.");
        return;
      }
      if (subsidyNum > priceNum) {
        setError("Harga subsidi tidak boleh melebihi harga normal.");
        return;
      }
    }

    onSave({
      id: initial?.id ?? newPackageId(),
      photographerId,
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      subsidyPrice: subsidyEnabled ? subsidyNum : null,
      subsidyEnabled,
      features: features.map((f) => f.trim()).filter(Boolean),
      isActive,
      popular: initial?.popular,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? "Edit paket" : "Tambah paket"}
      description={
        initial
          ? `Perbarui detail paket ${initial.name}.`
          : "Susun paket baru untuk klienmu."
      }
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button size="sm" onClick={submit}>
            {initial ? "Simpan perubahan" : "Tambah paket"}
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

        <Field label="Nama paket" required htmlFor="pkg-name">
          <Input
            id="pkg-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="mis. Golden Graduate"
          />
        </Field>

        <Field label="Deskripsi" htmlFor="pkg-desc">
          <Textarea
            id="pkg-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan singkat isi dan suasana paket."
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Harga paket (Rp)" required htmlFor="pkg-price">
            <Input
              id="pkg-price"
              type="number"
              min={0}
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field
            label="Harga subsidi (Rp)"
            htmlFor="pkg-subsidy"
            hint={subsidyEnabled ? "Harga khusus penerima SKTM/KIP-K." : undefined}
          >
            <Input
              id="pkg-subsidy"
              type="number"
              min={0}
              inputMode="numeric"
              value={subsidyPrice}
              disabled={!subsidyEnabled}
              onChange={(e) => setSubsidyPrice(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>

        <Toggle
          checked={subsidyEnabled}
          disabled={subsidyBlocked}
          onChange={setSubsidyEnabled}
          title="Aktifkan harga subsidi"
          description={
            subsidyBlocked
              ? "Paket di atas Rp 1.000.000 tidak bisa disubsidi."
              : "Paket maksimal Rp 1.000.000 bisa ditawarkan dengan harga subsidi."
          }
        />

        <Field label="Fitur paket">
          <div className="space-y-2">
            {features.map((f, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={f}
                  onChange={(e) =>
                    setFeatures((prev) =>
                      prev.map((p, idx) => (idx === i ? e.target.value : p)),
                    )
                  }
                  placeholder="mis. Sesi 2 jam, 2 lokasi"
                />
                <button
                  type="button"
                  aria-label="Hapus fitur"
                  disabled={features.length === 1}
                  onClick={() =>
                    setFeatures((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/15 text-ink/60 transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-40"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFeatures((prev) => [...prev, ""])}
            >
              <Icon name="plus" size={16} />
              Tambah fitur
            </Button>
          </div>
        </Field>

        <Toggle
          checked={isActive}
          onChange={setIsActive}
          title="Paket aktif"
          description="Paket aktif tampil di halaman fotografermu."
        />
      </div>
    </Modal>
  );
}
