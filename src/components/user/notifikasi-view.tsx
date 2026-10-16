"use client";

import { useMemo } from "react";
import type { AppNotification } from "@/lib/types";
import { useGradly } from "@/lib/store";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Icon, type IconName } from "@/components/ui/icons";
import { PageIntro } from "./page-intro";

const ICONS: Record<AppNotification["type"], IconName> = {
  subsidi: "shield",
  booking: "camera",
  pembayaran: "wallet",
  sistem: "bell",
};

const BUCKET_ORDER = ["Hari ini", "Kemarin", "Minggu ini", "Lebih lama"] as const;

function bucketOf(iso: string): (typeof BUCKET_ORDER)[number] {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Lebih lama";
  const now = new Date();
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 7) return "Minggu ini";
  return "Lebih lama";
}

export function NotifikasiView() {
  const { session, notifications, markAllRead, markNotificationRead } = useGradly();

  const mine = useMemo(() => {
    if (!session) return [];
    return notifications
      .filter((n) => n.userId === session.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [notifications, session]);

  const unread = mine.filter((n) => !n.readAt).length;

  const groups = useMemo(() => {
    const map = new Map<string, AppNotification[]>();
    for (const n of mine) {
      const key = bucketOf(n.createdAt);
      const list = map.get(key) ?? [];
      list.push(n);
      map.set(key, list);
    }
    return BUCKET_ORDER.filter((b) => map.has(b)).map((b) => ({
      bucket: b,
      items: map.get(b) ?? [],
    }));
  }, [mine]);

  return (
    <div className="mx-auto max-w-[820px] px-4 py-10 sm:px-6">
      <PageIntro
        eyebrow="Akun"
        title="Notifikasi"
        description={
          unread > 0
            ? `${unread} notifikasi belum dibaca.`
            : "Semua notifikasi sudah dibaca."
        }
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            disabled={unread === 0}
          >
            <Icon name="check" size={16} />
            Tandai semua dibaca
          </Button>
        }
      />

      <div className="mt-6">
        {mine.length === 0 ? (
          <EmptyState
            icon="bell"
            title="Belum ada notifikasi"
            description="Kabar soal booking dan verifikasi subsidi akan muncul di sini."
            action={<Button href="/paket">Mulai booking</Button>}
          />
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.bucket}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                  {group.bucket}
                </h2>
                <ul className="space-y-3">
                  {group.items.map((n) => {
                    const unreadItem = !n.readAt;
                    return (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (unreadItem) markNotificationRead(n.id);
                          }}
                          className={cn(
                            "flex w-full gap-4 rounded-[var(--radius-card)] border p-4 text-left transition-colors",
                            unreadItem
                              ? "border-ink/15 bg-sky/45 hover:bg-sky/65"
                              : "border-ink/10 bg-white/55 hover:bg-white/85",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                              unreadItem ? "bg-ink text-paper" : "bg-ink/8 text-ink/70",
                            )}
                          >
                            <Icon name={ICONS[n.type]} size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="font-medium">{n.title}</span>
                              {unreadItem ? (
                                <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                              ) : null}
                            </span>
                            <span className="mt-0.5 block text-sm text-ink/65">{n.body}</span>
                            <span className="mt-1 block text-xs text-ink/45">
                              {relativeTime(n.createdAt)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
