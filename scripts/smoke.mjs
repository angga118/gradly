#!/usr/bin/env node
const BASE = process.env.BASE_URL ?? "http://localhost:3000"
const USER = { email: "rani@gradly.id", password: "gradly" }
const ADMIN = { email: "admin@gradly.id", password: "gradly" }

let passed = 0
function check(name, ok, detail) {
  if (!ok) {
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`)
    console.log(`Summary: ${passed} passed, 1 failed`)
    process.exit(1)
  }
  passed++
  console.log(`PASS  ${name}`)
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

// Email verification flow: register → login blocked → verify link → login works.
const smokeEmail = `smoke+${Date.now()}@gradly.id`
const smokePassword = "gradly123"
const regRes = await req("/api/auth/register", null, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: "Smoke Verify",
    email: smokeEmail,
    password: smokePassword,
    phone: "081200000001",
    city: "Bandung",
    role: "user",
  }),
})
const regBody = await json(regRes)
check(
  "POST /api/auth/register → 200 + verifyUrl",
  regRes.status === 200 && regBody?.ok === true && typeof regBody?.verifyUrl === "string",
  `got ${regRes.status} ${regBody?.error ?? ""}`.trim(),
)

const unverifiedJar = new Jar()
const unverifiedLogin = await login(unverifiedJar, { email: smokeEmail, password: smokePassword })
check("login unverified → gagal", !unverifiedLogin.ok, unverifiedLogin.detail)

const verifyUrl = new URL(regBody.verifyUrl)
const verifyRes = await req(verifyUrl.pathname + verifyUrl.search, null, { redirect: "manual" })
const verifyLocation = verifyRes.headers.get("location") ?? ""
check(
  "GET verifyUrl → 302 /masuk?verified=1",
  (verifyRes.status === 302 || verifyRes.status === 307) && verifyLocation.includes("verified=1"),
  `got ${verifyRes.status} location=${verifyLocation}`,
)

const verifiedJar = new Jar()
const verifiedLogin = await login(verifiedJar, { email: smokeEmail, password: smokePassword })
check("login setelah verifikasi → berhasil", verifiedLogin.ok, verifiedLogin.detail)

const packages = (await json(await req("/api/packages", null)))?.packages
check("packages[0] available", Boolean(packages?.[0]?.id), "empty package list")
// Far-future date so reruns never collide with real bookings.
const bookingBody = {
  packageId: packages[0].id,
  customerName: "Smoke Test",
  customerPhone: "081200000000",
  eventDate: "2027-06-15",
  eventTime: "09:00",
  location: "Studio Gradly, Jakarta",
  note: "smoke test run",
  subsidized: false,
}
const post = () =>
  req("/api/bookings", userJar, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(bookingBody),
  })

const createRes = await post()
const created = await json(createRes)
check("POST /api/bookings → 201", createRes.status === 201 && created?.booking?.id != null, `got ${createRes.status} ${created?.error ?? ""}`.trim())

const dupe = await post()
check("duplicate POST /api/bookings → 409", dupe.status === 409, `got ${dupe.status}`)

const adminLogin = await login(adminJar, ADMIN)
check(`login ${ADMIN.email}`, adminLogin.ok, adminLogin.detail)

const patch = (jar, status) =>
  req(`/api/bookings/${created.booking.id}`, jar, {
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

console.log(`Summary: ${passed} passed, 0 failed`)
