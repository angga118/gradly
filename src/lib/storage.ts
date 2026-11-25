import { randomUUID } from "node:crypto"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

export type StoredFile = { key: string; name: string; sizeKb: number }

/** Typed rejection raised for invalid uploads and storage failures. */
export class StorageError extends Error {
  constructor(
    message: string,
    readonly code: "unsupported_type" | "too_large" | "empty" | "storage_error",
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

/** Only charset-randomUUID + extension keys are ever written, so reject anything else. */
const SAFE_KEY = /^[A-Za-z0-9._-]+$/

// Server-only: the service-role key must never reach a client bundle.
let client: SupabaseClient | null = null

function privateBucket() {
  if (!client) {
    const url = process.env.SUPABASE_URL
    const serviceKey =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      throw new StorageError(
        "Supabase Storage belum dikonfigurasi.",
        "storage_error",
      )
    }
    client = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return client.storage.from(process.env.SUPABASE_BUCKET || "gradly-private")
}

function isValidKey(key: string): boolean {
  return SAFE_KEY.test(key) && !key.includes("..")
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

  const { error } = await privateBucket().upload(key, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    throw new StorageError(`Gagal menyimpan berkas: ${error.message}`, "storage_error")
  }

  return {
    key,
    name: file.name,
    sizeKb: Math.max(1, Math.ceil(file.size / 1024)),
  }
}

export async function readUpload(
  key: string,
): Promise<{ data: ArrayBuffer; size: number; contentType: string } | null> {
  if (!isValidKey(key)) return null

  const { data, error } = await privateBucket().download(key)
  if (error) {
    throw new StorageError(`Gagal membaca berkas: ${error.message}`, "storage_error")
  }
  if (!data) return null

  const bytes = await data.arrayBuffer()
  const ext = key.split(".").pop()?.toLowerCase() ?? ""
  return {
    data: bytes,
    size: bytes.byteLength,
    contentType: MIME_BY_EXT[ext] || data.type || "application/octet-stream",
  }
}

export async function deleteUpload(key: string): Promise<void> {
  if (!isValidKey(key)) return

  const { error } = await privateBucket().remove([key])
  if (error) {
    throw new StorageError(`Gagal menghapus berkas: ${error.message}`, "storage_error")
  }
}
