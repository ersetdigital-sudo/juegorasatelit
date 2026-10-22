import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container">
      <div className="order-not-found panel">
        <Compass size={34} style={{ margin: "0 auto 14px", color: "var(--orange)" }} />
        <h1>Halaman tidak ditemukan</h1>
        <p>
          Sepertinya tautan yang kamu buka sudah tidak tersedia atau salah ketik. Kembali ke beranda
          untuk melihat semua layanan Juegora Satelit.
        </p>
        <Link href="/" className="btn btn-primary">
          <ArrowLeft size={15} />
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
