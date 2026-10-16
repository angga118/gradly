"use client";

import { useMemo } from "react";
import { useGradly } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";
import { AccountNav } from "./account-nav";

export function DokumenView() {
  const { session, subsidyApplications } = useGradly();

  const mine = useMemo(() => {
    if (!session) return [];
    return subsidyApplications
      .filter((a) => a.userId === session.id)
      .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }, [subsidyApplications, session]);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6">
      <PageIntro
        eyebrow="Akun"
        title="Dokumen SKTM"
        description="Riwayat ajuan verifikasi SKTM atau KIP-K yang kamu kirim ke admin."
        actions={
          <Button href="/subsidi/ajukan" size="sm">
            <Icon name="plus" size={16} />
            Ajukan baru
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr] md:items-start">
        <AccountNav className="md:sticky md:top-24" />

        <div className="space-y-4">
          {mine.length === 0 ? (
            <EmptyState
              icon="file"
              title="Belum ada dokumen"
              description="Unggah SKTM atau KIP-K untuk mengajukan harga subsidi."
              action={<Button href="/subsidi/ajukan">Ajukan verifikasi</Button>}
            />
          ) : (
            <ul className="space-y-4">
              {mine.map((app) => (
                <Card as="li" key={app.id} className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky/70 text-ink">
                        <Icon name="file" size={20} />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{app.docName}</p>
                          <Chip tone="outline">{app.docType}</Chip>
                        </div>
                        <p className="mt-1 font-mono text-xs text-ink/55">{app.id}</p>
                      </div>
                    </div>
                    <StatusChip status={app.status} />
                  </div>

                  <dl className="mt-5 grid gap-4 border-t border-ink/10 pt-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                        Kelurahan
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{app.kelurahan}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                        Alamat
                      </dt>
                      <dd className="mt-1 text-sm font-medium">{app.address}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                        Diajukan
                      </dt>
                      <dd className="mt-1 text-sm">{formatDateTime(app.submittedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.14em] text-ink/50">
                        Ditinjau
                      </dt>
                      <dd className="mt-1 text-sm">
                        {app.reviewedAt
                          ? `${formatDateTime(app.reviewedAt)}${
                              app.reviewedBy ? ` · ${app.reviewedBy}` : ""
                            }`
                          : "Belum ditinjau"}
                      </dd>
                    </div>
                  </dl>

                  {app.status === "Ditolak" && app.rejectReason ? (
                    <div className="mt-4 flex gap-2 rounded-2xl bg-danger-soft/60 p-4 text-sm text-danger">
                      <Icon name="alert" size={16} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">Alasan penolakan</p>
                        <p className="mt-0.5 text-danger/90">{app.rejectReason}</p>
                      </div>
                    </div>
                  ) : null}

                  {app.status === "Menunggu review" ? (
                    <p className="mt-4 flex items-center gap-2 rounded-2xl bg-butter/50 p-4 text-xs text-ink/70">
                      <Icon name="clock" size={16} className="shrink-0" />
                      Hasil verifikasi dikabari maksimal 1×24 jam kerja lewat email dan
                      notifikasi.
                    </p>
                  ) : null}

                  {app.status === "Ditolak" ? (
                    <div className="mt-4">
                      <Button href="/subsidi/ajukan" size="sm" variant="secondary">
                        Ajukan ulang
                      </Button>
                    </div>
                  ) : null}
                </Card>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
