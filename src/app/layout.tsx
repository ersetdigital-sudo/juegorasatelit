import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { MotionInit } from "@/components/motion-init";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://juegorasatelit.com"),
  title: {
    default: "Juegora Satelit — Bayar tagihan & produk digital dalam satu tempat",
    template: "%s | Juegora Satelit",
  },
  description:
    "Juegora Satelit: bayar token listrik PLN, pulsa, paket data, BPJS, PDAM, TV internet, top up e-wallet, dan angsuran multifinance. Proses cepat, aman, dan bukti transaksi langsung tersedia.",
  applicationName: "Juegora Satelit",
  keywords: [
    "PPOB",
    "bayar tagihan online",
    "token listrik",
    "pulsa",
    "paket data",
    "BPJS",
    "PDAM",
    "e-wallet",
    "multifinance",
  ],
  openGraph: {
    title: "Juegora Satelit — Semua tagihan, beres dalam satu tempat.",
    description:
      "Bayar listrik, pulsa, BPJS, PDAM, dan produk digital lainnya. Proses otomatis dalam hitungan detik.",
    locale: "id_ID",
    type: "website",
    siteName: "Juegora Satelit",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3fbf9",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="h-full" data-scroll-behavior="smooth">
      <body>
        <ScrollProgress />
        <MotionInit />
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
