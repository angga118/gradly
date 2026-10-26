"use client";

import { useMemo, useState } from "react";
import { useGradly } from "@/lib/store";
import { formatDateTime, relativeTime } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { StatusChip } from "@/components/ui/status-chip";
import { Icon } from "@/components/ui/icons";
import {
  DocumentPreviewModal,
  RejectSubsidyModal,
} from "@/components/admin/subsidy-modals";
import type { SubsidyApplication, SubsidyStatus } from "@/lib/types";

const TAB_STATUS: Record<string, SubsidyStatus> = {
  pending: "Menunggu review",
  verified: "Terverifikasi",
  rejected: "Ditolak",
};

export default function AdminVerifikasi() {
  const { subsidyApplications, reviewSubsidy } = useGradly();
  const [tab, setTab] = useState("pending");
  const [preview, setPreview] = useState<SubsidyApplication | null>(null);
  const [rejecting, setRejecting] = useState<SubsidyApplication | null>(null);

  const counts = useMemo(
    () => ({
      pending: subsidyApplications.filter(
        (a) => a.status === "Menunggu review",
      ).length,
      verified: subsidyApplications.filter((a) => a.status === "Terverifikasi")
        .length,
      rejected: subsidyApplications.filter((a) => a.status === "Ditolak").length,
    }),
    [subsidyApplications],
  );

  const list = useMemo(
    () =>
      subsidyApplications
        .filter((a) => a.status === TAB_STATUS[tab])
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [subsidyApplications, tab],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: "pending", label: "Menunggu review", count: counts.pending },
            { value: "verified", label: "Terverifikasi", count: counts.verified },
            { value: "rejected", label: "Ditolak", count: counts.rejected },
          ]}
        />
        {counts.pending > 0 ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-xs font-medium text-ink">
            <Icon name="shield" size={14} />
            {counts.pending} pengajuan menunggu
          </span>
        ) : null}
      </div>

      <TabPanel value={tab}>
        {list.length === 0 ? (
          <EmptyState
            icon="shield"
            title={
              tab === "pending"
                ? "Tidak ada pengajuan menunggu"
                : tab === "verified"
                  ? "Belum ada pengajuan terverifikasi"
                  : "Belum ada pengajuan ditolak"
            }
            description={
              tab === "pending"
                ? "Semua pengajuan subsidi sudah ditinjau. Kerja bagus."
                : "Pengajuan dengan status ini akan muncul di sini."
            }
          />
        ) : (
          <ul className="space-y-4">
            {list.map((app) => (
              <li key={app.id}>
                <Card className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <Avatar name={app.userName} size={44} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{app.userName}</p>
                          <StatusChip status={app.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-ink/50">{app.id}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Chip tone={app.docType === "KIP-K" ? "sky" : "sage"}>
                            {app.docType}
                          </Chip>
                          <Chip tone="outline">
                            Kelurahan {app.kelurahan}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-xs uppercase tracking-wide text-ink/45">
                        Dikirim
                      </p>
                      <p className="text-sm text-ink/70">
                        {relativeTime(app.submittedAt)}
                      </p>
                      <p className="text-xs text-ink/45">
                        {formatDateTime(app.submittedAt)}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-4 grid gap-3 rounded-xl border border-ink/10 bg-white/50 p-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-ink/50">Alamat</dt>
                      <dd className="mt-0.5 text-sm">{app.address}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-ink/50">Dokumen</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 text-sm">
                        <Icon name="file" size={15} className="text-ink/50" />
                        <span className="truncate">{app.docName}</span>
                      </dd>
                    </div>
                  </dl>

                  {app.status === "Ditolak" && app.rejectReason ? (
                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-danger-soft bg-danger-soft/40 p-4 text-sm text-ink/80">
                      <Icon
                        name="alert"
                        size={18}
                        className="mt-0.5 shrink-0 text-danger"
                      />
                      <div>
                        <p className="font-medium text-danger">
                          Alasan penolakan
                        </p>
                        <p className="mt-0.5">{app.rejectReason}</p>
                      </div>
                    </div>
                  ) : null}

                  {app.status === "Terverifikasi" ? (
                    <p className="mt-4 text-xs text-ink/50">
                      Diverifikasi oleh {app.reviewedBy ?? "Admin"}
                      {app.reviewedAt
                        ? ` · ${formatDateTime(app.reviewedAt)}`
                        : ""}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPreview(app)}
                    >
                      <Icon name="eye" size={16} />
                      Pratinjau dokumen
                    </Button>
                    {app.status === "Menunggu review" ? (
                      <>
                        <Button
                          variant="butter"
                          size="sm"
                          onClick={() =>
                            reviewSubsidy(app.id, "Terverifikasi")
                          }
                        >
                          <Icon name="check" size={16} />
                          Setujui
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setRejecting(app)}
                        >
                          <Icon name="x" size={16} />
                          Tolak
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </TabPanel>

      <DocumentPreviewModal
        application={preview}
        onClose={() => setPreview(null)}
      />
      {rejecting ? (
        <RejectSubsidyModal
          application={rejecting}
          onClose={() => setRejecting(null)}
          onConfirm={(id, reason) => reviewSubsidy(id, "Ditolak", reason)}
        />
      ) : null}
    </div>
  );
}
