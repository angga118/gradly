"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { ChatMessage } from "@/lib/types";
import { useGradly } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { Reveal } from "@/components/public/reveal";
import {
  MessageBubble,
  messageErrorText,
  messageFailure,
  useMessageThread,
  useStickyScroll,
} from "@/components/public/chat-with-photographer";

type Thread = {
  customerId: string;
  customerName: string;
  messages: ChatMessage[];
  last: ChatMessage;
};

export default function PesanView() {
  const { session, hydrated } = useGradly();
  const enabled = hydrated && !!session;
  const { messages, error, loading, refresh } = useMessageThread(
    enabled ? "/api/messages" : null,
    enabled,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const threads = useMemo<Thread[]>(() => {
    const grouped = new Map<string, ChatMessage[]>();
    for (const message of messages) {
      const list = grouped.get(message.customerId);
      if (list) list.push(message);
      else grouped.set(message.customerId, [message]);
    }
    return [...grouped.entries()]
      .map(([customerId, list]) => {
        const ordered = [...list].sort((a, b) =>
          a.createdAt.localeCompare(b.createdAt),
        );
        const last = ordered[ordered.length - 1];
        return {
          customerId,
          customerName: last.customerName,
          messages: ordered,
          last,
        };
      })
      .sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
  }, [messages]);

  const selected =
    threads.find((thread) => thread.customerId === selectedId) ?? threads[0] ?? null;
  const activeId = selected?.customerId ?? null;
  const lastId = selected
    ? (selected.messages[selected.messages.length - 1]?.id ?? "")
    : "";
  const { ref, onScroll } = useStickyScroll(lastId, activeId ?? "");

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!session || !selected || !body || body.length > 1000 || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          photographerId: session.id,
          customerId: selected.customerId,
          body,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw await messageFailure(response, payload, "Balasan gagal dikirim.");
      }
      setDraft("");
      await refresh(true);
    } catch (cause) {
      setSendError(messageErrorText(cause, "Balasan gagal dikirim. Coba lagi."));
    } finally {
      setSending(false);
    }
  }

  const banner = sendError ?? error;

  return (
    <Reveal>
      <div className="space-y-4">
        {banner ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-soft/70 px-4 py-3 text-sm text-danger"
          >
            <Icon name="alert" size={17} className="mt-0.5 shrink-0" />
            <span>{banner}</span>
          </div>
        ) : null}

        {!hydrated ? (
          <Card className="p-10 text-center text-sm text-ink/60">Memuat pesan…</Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <p className="font-medium">Percakapan</p>
                <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/55">
                  {threads.length}
                </span>
              </div>
              <div className="max-h-[640px] overflow-y-auto p-2">
                {loading && threads.length === 0 ? (
                  <p className="p-6 text-center text-sm text-ink/55">Memuat pesan…</p>
                ) : threads.length === 0 ? (
                  <div className="p-3">
                    <EmptyState
                      icon="mail"
                      title="Belum ada pesan"
                      description="Pertanyaan calon klien akan tampil di sini."
                    />
                  </div>
                ) : (
                  <ul className="space-y-1" aria-label="Daftar percakapan">
                    {threads.map((thread) => (
                      <li key={thread.customerId}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(thread.customerId)}
                          aria-current={activeId === thread.customerId ? "true" : undefined}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                            activeId === thread.customerId
                              ? "border-ink/25 bg-ink/5"
                              : "border-transparent hover:bg-ink/5",
                          )}
                        >
                          <Avatar name={thread.customerName} size={40} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium">
                                {thread.customerName}
                              </span>
                              <span className="shrink-0 text-[11px] text-ink/45">
                                {relativeTime(thread.last.createdAt)}
                              </span>
                            </span>
                            <span className="mt-1 block truncate text-xs text-ink/55">
                              {thread.last.senderRole === "photographer" ? "Kamu: " : ""}
                              {thread.last.body}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card className="flex min-h-[560px] flex-col overflow-hidden">
              {selected ? (
                <>
                  <div className="flex items-center gap-3 border-b border-ink/10 bg-gradient-to-br from-white/80 to-sage/20 px-5 py-4">
                    <Avatar name={selected.customerName} size={44} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{selected.customerName}</p>
                      <p className="text-xs text-ink/55">
                        Percakapan · {relativeTime(selected.last.createdAt)}
                      </p>
                    </div>
                    <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-xs text-ink/60 sm:inline-flex">
                      <Icon name="mail" size={14} />
                      {selected.messages.length} pesan
                    </span>
                  </div>

                  <div
                    ref={ref}
                    onScroll={onScroll}
                    role="log"
                    aria-label={`Percakapan dengan ${selected.customerName}`}
                    aria-live="polite"
                    className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
                  >
                    {selected.messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        selfRole="photographer"
                      />
                    ))}
                  </div>

                  <form
                    onSubmit={handleSend}
                    className="border-t border-ink/10 bg-paper/40 px-5 py-4"
                  >
                    <Field
                      label={`Balas ${selected.customerName}`}
                      htmlFor="fotografer-message"
                      hint="Balasan tampil untuk klien dan dihapus otomatis setelah 2 hari."
                    >
                      <Textarea
                        id="fotografer-message"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Tulis balasan untuk klien..."
                        rows={3}
                        maxLength={1000}
                        disabled={!enabled || sending}
                      />
                    </Field>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-ink/50">{draft.length}/1000 karakter</p>
                      <Button type="submit" disabled={!enabled || sending || !draft.trim()}>
                        <Icon name="send" size={16} />
                        {sending ? "Mengirim…" : "Kirim balasan"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center p-6">
                  <EmptyState
                    icon="mail"
                    title="Pilih percakapan"
                    description="Pilih klien di daftar untuk melihat pesan dan membalas."
                  />
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </Reveal>
  );
}
