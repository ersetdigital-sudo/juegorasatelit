"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  CreditCard,
  Info,
  Loader2,
  LockKeyhole,
  MessageCircle,
  QrCode,
  ReceiptText,
  ShieldCheck,
  TicketPercent,
  Timer,
  TriangleAlert,
  Wallet,
  X,
} from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import {
  getProduct,
  getService,
  paymentMethods,
  promoCodes,
  type PaymentMethod,
  type PromoCode,
  type StoredOrder,
} from "@/lib/data";
import {
  formatPhone,
  formatRupiah,
  makeInvoice,
} from "@/lib/format";

type Stage = "form" | "invoice";
type Status = "Menunggu pembayaran" | "Diproses";

const TIMER_MS = 15 * 60 * 1000;
const QRIS_IMAGE =
  "https://res.cloudinary.com/dqjh7utdb/image/upload/v1792161327/camhvfeu1lcm0ps8ieiz.jpg";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatRemaining(ms: number) {
  const safe = Math.max(0, ms);
  return `${pad(Math.floor(safe / 60000))}:${pad(Math.floor((safe % 60000) / 1000))}`;
}

export function PaymentClient() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service") ?? "";
  const productId = searchParams.get("product") ?? "";
  const service = getService(serviceSlug);
  const product = getProduct(serviceSlug, productId);
  const number = searchParams.get("no") ?? "";
  const months = Math.min(6, Math.max(1, Number(searchParams.get("months") ?? 1) || 1));
  const region = searchParams.get("region") ?? "";
  const provider = searchParams.get("provider") ?? "";
  const finance = searchParams.get("finance") ?? "";
  const wallet = searchParams.get("wallet") ?? "";

  const [methodId, setMethodId] = useState("qris");
  const [methodTab, setMethodTab] = useState<PaymentMethod["type"]>("qris");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [invoice, setInvoice] = useState("");
  const [createdAt, setCreatedAt] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [remaining, setRemaining] = useState(TIMER_MS);
  const [status, setStatus] = useState<Status>("Menunggu pembayaran");
  const [copied, setCopied] = useState("");

  const method = paymentMethods.find((item) => item.id === methodId) ?? paymentMethods[0];
  const basePrice = (product?.price ?? 0) * (serviceSlug === "bpjs" ? months : 1);
  const discount = appliedPromo
    ? appliedPromo.type === "percent"
      ? Math.min(
          Math.round((basePrice * appliedPromo.value) / 100),
          appliedPromo.maxDiscount ?? Number.POSITIVE_INFINITY,
        )
      : Math.min(appliedPromo.value, basePrice)
    : 0;
  const total = Math.max(0, basePrice + method.fee - discount);
  const expired = stage === "invoice" && remaining <= 0 && status === "Menunggu pembayaran";

  useEffect(() => {
    if (stage !== "invoice") return;
    const interval = window.setInterval(() => {
      setRemaining(Math.max(0, expiresAt - Date.now()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [stage, expiresAt]);

  const phoneDisplay = useMemo(() => {
    if (!number) return "—";
    if (["pulsa", "paket-data", "e-wallet"].includes(serviceSlug)) {
      return formatPhone(number);
    }
    return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }, [number, serviceSlug]);

  if (!service || !product) {
    return (
      <div className="container">
        <div className="order-not-found panel">
          <TriangleAlert size={28} style={{ margin: "0 auto 12px", color: "var(--orange)" }} />
          <h1>Pesanan tidak ditemukan</h1>
          <p>
            Detail pesanan belum lengkap. Silakan pilih layanan dan produk terlebih dahulu dari
            halaman utama.
          </p>
          <Link href="/#layanan" className="btn btn-primary">
            Pilih layanan
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  function changeMethodTab(tab: PaymentMethod["type"]) {
    setMethodTab(tab);
    const first = paymentMethods.find((item) => item.type === tab);
    if (first) setMethodId(first.id);
  }

  function applyPromo(codeOverride?: string) {
    const code = (codeOverride ?? promoInput).trim().toUpperCase();
    setPromoError("");
    if (!code) {
      setPromoError("Masukkan kode promo terlebih dahulu.");
      return;
    }

    const promo = promoCodes.find((item) => item.code === code);
    if (!promo) {
      setPromoError("Kode promo tidak ditemukan.");
      return;
    }
    if (promo.minSpend && basePrice < promo.minSpend) {
      setPromoError(`Minimal transaksi ${formatRupiah(promo.minSpend)} untuk kode ini.`);
      return;
    }

    setApplyingPromo(true);
    window.setTimeout(() => {
      setAppliedPromo(promo);
      setPromoInput(promo.code);
      setApplyingPromo(false);
    }, 450);
  }

  function removePromo() {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoError("");
  }

  function saveOrder(next: StoredOrder) {
    try {
      const raw = window.localStorage.getItem("juegora_orders");
      const existing = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(existing) ? existing : [];
      const withoutDuplicate = list.filter((item: StoredOrder) => item.invoice !== next.invoice);
      window.localStorage.setItem(
        "juegora_orders",
        JSON.stringify([next, ...withoutDuplicate].slice(0, 40)),
      );
    } catch {
      // Penyimpanan lokal tidak tersedia; transaksi tetap berjalan di sesi ini.
    }
  }

  function handlePay(event: FormEvent) {
    event.preventDefault();

    const nextInvoice = makeInvoice();
    const now = Date.now();
    setInvoice(nextInvoice);
    setCreatedAt(now);
    setExpiresAt(now + TIMER_MS);
    setRemaining(TIMER_MS);
    setStage("invoice");
    setStatus("Menunggu pembayaran");

    const order: StoredOrder = {
      invoice: nextInvoice,
      service: service!.name,
      product:
        serviceSlug === "bpjs" ? `${product!.name} · ${months} bulan` : product!.name,
      number: phoneDisplay,
      total,
      method: method.name,
      status: "Menunggu pembayaran",
      createdAt: new Date(now).toISOString(),
    };
    saveOrder(order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyValue(value: string, key: string) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    });
  }

  function confirmPaid() {
    setStatus("Diproses");
    const order: StoredOrder = {
      invoice,
      service: service!.name,
      product:
        serviceSlug === "bpjs" ? `${product!.name} · ${months} bulan` : product!.name,
      number: phoneDisplay,
      total,
      method: method.name,
      status: "Diproses",
      createdAt: new Date(createdAt).toISOString(),
      paidAt: new Date().toISOString(),
    };
    saveOrder(order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const vaNumber = method.type === "va" ? buildVaNumber(invoice || "JSR-0000", method.id) : "";
  const steps =
    method.type === "qris"
      ? [
          "Buka aplikasi m-banking atau e-wallet yang mendukung QRIS.",
          "Pilih menu Scan QR, lalu arahkan kamera ke kode QR di samping.",
          "Periksa nominal dan nama merchant Juegora Satelit, lalu konfirmasi.",
          "Pembayaran otomatis terverifikasi dan pesanan langsung diproses.",
        ]
      : method.type === "ewallet"
        ? [
            `Buka aplikasi ${method.name} di ponsel kamu.`,
            "Pilih menu Bayar atau Scan, lalu masukkan nomor invoice.",
            "Periksa nominal dan konfirmasi pembayaran.",
            "Bukti pembayaran tersimpan otomatis di halaman ini.",
          ]
        : [
            `Buka aplikasi ${method.name.split(" Virtual")[0]} atau ATM terdekat.`,
            "Pilih menu Transfer / Virtual Account.",
            "Masukkan nomor virtual account di samping.",
            "Masukkan nominal persis sesuai total, lalu konfirmasi.",
          ];

  return (
    <div className="payment-page">
      <div className="container">
        <PaymentProgress paid={status === "Diproses"} />

        <div className="payment-layout">
          <div className="payment-main">
            {stage === "form" && (
              <div className="mobile-order-strip panel">
                <span className="mobile-order-strip__icon">
                  <ServiceIcon name={service.icon} size={19} />
                </span>
                <span className="mobile-order-strip__copy">
                  <strong>
                    {product.name}
                    {serviceSlug === "bpjs" ? ` · ${months} bulan` : ""}
                  </strong>
                  <span>{phoneDisplay}</span>
                </span>
                <span className="mobile-order-strip__total">
                  <span>Total</span>
                  <strong>{formatRupiah(total)}</strong>
                </span>
              </div>
            )}

            {stage === "form" ? (
              <form onSubmit={handlePay} noValidate>
                <section className="payment-card panel">
                  <div className="payment-card-head">
                    <div>
                      <h2>Pilih metode pembayaran</h2>
                      <p>Semua metode diproses melalui kanal resmi.</p>
                    </div>
                    <span className="step-badge">01</span>
                  </div>

                  <div className="pay-tabs" role="tablist" aria-label="Jenis metode pembayaran">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={methodTab === "qris"}
                      className={`pay-tab ${methodTab === "qris" ? "is-active" : ""}`}
                      onClick={() => changeMethodTab("qris")}
                    >
                      <QrCode size={13} />
                      QRIS
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={methodTab === "ewallet"}
                      className={`pay-tab ${methodTab === "ewallet" ? "is-active" : ""}`}
                      onClick={() => changeMethodTab("ewallet")}
                    >
                      <Wallet size={13} />
                      E-Wallet
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={methodTab === "va"}
                      className={`pay-tab ${methodTab === "va" ? "is-active" : ""}`}
                      onClick={() => changeMethodTab("va")}
                    >
                      <CreditCard size={13} />
                      Virtual Account
                    </button>
                  </div>

                  <div className="method-panel" key={methodTab}>
                    {methodTab === "qris" ? (
                      <div className="method-group">
                        <div className="method-group-title">
                          <QrCode size={11} />
                          Scan & bayar
                          <span>instan · tanpa biaya admin</span>
                        </div>
                        {paymentMethods
                          .filter((item) => item.type === "qris")
                          .map((item) => (
                            <button
                              type="button"
                              key={item.id}
                              className={`method-option-qris ${methodId === item.id ? "is-selected" : ""}`}
                              onClick={() => setMethodId(item.id)}
                              aria-pressed={methodId === item.id}
                            >
                              <span className="recommend-badge">Disarankan</span>
                              <span className="method-logo">
                                <img src={item.logo} alt={item.name} />
                              </span>
                              <span className="method-copy">
                                <strong>{item.name}</strong>
                                <span>{item.note}</span>
                              </span>
                              <span className="radio-mark">
                                <Check size={9} strokeWidth={3} />
                              </span>
                            </button>
                          ))}
                      </div>
                    ) : (
                      <div className="method-group">
                        <div className="method-group-title">
                          {methodTab === "ewallet" ? <Wallet size={11} /> : <CreditCard size={11} />}
                          {methodTab === "ewallet" ? "E-Wallet" : "Virtual Account"}
                          <span>
                            biaya admin{" "}
                            {methodTab === "ewallet" ? "Rp 1.500" : "Rp 2.500"}
                          </span>
                        </div>
                        <div className="method-grid">
                          {paymentMethods
                            .filter((item) => item.type === methodTab)
                            .map((item) => (
                              <MethodOption
                                key={item.id}
                                item={item}
                                selected={methodId === item.id}
                                onSelect={() => setMethodId(item.id)}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <section className="payment-card panel">
                  <div className="payment-card-head">
                    <div>
                      <h2>Punya kode promo?</h2>
                      <p>Tambahkan potongan harga sebelum membayar.</p>
                    </div>
                    <span className="step-badge">02</span>
                  </div>

                  {appliedPromo ? (
                    <div className="promo-success">
                      <span className="promo-success-icon">
                        <BadgeCheck size={16} />
                      </span>
                      <div>
                        <strong>{appliedPromo.code} berhasil dipakai</strong>
                        <span>{appliedPromo.label}</span>
                      </div>
                      <button type="button" onClick={removePromo} aria-label="Hapus kode promo">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="promo-input-row">
                        <div className="field-shell">
                          <span className="field-prefix">
                            <TicketPercent size={13} />
                          </span>
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(event) => {
                              setPromoInput(event.target.value.toUpperCase());
                              if (promoError) setPromoError("");
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                applyPromo();
                              }
                            }}
                            placeholder="Masukkan kode promo"
                            aria-label="Kode promo"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => applyPromo()}
                          disabled={applyingPromo}
                        >
                          {applyingPromo ? <Loader2 className="spin" size={14} /> : "Pakai"}
                        </button>
                      </div>
                      {promoError && <p className="field-error">{promoError}</p>}
                      <p className="promo-hint">
                        Coba{" "}
                        <button type="button" onClick={() => applyPromo("JUE20")}>
                          JUE20
                        </button>{" "}
                        — diskon 20% maksimal Rp 20.000.
                      </p>
                    </>
                  )}
                </section>

                <div className="payment-disclaimer">
                  <Info size={12} />
                  Dengan menekan tombol bayar, kamu menyetujui syarat & ketentuan Juegora Satelit.
                  Bukti transaksi digital tersedia di halaman invoice.
                </div>

                <div className="pay-button-wrap">
                  <button type="submit" className="btn btn-primary btn-block btn-lg">
                    <LockKeyhole size={16} />
                    Bayar {formatRupiah(total)}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </form>
            ) : (
              <InvoiceView
                service={service}
                productName={
                  serviceSlug === "bpjs" ? `${product.name} · ${months} bulan` : product.name
                }
                invoice={invoice}
                total={total}
                method={method}
                status={status}
                expired={expired}
                remaining={remaining}
                vaNumber={vaNumber}
                steps={steps}
                createdAt={createdAt}
                copied={copied}
                onCopy={copyValue}
                onConfirmPaid={confirmPaid}
              />
            )}
          </div>

          <aside className="summary-column">
            {stage === "invoice" && (
              <div className="timer-card">
                <div className="timer-card-label">
                  <Timer size={11} />
                  {status === "Diproses" ? "Pembayaran terverifikasi" : expired ? "Waktu habis" : "Selesaikan dalam"}
                </div>
                <div className="timer-big">
                  {status === "Diproses" ? "LUNAS" : formatRemaining(expired ? 0 : remaining)}
                  <small>{status === "Diproses" ? "" : "menit"}</small>
                </div>
                <div className="timer-progress">
                  <span
                    style={{
                      width:
                        status === "Diproses"
                          ? "100%"
                          : `${Math.max(0, Math.min(100, (remaining / TIMER_MS) * 100))}%`,
                    }}
                  />
                </div>
                <p className="simulation-note">
                  <Info size={10} />
                  {status === "Diproses"
                    ? "Pembayaran diterima, pesanan sedang diproses."
                    : "Selesaikan pembayaran sebelum waktu habis"}
                </p>
              </div>
            )}

            <div className="summary-card panel">
              <div className="summary-label">
                <ReceiptText size={11} />
                Ringkasan pesanan
              </div>

              <div className="summary-product">
                <span className="summary-product-icon">
                  <ServiceIcon name={service.icon} size={23} />
                </span>
                <span className="summary-product-copy">
                  <strong>{service.name}</strong>
                  <span>
                    {product.name}
                    {serviceSlug === "bpjs" ? ` · ${months} bulan` : ""}
                  </span>
                </span>
              </div>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Nomor tujuan</span>
                  <span>{phoneDisplay}</span>
                </div>
                <div className="summary-row">
                  <span>Harga produk</span>
                  <span>{formatRupiah(basePrice)}</span>
                </div>
                <div className="summary-row">
                  <span>Metode</span>
                  <span>{method.name}</span>
                </div>
                <div className="summary-row">
                  <span>Biaya admin</span>
                  <span>{method.fee === 0 ? "Gratis" : formatRupiah(method.fee)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row summary-discount">
                    <span>Diskon promo</span>
                    <span>-{formatRupiah(discount)}</span>
                  </div>
                )}
                {appliedPromo && (
                  <div className="summary-row summary-promo-code">
                    <span>Kode promo</span>
                    <span>{appliedPromo.code}</span>
                  </div>
                )}
                {region && (
                  <div className="summary-row">
                    <span>Wilayah</span>
                    <span>{region.split(" — ")[0]}</span>
                  </div>
                )}
                {provider && (
                  <div className="summary-row">
                    <span>Penyedia</span>
                    <span>{provider}</span>
                  </div>
                )}
                {finance && (
                  <div className="summary-row">
                    <span>Pembiayaan</span>
                    <span>{finance}</span>
                  </div>
                )}
                {wallet && (
                  <div className="summary-row">
                    <span>Dompet</span>
                    <span>{wallet}</span>
                  </div>
                )}
              </div>

              <div className="summary-total">
                <span>Total pembayaran</span>
                <strong>{formatRupiah(total)}</strong>
              </div>

              {stage === "invoice" ? (
                <div className="summary-cta">
                  <button
                    type="button"
                    className="btn btn-ghost btn-block"
                    onClick={confirmPaid}
                    disabled={status === "Diproses" || expired}
                  >
                    <CheckCircle2 size={15} />
                    {status === "Diproses" ? "Sudah dibayar" : "Saya sudah bayar"}
                  </button>
                </div>
              ) : (
                <div className="pay-summary-badge">
                  <ShieldCheck size={12} />
                  Pembayaran diverifikasi otomatis. Total sudah termasuk biaya admin.
                </div>
              )}

              <div className="summary-trust">
                <span>
                  <LockKeyhole size={11} />
                  Transaksi terenkripsi
                </span>
                <span>
                  <MessageCircle size={11} />
                  Bukti transaksi digital
                </span>
                <span>
                  <ShieldCheck size={11} />
                  Garansi 100%
                </span>
              </div>
            </div>

            <Link href={`/layanan/${service.slug}`} className="back-link">
              ← Ubah detail pesanan
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PaymentProgress({ paid }: { paid: boolean }) {
  return (
    <div className="payment-progress" aria-label="Langkah pembayaran">
      <div className="progress-step is-done">
        <span className="dot">
          <Check size={10} strokeWidth={3} />
        </span>
        Detail pesanan
      </div>
      <span className="progress-line" />
      <div className={`progress-step ${paid ? "is-done" : "is-active"}`}>
        <span className="dot">{paid ? <Check size={10} strokeWidth={3} /> : "2"}</span>
        Pembayaran
      </div>
      <span className="progress-line" />
      <div className={`progress-step ${paid ? "is-active" : ""}`}>
        <span className="dot">3</span>
        Selesai
      </div>
    </div>
  );
}

function MethodOption({
  item,
  selected,
  onSelect,
}: {
  item: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`method-option ${selected ? "is-selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="method-logo">
        <img src={item.logo} alt={item.name} />
      </span>
      <span className="method-copy">
        <strong>{item.name}</strong>
        <span>{item.note}</span>
      </span>
      <span className="radio-mark">
        <Check size={9} strokeWidth={3} />
      </span>
    </button>
  );
}

function InvoiceView({
  service,
  productName,
  invoice,
  total,
  method,
  status,
  expired,
  remaining,
  vaNumber,
  steps,
  createdAt,
  copied,
  onCopy,
  onConfirmPaid,
}: {
  service: ReturnType<typeof getService>;
  productName: string;
  invoice: string;
  total: number;
  method: PaymentMethod;
  status: Status;
  expired: boolean;
  remaining: number;
  vaNumber: string;
  steps: string[];
  createdAt: number;
  copied: string;
  onCopy: (value: string, key: string) => void;
  onConfirmPaid: () => void;
}) {
  if (!service) return null;
  const paid = status === "Diproses";

  return (
    <>
      <section className="invoice-card panel">
        <div className="invoice-top">
          <span className={`status-chip ${paid ? "is-paid" : ""}`}>
            <span className="live-dot" />
            {paid ? "Pembayaran diterima" : expired ? "Kedaluwarsa" : "Menunggu pembayaran"}
          </span>
          {!paid && (
            <span className="timer-mini">
              <Timer size={12} />
              Sisa waktu <strong>{formatRemaining(expired ? 0 : remaining)}</strong>
            </span>
          )}
        </div>

        <div className="invoice-label">Nomor invoice</div>
        <div className="invoice-number-row">
          <span className="invoice-number">{invoice}</span>
          <button
            type="button"
            className={`copy-btn ${copied === "invoice" ? "is-copied" : ""}`}
            onClick={() => onCopy(invoice, "invoice")}
          >
            {copied === "invoice" ? <Check size={10} /> : <Copy size={10} />}
            {copied === "invoice" ? "Tersalin" : "Salin"}
          </button>
        </div>

        <div className="invoice-total">
          <span>Total pembayaran</span>
          <strong>{formatRupiah(total)}</strong>
        </div>

        <div className="invoice-body">
          {method.type === "qris" && (
            <div className="qr-wrap">
              <img className="qr-image" src={QRIS_IMAGE} alt="Kode QRIS Juegora Satelit" />
              <span>Scan dengan app m-banking atau e-wallet kamu</span>
            </div>
          )}

          {method.type === "va" && (
            <div className="va-box">
              <span className="method-logo">
                <img src={method.logo} alt={method.name} />
              </span>
              <div className="va-label">Nomor Virtual Account</div>
              <div className="va-number-row">
                <span className="va-number">{vaNumber}</span>
                <button
                  type="button"
                  className={`copy-btn ${copied === "va" ? "is-copied" : ""}`}
                  onClick={() => onCopy(vaNumber, "va")}
                >
                  {copied === "va" ? <Check size={10} /> : <Copy size={10} />}
                  {copied === "va" ? "Tersalin" : "Salin"}
                </button>
              </div>
              <p className="simulation-note">
                <Info size={10} />
                Transfer tepat {formatRupiah(total)} agar otomatis terverifikasi.
              </p>
            </div>
          )}

          {method.type === "ewallet" && (
            <div className="va-box">
              <span className="method-logo">
                <img src={method.logo} alt={method.name} />
              </span>
              <div className="va-label">Pembayaran via</div>
              <div className="va-number-row">
                <span className="va-number">{method.name}</span>
              </div>
              <p className="simulation-note">
                <MessageCircle size={10} />
                Buka aplikasi {method.name}, lalu selesaikan pembayaran sebelum waktu habis.
              </p>
            </div>
          )}

          <div>
            <div className="summary-row">
              <span>Layanan</span>
              <span>{service.name}</span>
            </div>
            <div className="summary-row">
              <span>Produk</span>
              <span>{productName}</span>
            </div>
            <div className="summary-row">
              <span>Metode</span>
              <span>{method.name}</span>
            </div>
            <div className="summary-row">
              <span>Dibuat</span>
              <span>
                {new Intl.DateTimeFormat("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                }).format(new Date(createdAt))}{" "}
                WIB
              </span>
            </div>
          </div>
        </div>

        {paid ? (
          <div className="instructions">
            <h3>Terima kasih, pembayaran Anda sedang diproses</h3>
            <p className="wa-note" style={{ marginTop: 0 }}>
              <CheckCircle2 size={12} color="var(--success)" />
              Pembayaran kamu sudah kami terima. Pesanan sedang diproses dan diteruskan ke mitra
              layanan. Bukti transaksi digital tersimpan di halaman ini.
            </p>
          </div>
        ) : (
          <div className="instructions">
            <h3>Instruksi pembayaran</h3>
            <ol>
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className={`order-timeline ${paid ? "is-paid" : ""}`}>
          <div className={`order-timeline-step ${paid ? "is-done" : "is-active"}`}>
            <span className="order-timeline-dot">
              {paid ? <Check size={10} strokeWidth={3} /> : "1"}
            </span>
            <span className="order-timeline-copy">
              <strong>Pembayaran</strong>
              <span>
                {paid ? "Pembayaran diterima" : expired ? "Waktu pembayaran habis" : "Menunggu pembayaran"}
              </span>
            </span>
          </div>
          <div className={`order-timeline-step ${paid ? "is-active" : ""}`}>
            <span className="order-timeline-dot">2</span>
            <span className="order-timeline-copy">
              <strong>Pesanan diproses</strong>
              <span>{paid ? "Diteruskan ke mitra layanan" : "Akan diproses setelah bayar"}</span>
            </span>
          </div>
          <div className="order-timeline-step">
            <span className="order-timeline-dot">3</span>
            <span className="order-timeline-copy">
              <strong>Selesai</strong>
              <span>Estimasi 1–5 menit setelah pembayaran</span>
            </span>
          </div>
        </div>

        <div className="invoice-actions">
          {!paid && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onConfirmPaid}
              disabled={expired}
            >
              <CheckCircle2 size={15} />
              {expired ? "Waktu habis" : "Saya sudah bayar"}
            </button>
          )}
          <Link href="/cek-transaksi" className="btn btn-ghost">
            <ReceiptText size={15} />
            Cek status pesanan
          </Link>
        </div>
      </section>

      <p className="detail-focus-note">
        <CircleAlert size={12} />
        Simpan halaman ini. Nomor invoice dan bukti transaksi kamu tersimpan di perangkat ini dan
        bisa dicek kembali kapan saja.
      </p>
    </>
  );
}

function buildVaNumber(invoice: string, methodId: string) {
  const prefixes: Record<string, string> = {
    bca: "8277",
    bri: "8888",
    mandiri: "8950",
    bni: "9888",
  };
  const digits = invoice.replace(/\D/g, "").slice(-10) || "1020260000";
  return `${prefixes[methodId] ?? "8000"}${digits}`;
}
