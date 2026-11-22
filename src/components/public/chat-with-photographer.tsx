"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { ChatMessage } from "@/lib/types";
import { useGradly } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/field";
import { Avatar } from "@/components/ui/misc";
import { Icon } from "@/components/ui/icons";
import { PageHeader } from "./page-header";
import { Reveal } from "./reveal";

type SenderRole = ChatMessage["senderRole"];

const POLL_INTERVAL = 2000;
const NEAR_BOTTOM_PX = 96;

class MessageRequestError extends Error {
  readonly userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "MessageRequestError";
    this.userMessage = userMessage;
  }
}

function parseRetryAfter(response: Response): number | null {
  const raw = response.headers.get("retry-after");
  if (!raw) return null;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds));
  const when = Date.parse(raw);
  if (!Number.isNaN(when)) return Math.max(0, Math.ceil((when - Date.now()) / 1000));
  return null;
}

function serverMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as { error?: unknown; message?: unknown };
  const text = typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : "";
  return text.trim() || null;
}

export async function messageFailure(
  response: Response,
  payload: unknown,
  fallback: string,
): Promise<MessageRequestError> {
  if (response.status === 429) {
    const retryAfter = parseRetryAfter(response);
    const hint = retryAfter === null
      ? "tunggu sebentar sebelum mencoba lagi"
      : `coba lagi dalam ${retryAfter} detik`;
    return new MessageRequestError(`Terlalu banyak permintaan. Retry-After: ${hint}.`);
  }
  return new MessageRequestError(serverMessage(payload) || fallback);
}

export function messageErrorText(error: unknown, fallback: string): string {
  return error instanceof MessageRequestError ? error.userMessage : fallback;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "string" &&
    typeof message.customerId === "string" &&
    typeof message.photographerId === "string" &&
    (message.senderRole === "customer" || message.senderRole === "photographer") &&
    typeof message.body === "string" &&
    typeof message.createdAt === "string" &&
    typeof message.customerName === "string" &&
    typeof message.photographerName === "string"
  );
}

function toMessages(payload: unknown): ChatMessage[] {
  if (!payload || typeof payload !== "object") {
    throw new MessageRequestError("Respons pesan tidak valid.");
  }
  const list = (payload as { messages?: unknown }).messages;
  if (!Array.isArray(list)) {
    throw new MessageRequestError("Respons pesan tidak valid.");
  }
  return list.filter(isChatMessage);
}

function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  const byId = new Map(previous.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  const next = [...byId.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const unchanged =
    next.length === previous.length &&
    next.every((message, index) => {
      const old = previous[index];
      return (
        !!old &&
        old.id === message.id &&
        old.body === message.body &&
        old.createdAt === message.createdAt
      );
    });
  return unchanged ? previous : next;
}

export function useMessageThread(url: string | null, enabled = true) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
  const [loadedUrl, setLoadedUrl] = useState(url);

  // Ganti lawan bicara harus mulai dari thread kosong, bukan menggabungkan pesan lama.
  if (url !== loadedUrl) {
    setLoadedUrl(url);
    setMessages([]);
    setError(null);
    setFetched(false);
  }

  const active = Boolean(url && enabled);
  const inFlight = useRef(false);
  const requestId = useRef(0);
  const alive = useRef(true);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(
    async (force = false) => {
      if (!url || !enabled) return;
      if (typeof document !== "undefined" && document.hidden && !force) return;
      if (inFlight.current) {
        if (!force) return;
        controller.current?.abort();
      }

      const id = ++requestId.current;
      inFlight.current = true;
      const abort = new AbortController();
      controller.current = abort;
      try {
        const response = await fetch(url, {
          cache: "no-store",
          credentials: "same-origin",
          signal: abort.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          throw await messageFailure(response, payload, "Pesan gagal dimuat.");
        }
        const incoming = toMessages(payload);
        if (!alive.current || id !== requestId.current) return;
        setMessages((previous) => mergeMessages(previous, incoming));
        setError(null);
        setFetched(true);
      } catch (cause) {
        if (!alive.current || id !== requestId.current || abort.signal.aborted) return;
        setError(messageErrorText(cause, "Pesan gagal dimuat."));
        setFetched(true);
      } finally {
        if (id === requestId.current) {
          inFlight.current = false;
          controller.current = null;
        }
      }
    },
    [enabled, url],
  );

  useEffect(() => {
    alive.current = true;
    if (!url || !enabled) return;

    queueMicrotask(() => void load());
    const onVisibilityChange = () => {
      if (!document.hidden) void load();
    };
    const interval = window.setInterval(() => {
      if (!document.hidden) void load();
    }, POLL_INTERVAL);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      alive.current = false;
      controller.current?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, load, url]);

  return {
    messages: active ? messages : [],
    error: active ? error : null,
    loading: active && !fetched,
    refresh: load,
  };
}

export function useStickyScroll(key: string, scope = "") {
  const ref = useRef<HTMLDivElement | null>(null);
  const nearBottom = useRef(true);
  const lastScope = useRef(scope);

  const onScroll = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    nearBottom.current =
      element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (lastScope.current !== scope) {
      lastScope.current = scope;
      nearBottom.current = true;
    }
    if (!nearBottom.current) return;
    element.scrollTop = element.scrollHeight;
  }, [key, scope]);

  return { ref, onScroll };
}

export function MessageBubble({
  message,
  selfRole,
}: {
  message: ChatMessage;
  selfRole: SenderRole;
}) {
  const mine = message.senderRole === selfRole;
  const name = mine
    ? "Kamu"
    : message.senderRole === "customer"
      ? message.customerName
      : message.photographerName;

  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 shadow-soft sm:max-w-[75%]",
          mine
            ? "rounded-br-sm bg-ink text-paper"
            : "rounded-bl-sm border border-ink/10 bg-paper/80 text-ink",
        )}
      >
        <div
          className={cn(
            "mb-1 flex items-center gap-2 text-[11px]",
            mine ? "justify-end text-paper/60" : "text-ink/50",
          )}
        >
          <span className="font-medium">{name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.body}
        </p>
      </div>
    </div>
  );
}

export function ChatWithPhotographer({ photographerId }: { photographerId: string }) {
  const { session, userById, hydrated } = useGradly();
  const photographer = userById(photographerId);
  const canChat = hydrated && !!session;
  const threadUrl = canChat
    ? `/api/messages?photographerId=${encodeURIComponent(photographerId)}`
    : null;
  const { messages, error, loading, refresh } = useMessageThread(threadUrl, canChat);
  const lastId = messages.length ? messages[messages.length - 1].id : "";
  const { ref, onScroll } = useStickyScroll(lastId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!session || !body || body.length > 1000 || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          photographerId,
          customerId: session.id,
          body,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw await messageFailure(response, payload, "Pesan gagal dikirim.");
      }
      setDraft("");
      await refresh(true);
    } catch (cause) {
      setSendError(messageErrorText(cause, "Pesan gagal dikirim. Coba lagi."));
    } finally {
      setSending(false);
    }
  }

  if (!photographer) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 sm:px-6 sm:py-16">
        <Card className="p-6 text-center">
          <p className="text-sm text-ink/70">Fotografer tidak ditemukan.</p>
          <Button href="/portofolio" className="mt-4" variant="secondary">
            Kembali ke portofolio
          </Button>
        </Card>
      </div>
    );
  }

  const banner = sendError ?? error;
  const loginHref = `/masuk?next=/portofolio/${photographerId}/chat`;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
      <Reveal>
        <PageHeader
          eyebrow="Chat"
          title={"Tanya ke " + photographer.name}
          description="Tanya langsung ke fotografer sebelum memilih paket. Pesan muncul di kotak masuk fotografer dan dihapus otomatis setelah 2 hari."
        />
      </Reveal>

      <Reveal delay={70}>
        <Card className="mt-8 overflow-hidden">
          <div className="flex items-center gap-3 border-b border-ink/10 bg-gradient-to-br from-white/80 to-sage/20 px-5 py-4 sm:px-6">
            <Avatar name={photographer.name} size={48} />
            <div className="min-w-0">
              <p className="truncate font-medium">{photographer.name}</p>
              <p className="truncate text-sm text-ink/60">
                {photographer.studio || "Fotografer"} · {photographer.city}
              </p>
            </div>
            <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-ink/10 bg-paper/60 px-3 py-1.5 text-xs text-ink/60 sm:inline-flex">
              <Icon name="mail" size={14} />
              Percakapan
            </span>
          </div>

          {banner ? (
            <div
              role="alert"
              className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-danger/25 bg-danger-soft/70 px-4 py-3 text-sm text-danger sm:mx-6"
            >
              <Icon name="alert" size={17} className="mt-0.5 shrink-0" />
              <span>{banner}</span>
            </div>
          ) : null}

          {hydrated && !session ? (
            <div className="mx-5 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 sm:mx-6">
              <p className="text-sm text-ink/70">
                Masuk terlebih dahulu untuk mengirim pesan ke fotografer.
              </p>
              <Button href={loginHref} size="sm">
                Masuk untuk mengirim pesan
              </Button>
            </div>
          ) : null}

          <div
            ref={ref}
            onScroll={onScroll}
            role="log"
            aria-label="Percakapan"
            aria-live="polite"
            className="max-h-[520px] min-h-[280px] space-y-4 overflow-y-auto px-5 py-6 sm:px-6"
          >
            {loading && messages.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink/55">Memuat percakapan…</p>
            ) : messages.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-ink/15 bg-paper/40 px-6 py-8 text-center">
                <div>
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sage/50">
                    <Icon name="mail" size={20} />
                  </span>
                  <p className="mt-3 font-medium">Belum ada pesan</p>
                  <p className="mt-1 text-sm text-ink/60">
                    Tulis pertanyaan pertama untuk memulai percakapan.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} selfRole="customer" />
              ))
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="border-t border-ink/10 bg-paper/40 px-5 py-5 sm:px-6"
          >
            <Field
              label="Pesan kamu"
              htmlFor="chat-message"
              hint="Pesan muncul di kotak masuk fotografer dan dihapus otomatis setelah 2 hari."
            >
              <Textarea
                id="chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Tanya tentang paket, ketersediaan tanggal, atau hal lain..."
                rows={3}
                maxLength={1000}
                disabled={!canChat || sending}
              />
            </Field>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-ink/50">{draft.length}/1000 karakter</p>
              <Button type="submit" disabled={!canChat || sending || !draft.trim()}>
                <Icon name="send" size={16} />
                {sending ? "Mengirim…" : "Kirim pesan"}
              </Button>
            </div>
          </form>
        </Card>
      </Reveal>
    </div>
  );
}
