import { mkdir, stat, unlink, writeFile } from "node:fs/promises"
import { join, extname, resolve, sep } from "node:path"
import { randomUUID } from "node:crypto"

export type StoredFile = { key: string; name: string; sizeKb: number }

/** Typed rejection raised by {@link saveUpload} for invalid uploads. */
export class StorageError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported_type" | "too_large" | "empty",
  ) {
    super(message)
    this.name = "StorageError"
  }
}

const MB = 1024 * 1024
const LIMITS = {
  doc: { max: 5 * MB, types: ["image/jpeg", "image/png", "application/pdf"] },
  portfolio: { max: 100 * MB, types: ["image/jpeg", "image/png"] },
} as const

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
}

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  pdf: "application/pdf",
}

const STORE_DIR = resolve(process.cwd(), "storage", "private")

/** Only charset-randomUUID + extension keys are ever written, so reject anything else. */
const SAFE_KEY = /^[A-Za-z0-9._-]+$/

function resolveKey(key: string): string | null {
  if (!SAFE_KEY.test(key) || key.includes("..")) return null
  const path = resolve(STORE_DIR, key)
  const prefix = STORE_DIR + sep
  return path.startsWith(prefix) ? path : null
}

export async function saveUpload(
  file: File,
  opts: { kind: "doc" | "portfolio" },
): Promise<StoredFile> {
  const rules = LIMITS[opts.kind]
  const allowed: readonly string[] = rules.types

  if (file.size === 0) {
    throw new StorageError("Berkas kosong.", "empty")
  }
  if (!allowed.includes(file.type)) {
    throw new StorageError("Tipe berkas tidak didukung.", "unsupported_type")
  }
  if (file.size > rules.max) {
    throw new StorageError(
      `Ukuran berkas melebihi ${rules.max / MB} MB.`,
      "too_large",
    )
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin"
  const key = `${randomUUID()}.${ext}`
  const bytes = Buffer.from(await file.arrayBuffer())

  await mkdir(STORE_DIR, { recursive: true })
  await writeFile(join(STORE_DIR, key), bytes)

  return {
    key,
    name: file.name,
    sizeKb: Math.max(1, Math.ceil(file.size / 1024)),
  }
}

export async function readUpload(
  key: string,
): Promise<{ path: string; size: number; contentType: string } | null> {
  const path = resolveKey(key)
  if (!path) return null
  try {
    const info = await stat(/* turbopackIgnore: true */ path)
    if (!info.isFile()) return null
    const ext = extname(path).slice(1).toLowerCase()
    return {
      path,
      size: info.size,
      contentType: MIME_BY_EXT[ext] ?? "application/octet-stream",
    }
  } catch {
    return null
  }
}

export async function deleteUpload(key: string): Promise<void> {
  const path = resolveKey(key)
  if (!path) return
  await unlink(path).catch(() => {
    /* already gone — idempotent */
  })
}
