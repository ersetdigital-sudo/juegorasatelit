import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { JuegoraLogo } from "@/components/juegora-logo";

const PAYMENTS = [
  { name: "QRIS", src: "/images/payments/qris.png" },
  { name: "DANA", src: "/images/payments/dana.svg" },
  { name: "OVO", src: "/images/payments/ovo.svg" },
  { name: "GoPay", src: "/images/payments/gopay.png" },
  { name: "BCA", src: "/images/payments/bca.svg" },
  { name: "BRI", src: "/images/payments/bri.svg" },
  { name: "Mandiri", src: "/images/payments/mandiri.svg" },
  { name: "BNI", src: "/images/payments/bni.svg" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <JuegoraLogo />
            <p>
              Satu tempat untuk bayar tagihan dan beli produk digital. Proses cepat, harga jelas,
              dan bukti transaksi selalu tersimpan.
            </p>
            <div className="footer-payments" aria-label="Metode pembayaran yang tersedia">
              {PAYMENTS.map((payment) => (
                <span key={payment.name} className="payment-logo-tile" title={payment.name}>
                  <img src={payment.src} alt={payment.name} />
                </span>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <h3>Layanan</h3>
            <Link href="/layanan/pln">Token & Tagihan PLN</Link>
            <Link href="/layanan/pulsa">Pulsa Semua Operator</Link>
            <Link href="/layanan/paket-data">Paket Data</Link>
            <Link href="/layanan/bpjs">Iuran BPJS</Link>
            <Link href="/layanan/pdam">Tagihan PDAM</Link>
          </div>

          <div className="footer-col">
            <h3>Juegora Satelit</h3>
            <Link href="/#cara-order">Cara Order</Link>
            <Link href="/cek-transaksi">Cek Pesanan</Link>
            <Link href="/#testimoni">Testimoni</Link>
            <Link href="/#faq">FAQ</Link>
            <Link href="/#flash-sale">Flash Sale</Link>
          </div>

          <div className="footer-col">
            <h3>Bantuan</h3>
            <a href="https://wa.me/6285711172317" target="_blank" rel="noreferrer">
              WhatsApp CS · 0857-1117-2317 <ArrowUpRight size={11} style={{ display: "inline" }} />
            </a>
            <a href="mailto:halo@juegorasatelit.com">halo@juegorasatelit.com</a>
            <Link href="/#faq">Pusat Bantuan</Link>
            <Link href="/#faq">Kebijakan Privasi</Link>
            <Link href="/#faq">Syarat & Ketentuan</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Juegora Satelit. Seluruh hak cipta dilindungi.</span>
          <span>
            <ShieldCheck size={12} />
            Pembayaran diproses melalui kanal resmi
          </span>
          <div className="footer-legal">
            <a href="#">Privasi</a>
            <a href="#">Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
