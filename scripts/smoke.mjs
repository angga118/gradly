#!/usr/bin/env node
// Smoke test: butuh dev server berjalan + database sudah di-seed (`npm run db:seed`).
// Jalankan: `npm run smoke` (BASE_URL=http://localhost:3000 by default).
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const USER = { email: "rani@gradly.id", password: "gradly" }
const ADMIN = { email: "admin@gradly.id", password: "gradly" }
const SMOKE_PASSWORD = "gradly123"

let passed = 0
let failed = 0
function check(name, ok, detail) {
  if (ok) {
    passed++
    console.log(`PASS  ${name}`)
  } else {
    failed++
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`)
  }
}

class Jar {
  constructor() {
    this.map = new Map()
  }
  store(res) {
    const raw =
      res.headers.getSetCookie?.() ??
      (res.headers.get("set-cookie") ?? "").split(/,\s+(?=[\w-]+=)/)
    for (const c of raw) {
      const [pair] = c.split(";")
      const i = pair.indexOf("=")
      if (i < 1) continue
      const name = pair.slice(0, i).trim()
      const value = pair.slice(i + 1).trim()
      value ? this.map.set(name, value) : this.map.delete(name)
    }
  }
  header() {
    return [...this.map].map(([n, v]) => `${n}=${v}`).join("; ")
  }
}

async function req(path, jar, init = {}) {
  const headers = { ...init.headers }
  const cookie = jar?.header()
  if (cookie) headers.cookie = cookie
  const res = await fetch(BASE + path, { ...init, headers })
  jar?.store(res)
  return res
}
const json = (res) => res.json().catch(() => null)

// Auth.js v5 credentials dance: GET /api/auth/csrf sets a csrf cookie that must
// ride along on the same jar; the callback takes form-urlencoded credentials and
// the session cookie lands on the redirect response we deliberately don't follow.
async function login(jar, { email, password }) {
  const csrf = (await json(await req("/api/auth/csrf", jar)))?.csrfToken
  if (!csrf) return { ok: false, detail: "no csrfToken" }
  await req("/api/auth/callback/credentials", jar, {
    method: "POST",
    redirect: "manual",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf, email, password, json: "true" }),
  })
  const me = (await json(await req("/api/me", jar)))?.user
  return { ok: me?.email === email, detail: me ? `got ${me.email}` : "no session user" }
}

async function waitForServer() {
  const deadline = Date.now() + 10_000
  let last = "no response"
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/api/stats")
      if (res.status === 200) return
      last = `HTTP ${res.status}`
    } catch (err) {
      last = err.message
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  console.log(`FAIL  readiness GET /api/stats — ${BASE} unreachable (${last})`)
  console.log("Summary: 0 passed, 1 failed")
  process.exit(1)
}

// Slot jadwal turunan dari waktu jalan supaya smoke test tidak bentrok
// dengan booking lama maupun dengan run sebelumnya (semua paket uji satu fotografer).
const runAt = new Date()
const baseMinute = runAt.getUTCHours() * 60 + runAt.getUTCMinutes()
const slot = (offset) => {
  const m = (baseMinute + offset) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}
const eventDate = new Date(runAt.getTime() + 400 * 86_400_000).toISOString().slice(0, 10)
const runTag = runAt.getTime()

const register = (email, headers = {}) =>
  req("/api/auth/register", null, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({
      name: "Smoke Test",
      email,
      password: SMOKE_PASSWORD,
      phone: "081200000001",
      city: "Bandung",
      role: "user",
    }),
  })

const book = (jar, packageId, eventTime) =>
  req("/api/bookings", jar, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      packageId,
      customerName: "Smoke Test",
      customerPhone: "081200000000",
      eventDate,
      eventTime,
      location: "Studio Gradly, Jakarta",
      note: "smoke test run",
      subsidized: false,
    }),
  })

const PAGES = ["/", "/paket", "/subsidi", "/portofolio", "/bantuan", "/masuk", "/daftar"]
const APIS = [
  ["/api/stats", (d) => Array.isArray(d?.monthlyRevenue) && typeof d?.subsidyFund === "object" && d.subsidyFund !== null],
  ["/api/packages", (d) => Array.isArray(d?.packages)],
  ["/api/portfolio", (d) => Array.isArray(d?.portfolio)],
  ["/api/highlights", (d) => Array.isArray(d?.highlights)],
  ["/api/testimonials", (d) => Array.isArray(d?.testimonials)],
  ["/api/photographers", (d) => Array.isArray(d?.photographers)],
]

const userJar = new Jar()
const adminJar = new Jar()
const smokeJar = new Jar()
await waitForServer()

for (const p of PAGES) {
  const res = await req(p, null)
  check(`GET ${p} → 200`, res.status === 200, `got ${res.status}`)
}
for (const [p, shape] of APIS) {
  const res = await req(p, null)
  const body = await json(res)
  check(`GET ${p} → 200 + shape`, res.status === 200 && shape(body), res.status !== 200 ? `got ${res.status}` : "unexpected shape")
}

const unauth = await req("/api/bookings", null)
check("GET /api/bookings unauthenticated → 401", unauth.status === 401, `got ${unauth.status}`)

const adminPage = await req("/admin", null, { redirect: "manual" })
const location = adminPage.headers.get("location") ?? ""
check(
  "GET /admin unauthenticated → redirect /masuk",
  (adminPage.status === 307 || adminPage.status === 302) && location.includes("/masuk"),
  `got ${adminPage.status} location=${location}`,
)

const userLogin = await login(userJar, USER)
check(`login ${USER.email} + GET /api/me`, userLogin.ok, userLogin.detail)

const packages = (await json(await req("/api/packages", null)))?.packages
check("packages non-empty", Array.isArray(packages) && packages.length > 0, "empty package list")
const pick = (name) => packages?.find((p) => p.name === name)
const basic = pick("Basic Moment")
const harapan = pick("Harapan")
check("paket 'Basic Moment' tersedia", basic?.id != null, "not found")
check("paket 'Harapan' tersedia + kipkOnly", harapan?.id != null && harapan?.kipkOnly === true, "not found or not kipkOnly")

// Registrasi tanpa verifikasi email: user baru langsung bisa login.
const smokeEmail = `smoke+${runTag}@gradly.id`
const regRes = await register(smokeEmail)
const regBody = await json(regRes)
check(
  "POST /api/auth/register → 200 + ok",
  regRes.status === 200 && regBody?.ok === true,
  `got ${regRes.status} ${regBody?.error ?? ""}`.trim(),
)
const smokeLogin = await login(smokeJar, { email: smokeEmail, password: SMOKE_PASSWORD })
check("login user baru tanpa verifikasi → berhasil", smokeLogin.ok, smokeLogin.detail)

const createRes = await book(userJar, basic?.id, slot(0))
const created = await json(createRes)
check("POST /api/bookings → 201", createRes.status === 201 && created?.booking?.id != null, `got ${createRes.status} ${created?.error ?? ""}`.trim())

const dupe = await book(userJar, basic.id, slot(0))
check("duplicate POST /api/bookings → 409", dupe.status === 409, `got ${dupe.status}`)

const adminLogin = await login(adminJar, ADMIN)
check(`login ${ADMIN.email}`, adminLogin.ok, adminLogin.detail)

const patch = (jar, status) =>
  req(`/api/bookings/${created?.booking?.id}`, jar, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  })

const confirmed = await json(await patch(adminJar, "Confirmed"))
check("admin PATCH booking → 200 Confirmed", confirmed?.booking?.status === "Confirmed", `got ${confirmed?.booking?.status ?? confirmed?.error}`)

const patched = await json(await patch(adminJar, "Selesai"))
check("admin PATCH booking → 200 Selesai", patched?.booking?.status === "Selesai", `got ${patched?.booking?.status ?? patched?.error}`)

const denied = await patch(userJar, "Selesai")
check("user PATCH booking → 403", denied.status === 403, `got ${denied.status}`)

// Paket khusus KIP-K: non-KIP-K ditolak 403, penerima KIP-K terverifikasi boleh.
const nonKipk = await book(smokeJar, harapan?.id, slot(30))
check("POST /api/bookings paket Harapan (non-KIP-K) → 403", nonKipk.status === 403, `got ${nonKipk.status}`)

const kipk = await book(userJar, harapan?.id, slot(30))
check("POST /api/bookings paket Harapan (KIP-K) → 201", kipk.status === 201, `got ${kipk.status}`)

const ledger = await json(await req("/api/ledger", adminJar))
check("GET /api/ledger (admin) → 200 + array", Array.isArray(ledger?.ledger), "unexpected shape")
const ledgerAnon = await req("/api/ledger", null)
check("GET /api/ledger unauthenticated → 401", ledgerAnon.status === 401, `got ${ledgerAnon.status}`)

// Rate limit registrasi: 10 per IP per jam. Bucket per-IP hanya terisi kalau
// ada header x-forwarded-for, jadi simulasi IP dengan alamat TEST-NET-2.
// Dijalankan terakhir supaya kuota tidak mengganggu cek lain.
const RL_IP = "198.51.100.7"
let limited = null
for (let i = 0; i < 12 && !limited; i++) {
  const res = await register(`smoke+rl${runTag}-${i}@gradly.id`, { "x-forwarded-for": RL_IP })
  if (res.status === 429) limited = res
}
check("register rate limit → 429", limited?.status === 429, "tidak pernah 429")
check("429 menyertakan Retry-After", limited != null && limited.headers.get("retry-after") != null, "header tidak ada")

console.log(`Summary: ${passed} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
