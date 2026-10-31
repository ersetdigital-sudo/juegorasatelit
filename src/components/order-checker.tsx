"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, ReceiptText, Search } from "lucide-react";
import { formatDateTime, formatRupiah } from "@/lib/format";

type PublicStatus = "menunggu" | "diproses" | "selesai" | "gagal";

type PublicOrder = {
  invoice: string;
  status: PublicStatus;
  service: string;
  product: string;
  number: string;
  total: number;
  method: string;
  channel: string;
  createdAt: string;
  sn: string | null;
};

const STATUS_META: Record<
  PublicStatus,
  { label: string; className: string }
> = {
  menunggu: {
    label: "Menunggu pembayaran",
    className: "status-menunggu-pembayaran",
  },
  diproses: { label: "Sedang diproses", className: "status-diproses" },
  selesai: { label: "Selesai", className: "status-selesai" },
  gagal: { label: "Dibatalkan", className: "status-gagal" },
};

export function OrderChecker({ showCopy = true }: { showCopy?: boolean }) {
  const [invoice, setInvoice] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function check(value: string) {
    const needle = value.trim().toUpperCase();
    if (!needle) {
      setError("Masukkan nomor invoice terlebih dahulu.");
      setOrder(null);
      setChecked(false);
      return;
    }
    if (!/^JGS-[A-Z0-9-]{4,}$/i.test(needle)) {
      setError("Format invoice belum tepat. Contoh: JGS-YYMMDD-XXXXXX.");
      setOrder(null);
      setChecked(false);
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(needle)}`, {
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        setOrder(null);
        setError("Invoice tidak ditemukan. Periksa kembali nomor invoice kamu.");
        setChecked(true);
        return;
      }
      setOrder((await response.json()) as PublicOrder);
      setChecked(true);
    } catch {
      setOrder(null);
      setError("Gagal memeriksa status. Coba lagi sebentar.");
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void check(invoice);
  }

  const meta = order ? STATUS_META[order.status] : null;

  return (
    <div className={`tracker-panel ${showCopy ? "" : "tracker-panel--form"}`.trim()} id="cek-pesanan">
      {showCopy && (
        <div className="tracker-copy">
          <span className="eyebrow">Cek pesanan</span>
          <h2>Lacak status pesananmu.</h2>
          <p>
            Masukkan nomor invoice yang kamu terima setelah pembayaran untuk melihat status
            transaksi secara langsung.
          </p>
          <div className="tracker-perks">
            <span>
              <CheckCircle2 size={13} /> Status real-time dari server
            </span>
            <span>
              <CheckCircle2 size={13} /> Bisa dicek kapan saja
            </span>
            <span>
              <CheckCircle2 size={13} /> Bantuan CS 24 jam
            </span>
          </div>
        </div>
      )}

      <div className="tracker-form-wrap">
        <form className="tracker-form" onSubmit={handleSubmit}>
          <div className="field-shell">
            <span className="field-prefix">
              <ReceiptText size={13} />
            </span>
            <input
              type="text"
              value={invoice}
              onChange={(event) => {
                setInvoice(event.target.value.toUpperCase());
                if (error) setError("");
              }}
              placeholder="Contoh: JGS-2610-0812"
              aria-label="Nomor invoice"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 className="spin" size={15} /> : <Search size={15} />}
            {loading ? "Mencari…" : "Cek"}
          </button>
        </form>

        {error && <p className="tracker-error">{error}</p>}

        {checked && order && meta && (
          <div className="tracker-result">
            <div className="tracker-result-head">
              <div>
                <strong>{order.invoice}</strong>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className={`tracker-status ${meta.className}`}>{meta.label}</div>
            </div>
            <div className="tracker-detail-row">
              <span>Layanan</span>
              <span>{order.service}</span>
            </div>
            <div className="tracker-detail-row">
              <span>Produk</span>
              <span>{order.product}</span>
            </div>
            <div className="tracker-detail-row">
              <span>Nomor tujuan</span>
              <span>{order.number}</span>
            </div>
            <div className="tracker-detail-row">
              <span>Metode</span>
              <span>{order.method}</span>
            </div>
            <div className="tracker-detail-row">
              <span>Total</span>
              <span>{formatRupiah(order.total)}</span>
            </div>
            {order.sn && (
              <div className="tracker-detail-row">
                <span>SN / Token</span>
                <span className="select-all font-semibold">{order.sn}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
