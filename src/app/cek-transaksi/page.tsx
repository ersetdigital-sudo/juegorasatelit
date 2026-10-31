import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MessageCircle, ReceiptText, ShieldCheck } from "lucide-react";
import { OrderChecker } from "@/components/order-checker";

export const metadata: Metadata = {
  title: "Cek Pesanan",
  description:
    "Cek status pesanan Juegora Satelit lewat nomor invoice. Lihat status pembayaran, detail transaksi, dan bukti pembayaran kamu.",
  openGraph: {
    title: "Cek Pesanan | Juegora Satelit",
    description:
      "Pantau status pembayaran token, pulsa, BPJS, PDAM, dan tagihan lainnya hanya dengan nomor invoice.",
  },
};

export default function CekTransaksiPage() {
  return (
    <div className="detail-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight />
          <span className="current">Cek Pesanan</span>
        </nav>

        <header className="detail-hero">
          <div className="detail-icon">
            <ReceiptText size={48} />
          </div>
          <div className="detail-hero-copy">
            <span className="eyebrow">Cek transaksi</span>
            <h1>Lacak status pesananmu.</h1>
            <p>
              Masukkan nomor invoice yang kamu terima setelah pembayaran untuk melihat status
              transaksi, detail produk, dan bukti pembayaran secara langsung.
            </p>
            <div className="detail-tags">
              <span className="badge">
                <ShieldCheck size={9} />
                Status diperbarui otomatis
              </span>
              <span className="badge">
                <ReceiptText size={9} />
                Status langsung dari server
              </span>
            </div>
          </div>
        </header>

        <OrderChecker showCopy={false} />

        <p className="detail-focus-note">
          <MessageCircle size={12} />
          Nomor invoice tidak ditemukan? Hubungi tim kami lewat WhatsApp di 0857-1117-2317. Data
          transaksi kamu tidak dibagikan ke pihak ketiga.
        </p>
      </div>
    </div>
  );
}
