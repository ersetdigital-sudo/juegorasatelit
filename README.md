# Juegora Satelit — Website PPOB

Website PPOB (pembayaran tagihan & produk digital) berbahasa Indonesia dengan **background utama
putih** dan blok warna **mint `#CBF3F0`**, **light sea green `#2EC4B6`**, serta **orange peel
`#FF9F1C`**. Ikon layanan memakai SVG garis modern. Dibangun dengan Next.js 16 (App Router),
React 19, dan CSS murni tanpa CDN.

## Menjalankan

```bash
npm install
npm run dev -- -p 3100
# buka http://localhost:3100

npm run build
npm start -- -p 3100
```

`npm run build` menjalankan TypeScript check terlebih dahulu, lalu build produksi Next.js.

## Halaman

| Route | Isi |
| --- | --- |
| `/` | Beranda lengkap: header sticky, hero + feed transaksi live, marquee, promo countdown, 8 kategori dengan filter & pencarian, cara order, cek pesanan, testimoni, FAQ, CTA gradien mint–teal–orange, footer. |
| `/layanan/pln` | Detail token & tagihan PLN. |
| `/layanan/pulsa` | Pulsa semua operator + deteksi operator otomatis dan logo operator. |
| `/layanan/paket-data` | Paket data semua operator + deteksi operator otomatis. |
| `/layanan/bpjs` | Iuran BPJS, pilih kelas dan durasi 1–6 bulan. |
| `/layanan/pdam` | Tagihan PDAM + dropdown wilayah. |
| `/layanan/tv-internet` | Tagihan TV & internet rumah. |
| `/layanan/e-wallet` | Top up DANA, OVO, GoPay, ShopeePay. |
| `/layanan/multifinance` | Angsuran Adira, FIF, BAF, Mega Auto. |
| `/pembayaran` | Tab metode QRIS / e-wallet / virtual account, kode promo, invoice, instruksi bayar, countdown 15 menit, timeline status, tombol konfirmasi “Saya sudah bayar”. |
| `/cek-transaksi` | Halaman mandiri untuk cek status pesanan lewat nomor invoice. |

Halaman detail layanan **tidak memakai footer** dan tidak menampilkan tab layanan lain di mobile,
sesuai permintaan. Ringkasan pesanan sticky di desktop dan berada di alur normal di mobile.

## Alur checkout

Alur detail layanan dibuat bertahap seperti PPOB marketplace:

1. **Data tujuan** — masukkan nomor/ID. Tekan “Cek Nomor” untuk verifikasi data mitra.
   Setelah terverifikasi, muncul operator/wilayah dan nominal tagihan untuk
   layanan pascabayar (BPJS, PDAM, TV, multifinance).
2. **Pilih produk** — pilihan produk terkunci sampai nomor terverifikasi, lalu terbuka dengan
   animasi. Ringkasan pesanan ikut diperbarui.
3. **Pembayaran** — tab QRIS/E-Wallet/Virtual Account, kode promo `JUE20` atau `HEMAT10`,
   dan total akhir.
4. **Invoice** — nomor invoice, kode QRIS, instruksi pembayaran, countdown 15 menit, timeline
   status, dan tombol “Saya sudah bayar”.

Jika nomor diubah, verifikasi otomatis direset agar data tidak tertukar.

## Mengubah harga & produk

Semua data terpusat di **`src/lib/data.ts`**:

- `services[].products[].price` — harga produk (angka, rupiah).
- `services[].fromPrice` — harga “Mulai dari” pada kartu beranda.
- `services[].inputLabel`, `inputHint`, `tags` — konten halaman detail.
- `operators` — prefix nomor dan logo operator.
- `paymentMethods` — metode pembayaran, biaya admin, dan logo.
- `promoCodes` — kode promo (`JUE20` = 20% maks. Rp 20.000, `HEMAT10` = potongan Rp 10.000).
- `pdamRegions`, `tvProviders`, `financeProviders`, `wallets`.
- `demoOrders` — invoice contoh untuk pengecekan status.
- `testimonials`, `faqs` — konten testimoni dan FAQ.

Semua harga saat ini adalah **contoh** dan bisa diganti tanpa menyentuh komponen UI.

## Logo & ikon

- Logo Juegora Satelit: `src/components/juegora-logo.tsx` — monogram “J” putih dengan orbit
  tipis dan titik oranye di dalam squircle gradien teal, plus wordmark dengan badge “SATELIT”.
  Jika file resmi dari brand kit tersedia, ganti isi SVG/komponen ini.
- Ikon kategori SVG garis modern (lucide): `src/components/service-icon.tsx` — warna teal,
  aksen titik orange, tanpa aset eksternal.
- Logo operator & pembayaran: `public/images/operators/` dan `public/images/payments/`. Semua file
  lokal sehingga tetap tampil di editor maupun saat deploy.
- Font lokal: `public/fonts/inter-latin.woff2` dan `plus-jakarta-sans-latin.woff2`.

## Pembayaran & status pesanan

- Belum terhubung ke payment gateway. Setelah “Bayar”, invoice dibuat di sisi klien dan countdown
  15 menit dimulai.
- Kode QRIS dimuat dari foto resmi merchant (Cloudinary) dan ditampilkan utuh di halaman invoice.
- Tombol **Saya sudah bayar** mengubah status menjadi `Diproses` dengan pesan
  “Terima kasih, pembayaran Anda sedang diproses”.
- Invoice disimpan di `localStorage` dengan key `juegora_orders`, lalu bisa dicek di halaman
  **/cek-transaksi** (juga tersedia sebagai section di beranda).
- Invoice demo yang selalu tersedia: `JSR-2610-0812` (Selesai), `JSR-2610-0774` (Diproses),
  `JSR-2610-0641` (Menunggu pembayaran).
- Untuk produksi, ganti pembuatan invoice + penyimpanan lokal dengan API backend/payment gateway.

## Animasi

- Hero masuk bertahap (stagger), elemen dekoratif mengambang, dan tombol memiliki efek shine.
- Scroll reveal + stagger untuk kartu layanan, langkah order, testimoni, promo, tracker, dan CTA.
- Progress bar tipis di bagian paling atas mengikuti posisi scroll.
- Verifikasi nomor memakai loading state, lalu kartu nomor terverifikasi muncul dengan animasi.
- Perpindahan tab pembayaran, produk yang terbuka, promo berhasil, dan timeline invoice ikut
  dianimasikan.
- Semua animasi dinonaktifkan otomatis saat pengguna memilih `prefers-reduced-motion`.

## Catatan responsif

Diuji pada lebar 1440, 1360, 390, 320 px:

- Tidak ada scroll horizontal.
- Filter kategori turun ke baris berikutnya.
- Input tidak keluar layar.
- Grid layanan menjadi 2 kolom di ponsel, 1 kolom di bawah 380 px.
- Menu header berubah menjadi menu mobile.
- Tombol aksi pembayaran sticky di bawah layar (≤ 680 px): “Lanjut Bayar” di form layanan,
  “Bayar” di halaman pembayaran, dan “Saya sudah bayar” di invoice.
- Countdown invoice hanya tampil sekali di mobile (mini timer di header invoice).

## Struktur

```text
src/
  app/
    page.tsx                  # beranda
    layout.tsx                # header global, metadata, font
    layanan/[slug]/page.tsx   # detail layanan (SSG)
    pembayaran/page.tsx       # halaman pembayaran
    cek-transaksi/page.tsx    # halaman cek status pesanan
    globals.css               # design system + responsif
  components/
    service-icon.tsx          # 8 ikon SVG garis modern
    juegora-logo.tsx          # monogram J + orbit + wordmark
    motion-init.tsx           # scroll reveal + stagger
    scroll-progress.tsx       # progress bar scroll
    site-header.tsx           # nav + dropdown layanan
    site-footer.tsx
    service-catalog.tsx       # filter + pencarian
    service-form.tsx          # verifikasi nomor, produk, ringkasan sticky
    payment-client.tsx        # tab metode, promo, invoice, countdown, timeline
    transaction-feed.tsx      # feed transaksi otomatis
    promo-countdown.tsx
    order-checker.tsx         # cek invoice (dipakai beranda + /cek-transaksi)
    faq.tsx
  lib/
    data.ts
    format.ts
public/
  fonts/
  images/operators/
  images/payments/
```
