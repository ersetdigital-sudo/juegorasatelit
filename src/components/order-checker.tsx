"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ReceiptText, Search } from "lucide-react";
import { demoOrders, type StoredOrder } from "@/lib/data";
import { formatDateTime, formatRupiah } from "@/lib/format";

function readStoredOrders(): StoredOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("juegora_orders");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function OrderChecker({ showCopy = true }: { showCopy?: boolean }) {
  const [invoice, setInvoice] = useState("");
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);

  function check(value: string) {
    const needle = value.trim().toUpperCase();
    if (!needle) {
      setError("Masukkan nomor invoice terlebih dahulu.");
      setOrder(null);
      setChecked(false);
      return;
    }

    const all = [...readStoredOrders(), ...demoOrders];
    const found = all.find((item) => item.invoice.toUpperCase() === needle);

    if (!found) {
      setOrder(null);
      setError("Invoice tidak ditemukan. Periksa kembali nomor invoice kamu.");
      setChecked(true);
      return;
    }

    setOrder(found);
    setError("");
    setChecked(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    check(invoice);
  }

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
              <CheckCircle2 size={13} /> Status diperbarui otomatis
            </span>
            <span>
              <CheckCircle2 size={13} /> Riwayat tersimpan di perangkat ini
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
              placeholder="Contoh: JSR-2610-0812"
              aria-label="Nomor invoice"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={15} />
            Cek
          </button>
        </form>

        {error && <p className="tracker-error">{error}</p>}

        {checked && order && (
          <div className="tracker-result">
            <div className="tracker-result-head">
              <div>
                <strong>{order.invoice}</strong>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
              <div className={`tracker-status status-${order.status.toLowerCase().replaceAll(" ", "-")}`}>
                {order.status}
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
