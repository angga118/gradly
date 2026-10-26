# Gradly — Web App

Gradly adalah web app untuk memesan jasa foto wisuda, dengan program subsidi: pemegang SKTM atau KIP-K yang terverifikasi mendapat harga hingga 60% lebih murah. Subsidi berasal dari kontribusi klien reguler.

Dokumen ini adalah ringkasan PRD untuk dibaca AI coding agent dan developer. Target: **web responsif (desktop dan browser mobile), bukan aplikasi native.** Bahasa antarmuka: Bahasa Indonesia.

## Cara memakai dokumen ini

- Bagian bertanda **(Figma)** berasal dari desain. Bagian bertanda **(Usulan)** adalah saran yang belum disepakati.
- Bagian **"Belum diputuskan"** jangan diasumsikan. Tanyakan ke pemilik produk atau buat sebagai konfigurasi yang mudah diubah.
- Semua frame Figma berukuran 390 px (mobile). Layout desktop **belum ada di Figma**. Acuan desktop adalah mockup HTML di bagian "Referensi desain".

## Peran pengguna

| Peran | Tujuan | Halaman utama |
| --- | --- | --- |
| User: klien reguler | Memilih paket, booking, bayar | Landing, Paket, Booking, Riwayat |
| User: klien subsidi | Sama seperti reguler, plus mengajukan verifikasi SKTM/KIP-K dan memakai harga subsidi | Ajuan subsidi, Dokumen SKTM |
| Fotografer | Mengonfirmasi booking, mengelola paket dan portofolio, memantau pendapatan, menarik dana | Portal Fotografer |
| Admin | Verifikasi SKTM/KIP-K, memantau booking dan dana subsidi | Panel Admin |

Satu akun punya satu peran. Peran menentukan halaman tujuan setelah login dan hak akses rute.

## Tech stack

- Frontend: Next.js 16 (App Router) + React + TypeScript. Halaman publik dirender di server untuk SEO.
- Styling: Tailwind CSS dengan design token di bagian "Desain".
- Backend: route handler Next.js — satu API untuk semua peran, tanpa service terpisah.
- Database: SQLite lewat Prisma (`@prisma/adapter-better-sqlite3`), file lokal `prisma/dev.db`.
- File privat: disk lokal `storage/private`, diakses lewat `/api/files/<key>` dengan cek kepemilikan (pemilik akun atau admin).
- Autentikasi: Auth.js (NextAuth v5) — email + kata sandi, Google opsional.
- Email transaksional: Resend — hasil verifikasi subsidi, konfirmasi booking, pengingat sesi.
- Cron: route handler `/api/cron/*`, dijaga header `Authorization: Bearer $CRON_SECRET`.

Arsitektur: satu frontend, satu API untuk semua peran, database, penyimpanan file privat, layanan email.

## Environment

Semua variabel ada di `.env.example`; salin ke `.env` lalu isi sesuai kebutuhan lokal.

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Koneksi database SQLite, contoh `file:./dev.db` (relatif terhadap folder `prisma/`) |
| `AUTH_SECRET` | Kunci penanda tangan session Auth.js, minimal 32 karakter |
| `AUTH_TRUST_HOST` | `true` saat mempercayai host/proxy di lingkungan lokal |
| `APP_URL` | URL dasar aplikasi untuk tautan absolut (email, cron) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Kredensial login Google; kosong = login Google nonaktif |
| `RESEND_API_KEY` | API key Resend untuk email transaksional; kosong = email dilewati |
| `MAIL_FROM` | Alamat pengirim yang sudah diverifikasi di Resend |
| `CRON_SECRET` | Shared secret untuk `/api/cron/*`, contoh `openssl rand -hex 32` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Email kontak yang tampil di situs |
| `NEXT_PUBLIC_CONTACT_PHONE` | Nomor telepon/WhatsApp kontak yang tampil di situs |
| `NEXT_PUBLIC_CONTACT_ADDRESS` | Alamat studio/operasional yang tampil di situs |
| `NEXT_PUBLIC_PAYMENT_BANK_NAME` | Nama bank tujuan pembayaran manual |
| `NEXT_PUBLIC_PAYMENT_BANK_ACCOUNT` | Nomor rekening tujuan pembayaran manual |
| `NEXT_PUBLIC_PAYMENT_ACCOUNT_HOLDER` | Nama pemilik rekening tujuan pembayaran manual |

Variabel `NEXT_PUBLIC_*` dibaca di browser (client-safe); sisanya server-only.

## Perintah

```bash
npm install            # pasang dependensi + prisma generate
npm run dev            # dev server di http://localhost:3000
npm run build && npm start
npm run db:generate    # generate Prisma client
npm run db:migrate     # jalankan migrasi
npm run db:seed        # isi data contoh (rani@gradly.id, admin@gradly.id; sandi: gradly)
npm run db:reset       # reset database + seed ulang
npm run lint
npm run smoke          # smoke test end-to-end; butuh dev server jalan + database ter-seed
```

`npm run smoke` mengirim HTTP ke `BASE_URL` (default `http://localhost:3000`) dan mencetak PASS/FAIL per cek.

## Rute (Usulan)

### Publik dan User

| Rute | Halaman | Frame Figma |
| --- | --- | --- |
| `/` | Landing | Card 1:2 |
| `/paket` | Katalog paket | Frame 14 |
| `/portofolio` | Portofolio fotografer | Frame 29 |
| `/subsidi` | Penjelasan program subsidi | Card 143:2801 |
| `/masuk`, `/daftar` | Login dan registrasi (semua peran) | Frame 4–11 |
| `/subsidi/ajukan` | Form ajuan verifikasi | Card 143:3206, Frame 60, 32 |
| `/booking` | Booking langkah 1: ringkasan harga | Frame 19, 23 |
| `/booking/acara` | Booking langkah 2: detail acara | Frame 25 |
| `/booking/bayar` | Booking langkah 3: pembayaran | Frame 24, 26–28 |
| `/booking/berhasil` | Booking terkirim | Frame 57 |
| `/riwayat` | Riwayat booking dan subsidi | Frame 58, 59 |
| `/profil` | Profil dan status subsidi | Frame 33 |
| `/profil/kata-sandi` | Ubah kata sandi | Frame 34–38, 56 |
| `/profil/dokumen` | Dokumen SKTM saya | Frame 45 |
| `/notifikasi` | Notifikasi | Frame 46 |
| `/bantuan` | Panduan dan FAQ | Frame 40–44 |

### Fotografer (`/fotografer/*`)

| Rute | Isi | Frame Figma |
| --- | --- | --- |
| `/fotografer` | Dashboard: booking bulan ini, rating, pendapatan, foto dikirim, grafik reguler vs subsidi, booking terbaru | 509:2113 |
| `/fotografer/booking` | Daftar booking: total, confirmed, pending, selesai; filter paket dan status; cari klien; Detail dan Konfirm | 523:4481 dan variannya |
| `/fotografer/paket` | Kelola paket: tambah, ubah, hapus (dengan konfirmasi) | 447:1662, 485:1523, 538:791, 538:992 |
| `/fotografer/subsidi` | Booking subsidi: total sesi, kompensasi diterima, pending | 546:697 |
| `/fotografer/portofolio` | Galeri, filter tahun, unggah foto, highlight card, "Kata Mereka" | 427:1471, 465:2258, popup 427:1864 dll. |
| `/fotografer/pendapatan` | Total bulan ini, saldo, riwayat pembayaran, ajukan penarikan | 543:1502, 569:2705 |
| `/fotografer/profil` | Data diri, bio, tag, status ketersediaan | 465:2469 |

### Admin (`/admin/*`)

| Rute | Isi | Frame Figma |
| --- | --- | --- |
| `/admin` | Ringkasan: total booking, dana subsidi, pendapatan reguler, klien subsidi; grafik pendapatan bulanan; distribusi klien | 384:3335 |
| `/admin/dana-subsidi` | Dana tersedia, progres ke target, total didistribusikan, kontribusi bulan ini, riwayat transaksi | 384:3431 |
| `/admin/verifikasi` | Antrean pemohon, pratinjau dokumen, Setujui, Tolak | 384:3789, 384:5010 |
| `/admin/booking` | Daftar booking: cari, filter status, tab Subsidi, Detail | 384:4053, 384:4151 |

## Alur utama User (Figma)

1. Buka landing, lihat paket dan program subsidi.
2. Daftar atau masuk (email atau Google). Registrasi langsung menghasilkan akun aktif — verifikasi email belum dipakai.
3. Opsional: ajukan verifikasi SKTM/KIP-K. Admin memeriksa maksimal 1×24 jam hari kerja. Hasil dikabari lewat email. Paket khusus KIP-K (Harapan) hanya bisa dipesan setelah verifikasi KIP-K disetujui.
4. Pilih paket, isi detail acara (nama, WhatsApp, tanggal, jam, lokasi, catatan).
5. Bayar lewat transfer, unggah bukti.
6. Status "Menunggu konfirmasi admin". Setelah dikonfirmasi menjadi CONFIRMED di Riwayat. Pengingat dikirim 3 hari sebelum sesi.

## Aturan bisnis

Dari Figma, ditambah keputusan yang sudah ditetapkan:

- Total bayar klien reguler = harga paket + kontribusi subsidi 5%. Contoh: Rp 299.000 + Rp 14.950 = Rp 313.950.
- Paket Harapan (Rp 89.000) adalah paket terpisah dengan harga tetap Rp 89.000, khusus penerima KIP-K yang sudah terverifikasi — bukan diskon dari paket lain.
- Paket bertanda `kipkOnly` tidak boleh memakai harga subsidi. Klien non-KIP-K yang memesan paket itu ditolak dengan 403.
- Paket dengan harga di atas Rp 1 juta tidak bisa mensubsidi. Fotografer punya saklar "Aktifkan Subsidi KIP-K" per paket.
- Komisi platform atas pendapatan fotografer: 10%, dan tetap berlaku untuk booking subsidi.
- Entri buku besar: `contribution` (kontribusi 5% dari klien reguler), `distribution` (subsidi yang dicairkan ke fotografer), `payout` (penarikan dana fotografer), `topup` (penambahan dana subsidi di luar modal, tanpa booking). Entri ditulis saat settlement, bukan saat booking dibuat.
- Penarikan dana fotografer: jumlah tarik tidak boleh melebihi saldo tersedia.
- Unggahan dokumen SKTM/KIP-K dan bukti transfer: JPG, PNG, PDF, maks. 5 MB.
- Unggahan foto portofolio: JPG, PNG, maks. 100 MB.
- ID booking dan ajuan subsidi memakai tabel `Counter` dengan pola `BK_2026_0246` (booking) dan `SB_2026_0246` (ajuan subsidi).
- Fotografer dengan status "Tidak menerima booking" tidak tampil dan paketnya tidak bisa dipesan.
- Hasil foto dikirim lewat Google Drive (disebut di deskripsi paket).
- Verifikasi email belum diimplementasikan: registrasi langsung menghasilkan akun aktif, dan akun bisa langsung masuk. Alur verifikasi email ditambahkan saat situs online.

Paket di Figma (sisi User): Basic Moment Rp 299.000, Harapan Rp 89.000 (paket khusus KIP-K), Golden Graduate Rp 599.000, Prestige Memories Rp 999.000. Di sisi Fotografer ada tambahan contoh Paket Bebas Berekspresi Rp 1.200.000.

Status:

- Booking: Menunggu konfirmasi, Confirmed, Selesai, Dibatalkan.
- Ajuan subsidi: Menunggu review, Terverifikasi, Ditolak.

## Model data

Skema Prisma di `prisma/schema.prisma` (SQLite). Nilai enum disimpan sebagai kolom `String` biasa, bukan enum database.

- `User`: id, email, emailVerified, passwordHash, role (`user` | `fotografer` | `admin`), name, phone, city, bio, studio, tags[], acceptingBookings, rating, sessions, subsidyValidUntil, subsidyDocType (`SKTM` | `KIP-K`), sessionVersion.
- `SubsidyApplication`: id (SB_...), userId, docType (`SKTM` | `KIP-K`), docName, fileKey, kelurahan, address, status, submittedAt, reviewedById, reviewedAt, rejectReason.
- `Package`: id, photographerId, name, description, price, subsidyPrice (nullable), subsidyEnabled, kipkOnly, features[], isActive, popular.
- `Booking`: id (BK_...), userId, photographerId, packageId, eventDate, eventTime, location, note, price, contribution, total, status, subsidized, reminderSentAt, createdAt.
- `PaymentProof`: id, bookingId, fileKey, name, sizeKb, uploadedAt, verifiedById, verifiedAt.
- `Notification`: id, userId, type, title, body, readAt, createdAt.
- `PortfolioItem`: id, photographerId, title, packageName, clientName, location, shotDate, tone, fileKey.
- `HighlightCard`: id, photographerId, icon, title, text.
- `Testimonial`: id, photographerId, clientName, rating, message.
- `LedgerEntry`: id, bookingId (nullable — null untuk `topup`), type (`contribution` | `distribution` | `payout` | `topup`), amount, label, createdAt.
- `Withdrawal`: id, photographerId, amount, bankAccount, status, createdAt.
- `Counter`: name, value — sumber nomor urut `BK_...` dan `SB_...`.

Setiap keputusan verifikasi dan konfirmasi pembayaran harus tercatat (siapa, kapan, hasil).

## Kebutuhan non-fungsional

- Responsif: breakpoint 360, 768, 1024, 1440 px, tanpa scroll horizontal.
- Browser: dua versi terbaru Chrome, Safari, Firefox, Edge.
- Performa halaman publik: LCP ≤ 2,5 dtk, CLS ≤ 0,1.
- SEO: halaman publik (landing, paket, portofolio, subsidi, FAQ) dirender di server, dengan meta tag dan Open Graph.
- Aksesibilitas: WCAG 2.2 AA. Label form, navigasi keyboard, teks alternatif foto.
- Keamanan: HTTPS, kata sandi di-hash, rate limiting login dan registrasi, proteksi CSRF/XSS, hak akses per peran di server.
- Privasi: dokumen SKTM/KIP-K dan bukti transfer di penyimpanan privat (`storage/private`), hanya bisa dibuka lewat `/api/files/<key>` oleh pemilik akun atau admin. Persetujuan data pribadi saat daftar, hak hapus akun, mengikuti UU PDP.
- Validasi tipe file di server, bukan hanya ekstensi.

## Desain

Gaya hangat dan editorial, seperti studio foto pernikahan. Warna dari gambar referensi pemilik produk.

```css
:root {
  --color-ink: #513229;        /* teks utama, judul, tombol utama */
  --color-paper: #F4F1E2;      /* latar halaman */
  --color-sky: #D8EBF9;        /* kartu informasi, status Confirmed/Terverifikasi */
  --color-butter: #FCE6B7;     /* badge subsidi, Paket Harapan, status Menunggu */
  --color-sage: #D7D4B1;       /* pemisah, kartu sekunder, footer */
  --color-danger: #A63D2F;     /* error dan status Dibatalkan/Ditolak (tambahan, usulan) */
}
```

- Tipografi: judul Fraunces (serif), teks isi DM Sans.
- Tombol utama: latar `--color-ink`, teks `--color-paper`, bentuk pil. Tombol sekunder: garis `--color-ink`, tanpa isi.
- Status chip: Menunggu = butter, Confirmed/Terverifikasi/Selesai = sky atau sage, Dibatalkan/Ditolak = danger.
- Kontras cokelat di atas krem ≈ 10:1, di atas kuning dan biru ≈ 9:1, di atas sage ≈ 7,6:1.
- Layout desktop: lebar konten maks. 1200 px, grid 12 kolom. Booking dua kolom: form di kiri, ringkasan harga menempel di kanan. Portal Fotografer dan Admin memakai sidebar kiri.

## Referensi desain

- Figma (mobile 390 px, semua peran): `https://www.figma.com/design/RNZDUblxqPHBjYRYCF3Lfl/GradForAll`. Halaman Figma: `User`, `Fotografer` (node 384:886), `Admin` (node 16:30).
- Mockup desktop interaktif (12 layar, palet baru): https://claude.ai/artifact/RkVvBfF4cXYofCXXakfNg1
  - Landing, Masuk/Daftar, Ajuan Subsidi, Booking 3 langkah, Riwayat, Profil, Notifikasi, Bantuan/FAQ, Ubah Kata Sandi, Dokumen SKTM, Panel Admin, Portal Fotografer.
  - Data pada mockup adalah contoh. Nama, tanggal, dan angka bukan data final.
  - Nomor rekening dan masa aktif subsidi memakai placeholder `[...]`.

Catatan: nama brand di Figma masih "GradForAll" dan "LensaID". Gunakan **Gradly**.

## Belum diputuskan (jangan diasumsikan)

1. Aliran uang: klien membayar ke platform atau langsung ke fotografer? Termasuk perilaku saat dana subsidi habis.
2. Metode pembayaran: transfer manual + unggah bukti (form booking) atau juga QRIS (detail booking)? Bank dan nomor rekening: BNI di layar pembayaran, BCA di panduan.
3. Masa berlaku verifikasi subsidi: "satu kali transaksi" (FAQ) atau punya masa aktif tanggal tertentu (profil)?
4. Kebijakan pembatalan dan pengembalian dana (notifikasi "Booking Dibatalkan" ada).
5. Domain baru untuk Gradly dan alamat email admin.

## Fase rilis (Usulan)

- **MVP:** User (landing, paket, daftar/masuk, profil dan ubah kata sandi, ajuan subsidi, booking 3 langkah, riwayat). Admin (verifikasi SKTM, daftar booking, dana subsidi). Fotografer (dashboard dan daftar booking dengan tombol Konfirm).
- **Fase 2:** Fotografer (kelola paket, portofolio, profil, booking subsidi). Admin dashboard lengkap. Notifikasi dan pengingat sesi. Bantuan dan FAQ dikelola admin.
- **Fase 3:** Pendapatan dan penarikan dana fotografer. Pembayaran otomatis bila diputuskan. Kalender ketersediaan. Dasbor transparansi dana subsidi.

## Metrik keberhasilan (Usulan)

| Metrik | Target |
| --- | --- |
| Konversi: pengunjung landing → booking terkirim | ≥ 3% |
| Penyelesaian booking: mulai form → bukti transfer terkirim | ≥ 60% |
| Waktu verifikasi SKTM/KIP-K | ≤ 1×24 jam kerja |
| Waktu konfirmasi booking | ≤ 1×24 jam kerja |
| LCP halaman publik di 4G | ≤ 2,5 detik |

## Di luar cakupan MVP

- Aplikasi native iOS/Android.
- Payment gateway otomatis (kecuali diputuskan di poin 2).
- Kalender ketersediaan fotografer.
- Pemilihan banyak fotografer oleh klien. Sisi User di Figma hanya menampilkan satu fotografer.
- Pengiriman hasil foto di dalam platform (hasil lewat Google Drive).

## Urutan pengerjaan yang disarankan

1. Setup proyek, design token, layout dasar (header, footer, sidebar portal).
2. Auth dengan tiga peran dan proteksi rute.
3. Katalog paket, landing, halaman publik (SSR).
4. Ajuan subsidi + penyimpanan file privat + antrean verifikasi admin.
5. Booking 3 langkah + unggah bukti + konfirmasi (fotografer dan admin) + riwayat + notifikasi email.
6. Dashboard dan daftar booking fotografer, dana subsidi admin.
7. Sisanya sesuai fase rilis.
