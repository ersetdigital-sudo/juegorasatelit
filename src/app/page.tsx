import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ListChecks,
  LockKeyhole,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import { FaqAccordion } from "@/components/faq";
import { OrderChecker } from "@/components/order-checker";
import { PromoCountdown } from "@/components/promo-countdown";
import { ServiceCatalog } from "@/components/service-catalog";
import { SiteFooter } from "@/components/site-footer";
import { TransactionFeed } from "@/components/transaction-feed";
import { getHydratedServices } from "@/lib/catalog-hydrate";
import { testimonials } from "@/lib/data";

const steps = [
  {
    icon: ListChecks,
    title: "Pilih layanan",
    text: "Tentukan tagihan atau produk digital yang ingin kamu bayar.",
  },
  {
    icon: Search,
    title: "Masukkan nomor",
    text: "Isi ID pelanggan atau nomor HP tujuan. Operator terdeteksi otomatis.",
  },
  {
    icon: Wallet,
    title: "Pilih nominal",
    text: "Pilih nominal, paket, atau jumlah bulan yang sesuai kebutuhan.",
  },
  {
    icon: CheckCircle2,
    title: "Bayar & selesai",
    text: "Selesaikan pembayaran, bukti transaksi langsung tersedia.",
  },
];

const marqueeItems = [
  "Token PLN",
  "Pulsa Semua Operator",
  "Paket Data",
  "Iuran BPJS",
  "Tagihan PDAM",
  "TV & Internet",
  "Top Up E-Wallet",
  "Angsuran Multifinance",
];

const paymentLogos = [
  { name: "QRIS", src: "/images/payments/qris.png" },
  { name: "DANA", src: "/images/payments/dana.svg" },
  { name: "BCA", src: "/images/payments/bca.svg" },
  { name: "GoPay", src: "/images/payments/gopay.png" },
];

export default async function HomePage() {
  const services = await getHydratedServices();

  return (
    <>
      <section className="hero grid-bg">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow-pill">
              <span className="live-dot" />
              PPOB all-in-one
              <span className="badge-new">Baru</span>
            </div>

            <h1>
              Semua tagihan, <span className="accent-word">beres</span> dalam satu tempat.
            </h1>

            <p className="hero-sub">
              Bayar listrik, pulsa, paket data, BPJS, PDAM, sampai angsuran kendaraan. Proses
              otomatis, bukti transaksi langsung tersedia.
            </p>

            <div className="hero-actions">
              <Link href="#layanan" className="btn btn-primary btn-lg">
                Bayar Tagihan
                <ArrowRight size={17} strokeWidth={2.4} />
              </Link>
              <Link href="/cek-transaksi" className="btn btn-ghost btn-lg">
                Cek Pesanan
                <Search size={16} />
              </Link>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">
                  2jt<small>+</small>
                </div>
                <span className="stat-label">Transaksi berhasil</span>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  3<small> detik</small>
                </div>
                <span className="stat-label">Rata-rata proses</span>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  4.9<small>/5</small>
                </div>
                <span className="stat-label">Rating pengguna</span>
              </div>
            </div>

            <div className="hero-trust">
              <span className="avatar-stack" aria-hidden="true">
                <span>RP</span>
                <span>SM</span>
                <span>DA</span>
                <span>+2m</span>
              </span>
              <span>
                Dipercaya <strong>2 juta+ pengguna</strong> di seluruh Indonesia
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <TransactionFeed />
            <div className="hero-mini-grid">
              <div className="cashback-card">
                <div className="cashback-kicker">
                  <Sparkles size={10} />
                  Cashback spesial
                </div>
                <div className="cashback-value">
                  5<small>%</small>
                </div>
                <p className="cashback-text">
                  Setiap transaksi pertamamu. Langsung masuk ke saldo Juegora.
                </p>
              </div>

              <div className="payments-card">
                <span className="payments-title">Bayar dengan</span>
                <div className="payment-logo-row">
                  {paymentLogos.map((payment) => (
                    <span key={payment.name} className="payment-logo-tile" title={payment.name}>
                      <img src={payment.src} alt={payment.name} />
                    </span>
                  ))}
                  <span className="payment-more">+5</span>
                </div>
                <span className="payments-note">
                  <ShieldCheck size={9} />
                  QRIS, e-wallet & VA
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee-band" aria-label="Layanan yang tersedia">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span className="marquee-item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <section className="section promo-section" id="flash-sale">
        <div className="container">
          <div className="promo-banner">
            <div className="promo-copy">
              <span className="promo-kicker">
                <Zap size={10} fill="currentColor" />
                Flash sale hari ini
              </span>
              <h2>
                Diskon <em>20%</em> untuk transaksi pertamamu.
              </h2>
              <p>
                Pakai kode promo di bawah saat pembayaran. Berlaku untuk semua layanan, tanpa
                minimum transaksi.
              </p>
              <div className="promo-code-row">
                <span className="promo-code">
                  <Sparkles size={11} />
                  JUE20
                </span>
                <span>Otomatis aktif untuk pengguna baru</span>
              </div>
            </div>
            <PromoCountdown />
          </div>
        </div>
      </section>

      <section className="section" id="layanan">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Layanan lengkap</span>
              <h2>Satu tempat untuk semua kebutuhan digitalmu.</h2>
              <p>
                Pilih layanan, masukkan nomor tujuan, lalu bayar. Semua prosesnya transparan dan
                selesai dalam hitungan detik.
              </p>
            </div>
            <div className="badge badge-orange">
              <Zap size={11} />
              8 kategori aktif
            </div>
          </div>
          <ServiceCatalog services={services} />
        </div>
      </section>

      <section className="section section-tight" id="cara-order">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Cara order</span>
              <h2>Empat langkah, tagihan beres.</h2>
            </div>
            <div className="badge badge-success">
              <ShieldCheck size={11} />
              Aman & terverifikasi
            </div>
          </div>
          <div className="how-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article className="step-card" key={step.title}>
                  <div className="step-top">
                    <span className="step-number">0{index + 1}</span>
                    <span className="step-icon">
                      <Icon size={17} strokeWidth={1.9} />
                    </span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" aria-label="Cek status pesanan">
        <div className="container">
          <OrderChecker />
        </div>
      </section>

      <section className="section" id="testimoni">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Testimoni</span>
              <h2>Mereka sudah beres. Kamu kapan?</h2>
              <p>Cerita nyata dari pelanggan yang rutin pakai Juegora Satelit.</p>
            </div>
            <div className="badge badge-orange">
              <Star size={10} fill="currentColor" />
              4.9 dari 12.480 ulasan
            </div>
          </div>

          <div className="testimonial-grid">
            {testimonials.map((item) => (
              <article className="testimonial-card" key={item.name}>
                <div className="stars" aria-label="5 dari 5 bintang">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={12} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <p className="testimonial-quote">“{item.quote}”</p>
                <div className="testimonial-user">
                  <span className="testimonial-avatar">{item.initials}</span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                  <span className="testimonial-service">{item.service}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="container faq-layout">
          <div className="faq-intro">
            <span className="eyebrow">FAQ</span>
            <h2>Pertanyaan yang sering ditanyakan.</h2>
            <p>
              Belum menemukan jawabannya? Tim kami siap membantu lewat WhatsApp setiap hari, 24
              jam.
            </p>
            <a
              className="faq-contact"
              href="https://wa.me/6285711172317"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={14} />
              Chat dengan tim Juegora · 0857-1117-2317
              <ArrowUpRight size={12} />
            </a>
          </div>
          <FaqAccordion />
        </div>
      </section>

      <section className="cta-section" aria-label="Mulai bayar tagihan">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-copy">
              <span>
                <LockKeyhole size={11} />
                Pembayaran aman & terenkripsi
              </span>
              <h2>Tagihan menumpuk? Beresin sekarang.</h2>
              <p>
                Pilih layanan, bayar lewat QRIS atau e-wallet favoritmu. Bukti transaksi dan status
                pesanan langsung tersedia di halaman invoice.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="#layanan" className="btn btn-dark btn-lg">
                Bayar Tagihan
                <ArrowRight size={16} />
              </Link>
              <Link href="/cek-transaksi" className="btn btn-outline-light btn-lg">
                <Search size={15} />
                Cek Pesanan
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
