"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./icons";

export interface PickedFile {
  name: string;
  sizeKb: number;
  file: File;
}

export function FileDrop({
  accept = ".jpg,.jpeg,.png,.pdf",
  maxMb = 5,
  label = "Unggah dokumen",
  hint,
  onPick,
  className,
}: {
  accept?: string;
  maxMb?: number;
  label?: string;
  hint?: string;
  onPick: (file: PickedFile | null) => void;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<PickedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function handle(f: File | undefined) {
    if (!f) return;
    const sizeKb = Math.round(f.size / 1024);
    if (sizeKb > maxMb * 1024) {
      setError(`Ukuran file melebihi ${maxMb} MB.`);
      setFile(null);
      onPick(null);
      return;
    }
    setError(null);
    const picked = { name: f.name, sizeKb, file: f };
    setFile(picked);
    onPick(picked);
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragging ? "border-ink bg-ink/5" : "border-ink/25 bg-white/50 hover:border-ink/50",
        )}
      >
        <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-sky/70 text-ink">
          <Icon name="upload" size={20} />
        </span>
        {file ? (
          <>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-ink/55">{file.sizeKb} KB · klik untuk ganti</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-1 text-xs text-ink/55">
              {hint ?? `JPG, PNG, atau PDF · maks. ${maxMb} MB`}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0])}
        />
      </div>
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
