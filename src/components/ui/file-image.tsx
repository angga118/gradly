"use client";

import { useState } from "react";

/**
 * Foto dari penyimpanan Gradly (`/api/files/<key>`).
 *
 * `fileKey` kosong atau berkas gagal dimuat → komponen tidak merender
 * apa pun, sehingga placeholder gradasi di elemen induk tetap terlihat.
 * Memakai `<img>` polos (bukan next/image) karena URL-nya API lokal yang
 * sudah menyetel Content-Type sendiri — sama seperti `file-preview.tsx`.
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
  const [failed, setFailed] = useState(false);

  if (!fileKey || failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/files/${encodeURIComponent(fileKey)}`}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
