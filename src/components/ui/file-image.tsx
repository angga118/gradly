"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { fileUrl } from "@/lib/file-url";
import { Icon, type IconName } from "./icons";

/**
 * Foto dari penyimpanan Gradly atau aset demo `public/seed`.
 *
 * `fileKey` kosong atau berkas gagal dimuat → komponen tidak merender
 * apa pun, sehingga placeholder gradasi di elemen induk tetap terlihat.
 * Memakai `<img>` polos (bukan next/image) karena URL-nya bisa berupa API
 * lokal maupun aset statis — sama seperti `file-preview.tsx`.
 */
export function FileImage({
  fileKey,
  alt,
  className = "absolute inset-0 h-full w-full object-cover",
}: {
  fileKey: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState<{ key: string; failed: boolean }>({
    key: fileKey,
    failed: false,
  });
  const failed = error.key === fileKey && error.failed;

  if (!fileKey || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fileUrl(fileKey)}
      alt={alt}
      loading="lazy"
      className={className}
      onLoad={() => setError({ key: fileKey, failed: false })}
      onError={() => setError({ key: fileKey, failed: true })}
    />
  );
}

/** Thumbnail berkas dengan ikon cadangan saat gambar belum tersedia. */
export function FileThumb({
  fileKey,
  alt,
  icon = "file",
  className,
}: {
  fileKey: string;
  alt: string;
  icon?: IconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink/10 bg-sky/50 text-ink/35",
        className,
      )}
    >
      <Icon name={icon} size={16} aria-hidden="true" />
      {fileKey ? <FileImage fileKey={fileKey} alt={alt} /> : null}
    </span>
  );
}
