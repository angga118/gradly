"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icons";
import { FilePreview } from "@/components/ui/file-preview";
import { formatDateTime } from "@/lib/format";
import type { SubsidyApplication } from "@/lib/types";

export function DocumentPreviewModal({
  application,
  onClose,
}: {
  application: SubsidyApplication | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!application}
      onClose={onClose}
      title="Pratinjau dokumen"
      description={
        application
          ? `${application.docType} · ${application.userName}`
          : undefined
      }
      size="lg"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Tutup
        </Button>
      }
    >
      {application ? (
        <div className="space-y-4">
          <FilePreview
            fileKey={application.docKey}
            name={application.docName}
          />

          <div className="flex flex-wrap gap-2">
            <Chip tone="butter">{application.docType}</Chip>
            <Chip tone="outline">Kelurahan {application.kelurahan}</Chip>
            <Chip tone="outline">
              Dikirim {formatDateTime(application.submittedAt)}
            </Chip>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white/50 p-4 text-sm text-ink/70">
            <Icon name="lock" size={18} className="mt-0.5 shrink-0 text-ink/50" />
            <p>
              Dokumen ini memuat data pribadi. Pastikan hanya digunakan untuk
              keperluan verifikasi subsidi dan tidak dibagikan ke pihak lain.
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function RejectSubsidyModal({
  application,
  onClose,
  onConfirm,
}: {
  application: SubsidyApplication;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = reason.trim().length >= 5;

  return (
    <Modal
      open
      onClose={onClose}
      title="Tolak pengajuan subsidi"
      description={`${application.userName} · ${application.docType}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!valid}
            onClick={() => {
              if (!valid) return;
              onConfirm(application.id, reason.trim());
              onClose();
            }}
          >
            <Icon name="x" size={16} />
            Tolak pengajuan
          </Button>
        </>
      }
    >
      <Field
        label="Alasan penolakan"
        required
        htmlFor="reject-reason"
        error={
          touched && !valid
            ? "Tulis alasan minimal 5 karakter agar pengaju paham."
            : undefined
        }
        hint="Alasan ini dikirim ke pengaju lewat notifikasi."
      >
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Contoh: Dokumen tidak terbaca, mohon unggah ulang dengan foto yang lebih jelas."
        />
      </Field>
    </Modal>
  );
}
