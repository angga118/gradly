# Gradly (sebelumnya GradForAll) — Web App

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

## Tech stack (Usulan)

- Frontend: Next.js (React) + TypeScript. Halaman publik dirender di server untuk SEO.
- Styling: Tailwind CSS dengan design token di bagian "Desain".
- Backend: Node.js (NestJS) atau route handler Next.js.
- Database: PostgreSQL.
- File privat: object storage kompatibel S3, akses lewat tautan bertanda tangan berumur pendek.
- Autentikasi: Auth.js atau penyedia auth terkelola. Email + kata sandi dan Google.
- Email transaksional: verifikasi akun, hasil verifikasi, konfirmasi booking, pengingat sesi.

Arsitektur: satu frontend, satu API untuk semua peran, database, penyimpanan file privat, layanan email.

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
2. Daftar atau masuk (email atau Google).
3. Opsional: ajukan verifikasi SKTM/KIP-K. Admin memeriksa maksimal 1×24 jam hari kerja. Hasil dikabari lewat email.
4. Pilih paket, isi detail acara (nama, WhatsApp, tanggal, jam, lokasi, catatan).
5. Bayar lewat transfer, unggah bukti.
6. Status "Menunggu konfirmasi admin". Setelah dikonfirmasi menjadi CONFIRMED di Riwayat. Pengingat dikirim 3 hari sebelum sesi.

## Aturan bisnis

Dari Figma:

- Total bayar klien reguler = harga paket + kontribusi subsidi 5%. Contoh: Rp 299.000 + Rp 14.950 = Rp 313.950.
- Paket Harapan (Rp 89.000) hanya untuk penerima KIP-K yang sudah terverifikasi.
- Paket dengan harga di atas Rp 1 juta tidak bisa mensubsidi. Fotografer punya saklar "Aktifkan Subsidi KIP-K" per paket.
- Komisi platform atas pendapatan fotografer: 10%.
- Penarikan dana fotografer: jumlah tarik tidak boleh melebihi saldo tersedia.
- Unggahan dokumen SKTM/KIP-K dan bukti transfer: JPG, PNG, PDF, maks. 5 MB.
- Unggahan foto portofolio: JPG, PNG, maks. 100 MB.
- ID mengikuti pola `BK_2026_0246` (booking) dan `SB_2026_0246` (ajuan subsidi).
- Fotografer dengan status "Tidak menerima booking" tidak tampil dan paketnya tidak bisa dipesan.
- Hasil foto dikirim lewat Google Drive (disebut di deskripsi paket).

Paket di Figma (sisi User): Basic Moment Rp 299.000, Harapan Rp 89.000 (subsidi KIP-K), Golden Graduate Rp 599.000, Prestige Memories Rp 999.000. Di sisi Fotografer ada tambahan contoh Paket Bebas Berekspresi Rp 1.200.000.

Status:

- Booking: Menunggu konfirmasi, Confirmed, Selesai, Dibatalkan.
- Ajuan subsidi: Menunggu review, Terverifikasi, Ditolak.

## Model data (Usulan)

- `users`: id, email, password_hash, role (`user` | `fotografer` | `admin`), name, phone, city, created_at.
- `subsidy_applications`: id (SB_...), user_id, doc_type (`SKTM` | `KIP-K`), file_key, kelurahan, address, status, reviewed_by, reviewed_at, reject_reason.
- `packages`: id, photographer_id, name, description, price, subsidy_price (nullable), subsidy_enabled, features[], is_active.
- `bookings`: id (BK_...), user_id, photographer_id, package_id, event_date, event_time, location, note, price, contribution, total, status, subsidized (bool).
- `payment_proofs`: id, booking_id, file_key, uploaded_at, verified_by, verified_at.
- `notifications`: id, user_id, type, title, body, read_at, created_at.
- `portfolio_items`: id, photographer_id, file_key, package_name, client_name, location, shot_date.
- `highlight_cards`: id, photographer_id, icon, text.
- `testimonials`: id, photographer_id, client_name, rating, message.
- `subsidy_ledger`: id, booking_id, type (`contribution` | `distribution`), amount, created_at.
- `withdrawals`: id, photographer_id, amount, bank_account, status, created_at.

Setiap keputusan verifikasi dan konfirmasi pembayaran harus tercatat (siapa, kapan, hasil).

## Kebutuhan non-fungsional

- Responsif: breakpoint 360, 768, 1024, 1440 px, tanpa scroll horizontal.
- Browser: dua versi terbaru Chrome, Safari, Firefox, Edge.
- Performa halaman publik: LCP ≤ 2,5 dtk, CLS ≤ 0,1.
- SEO: halaman publik (landing, paket, portofolio, subsidi, FAQ) dirender di server, dengan meta tag dan Open Graph.
- Aksesibilitas: WCAG 2.2 AA. Label form, navigasi keyboard, teks alternatif foto.
- Keamanan: HTTPS, kata sandi di-hash, rate limiting login, proteksi CSRF/XSS, hak akses per peran di server.
- Privasi: dokumen SKTM/KIP-K dan bukti transfer di penyimpanan privat, hanya bisa dibuka pemilik akun dan admin. Persetujuan data pribadi saat daftar, hak hapus akun, mengikuti UU PDP.
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

1. Aliran uang: klien membayar ke platform atau langsung ke fotografer? Bagaimana komisi 10%, kontribusi 5% (di landing tertulis 5–10%), dan kompensasi subsidi untuk fotografer dihitung?
2. Metode pembayaran: transfer manual + unggah bukti (form booking) atau juga QRIS (detail booking)? Bank dan nomor rekening: BNI di layar pembayaran, BCA di panduan.
3. Masa berlaku verifikasi subsidi: "satu kali transaksi" (FAQ) atau punya masa aktif tanggal tertentu (profil)?
4. Tombol "Gunakan Harga Subsidi" disebut di panduan tetapi tidak ada di frame booking. Perlu ditambahkan.
5. Kuota dan perilaku saat dana subsidi habis.
6. Kebijakan pembatalan dan pengembalian dana (notifikasi "Booking Dibatalkan" ada).
7. Pencegahan dua booking pada jadwal yang sama (tidak ada kalender ketersediaan di Figma).
8. Nama paket: sisi Fotografer dan Admin memakai Dasar/Premium, sisi User memakai Basic Moment/Golden Graduate/Prestige Memories.
9. Angka statistik landing (500+ sesi, 120+ klien subsidi, Rp 23 jt) berbeda dengan dashboard admin (127 klien subsidi, Rp 48,2 jt terkumpul). Ambil dari data, bukan teks tetap.
10. Domain baru untuk Gradly dan alamat email admin.

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
