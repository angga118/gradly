/**
 * URL untuk membuka berkas.
 *
 * Aset demo (`seed/...`) disimpan di `public/seed` dan langsung bisa diakses.
 * Upload asli disimpan privat di `storage/private` dan lewat route /api/files.
 */
export function fileUrl(fileKey: string): string {
  return fileKey.startsWith("seed/")
    ? `/${fileKey}`
    : `/api/files/${encodeURIComponent(fileKey)}`
}
