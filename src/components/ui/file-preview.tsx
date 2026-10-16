"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Icon } from "./icons";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png"];

function extensionOf(key: string): string {
  const dot = key.lastIndexOf(".");
  return dot === -1 ? "" : key.slice(dot + 1).toLowerCase();
}

export function FilePreview({
  fileKey,
  name,
  className,
}: {
  fileKey: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const src = `/api/files/${encodeURIComponent(fileKey)}`;
  const isImage = IMAGE_EXTENSIONS.includes(extensionOf(fileKey));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("keydown", onKey, true);
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey, true);
      triggerRef.current?.focus();
    };
  }, [open]);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl border border-ink/10 bg-white/50 px-3 py-2.5 text-xs text-ink/55",
          className,
        )}
      >
        <Icon name="alert" size={14} className="shrink-0 text-ink/40" />
        Berkas tidak tersedia
      </div>
    );
  }

  if (!isImage) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-ink/10 bg-white/60 p-3",
          className,
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky text-ink">
          <Icon name="file" size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-ink/55">Dokumen PDF</p>
        </div>
        <Button
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          prefetch={false}
          variant="secondary"
          size="sm"
          className="shrink-0"
        >
          <Icon name="external" size={15} />
          Buka dokumen
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Perbesar ${name}`}
        className="group relative block w-full overflow-hidden rounded-xl border border-ink/10 bg-white/60"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`Pratinjau ${name}`}
          onError={() => setFailed(true)}
          className="max-h-72 w-full object-contain"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-opacity group-hover:bg-ink/25 group-hover:opacity-100 group-focus-visible:bg-ink/25 group-focus-visible:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-soft">
            <Icon name="eye" size={14} />
            Perbesar
          </span>
        </span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${name}`}
          onClick={() => setOpen(false)}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup pratinjau"
            className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-ink transition-colors hover:bg-white"
          >
            <Icon name="x" size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Pratinjau ${name}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-xl object-contain shadow-lift"
          />
        </div>
      ) : null}
    </div>
  );
}
