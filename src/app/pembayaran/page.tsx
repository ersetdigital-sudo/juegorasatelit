import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentClient } from "@/components/payment-client";

export const metadata: Metadata = {
  title: "Pembayaran",
  description:
    "Selesaikan pembayaran pesanan Juegora Satelit melalui QRIS, e-wallet, atau virtual account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="container">
          <div className="order-not-found panel">
            <p>Memuat halaman pembayaran…</p>
          </div>
        </div>
      }
    >
      <PaymentClient />
    </Suspense>
  );
}
