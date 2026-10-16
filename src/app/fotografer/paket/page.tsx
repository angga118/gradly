"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { rupiah } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PackageFormModal } from "@/components/fotografer/package-form-modal";
import { ConfirmModal } from "@/components/fotografer/confirm-modal";
import type { Package } from "@/lib/types";

export default function PaketFotografer() {
  const { session, packages, savePackage, deletePackage } = useGradly();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);

  const mine = useMemo(
    () => packages.filter((p) => p.photographerId === session?.id),
    [packages, session?.id],
  );
  const activeCount = mine.filter((p) => p.isActive).length;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(pkg: Package) {
    setEditing(pkg);
    setFormOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {mine.length} paket · {activeCount} aktif
        </p>
        <Button size="sm" onClick={openCreate}>
          <Icon name="plus" size={16} />
          Tambah paket
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-[var(--radius-card)] border border-butter-deep/50 bg-butter/50 p-4 text-sm text-ink/80">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink/70" />
        <p>
          Paket dengan harga di atas <strong>Rp 1.000.000</strong> tidak bisa
          mengaktifkan harga subsidi. Turunkan harga bila ingin menawarkan tarif
          khusus penerima SKTM/KIP-K.
        </p>
      </div>

      {mine.length === 0 ? (
        <EmptyState
          icon="tag"
          title="Belum ada paket"
          description="Tambahkan paket pertamamu agar klien bisa memesan sesi."
          action={
            <Button size="sm" onClick={openCreate}>
              <Icon name="plus" size={16} />
              Tambah paket
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mine.map((p) => (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg leading-tight">{p.name}</h3>
                {p.popular ? <Chip tone="butter">Populer</Chip> : null}
                {!p.isActive ? <Chip tone="outline">Nonaktif</Chip> : null}
              </div>
              <p className="mt-2 text-sm text-ink/60">{p.description}</p>

              <div className="mt-4">
                <p className="font-serif text-2xl leading-none">
                  {rupiah(p.price)}
                </p>
                {p.subsidyEnabled && p.subsidyPrice ? (
                  <p className="mt-2 text-sm text-ink/60">
                    Subsidi{" "}
                    <span className="font-medium text-ink">
                      {rupiah(p.subsidyPrice)}
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-ink/40">
                    Tidak ada harga subsidi
                  </p>
                )}
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-sm text-ink/70">
                {p.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <Icon
                      name="check"
                      size={16}
                      className="mt-0.5 shrink-0 text-sage-deep"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex gap-2 border-t border-ink/8 pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEdit(p)}
                >
                  <Icon name="edit" size={16} />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger-soft/40"
                  onClick={() => setDeleteTarget(p)}
                >
                  <Icon name="trash" size={16} />
                  Hapus
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PackageFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        photographerId={session?.id ?? ""}
        onSave={savePackage}
      />

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deletePackage(deleteTarget.id)}
        title="Hapus paket"
        message={`Paket "${deleteTarget?.name ?? ""}" akan dihapus permanen dan tidak lagi tampil untuk klien.`}
      />
    </div>
  );
}
