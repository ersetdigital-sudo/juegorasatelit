"use client";

import Link from "next/link";
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
import type { Product, Service } from "@/lib/data";
import { formatPhone, formatRupiah } from "@/lib/format";
import { checkVoucher, createOrder, getPayment } from "@/lib/db/client";
import { toPublicError } from "@/lib/db/errors";
import type { PaymentInfo } from "@/lib/db/types";

type Stage = "form" | "invoice";
type Status = "Menunggu pembayaran" | "Diproses";

type CheckoutMethod = {
  id: string;
  name: string;
  fee: number;
  type: "qr" | "ewallet" | "va";
};

type AppliedVoucher = {
  code: string;
  potongan: number;
  label: string;
};

const METHOD_LOGOS: Record<string, string> = {
  QRIS: "/images/payments/qris.png",
  DANA: "/images/payments/dana.svg",
  OVO: "/images/payments/ovo.svg",
  GoPay: "/images/payments/gopay.png",
  ShopeePay: "/images/payments/shopeepay.svg",
  "BCA Virtual Account": "/images/payments/bca.svg",
  "BRI Virtual Account": "/images/payments/bri.svg",
  "Mandiri Virtual Account": "/images/payments/mandiri.svg",
  "BNI Virtual Account": "/images/payments/bni.svg",
};

function methodLogo(name: string) {
  return METHOD_LOGOS[name] ?? "/images/payments/qris.png";
}

function methodNote(name: string) {
  return name === "QRIS"
    ? "Scan sekali, semua e-wallet & m-banking"
    : `Bayar lewat ${name}`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatRemaining(ms: number) {
  const safe = Math.max(0, ms);
  return `${pad(Math.floor(safe / 60000))}:${pad(Math.floor((safe % 60000) / 1000))}`;
}

export function PaymentClient({
  service,
  product,
  dbServiceId,
  dbProductId,
  brandSlug,
  methods,
  qrisImageUrl,
  number,
  months,
  region,
  provider,
  finance,
  wallet,
}: {
  service: Service | null;
  product: Product | null;
  dbServiceId: string | null;
  dbProductId: string | null;
  brandSlug: string;
  methods: CheckoutMethod[];
  qrisImageUrl: string | null;
  number: string;
  months: number;
  region: string;
  provider: string;
  finance: string;
  wallet: string;
}) {
  const serviceSlug = service?.slug ?? "";
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const [methodTab, setMethodTab] = useState<CheckoutMethod["type"]>(
    methods[0]?.type ?? "qr",
  );
  const [promoInput, setPromoInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null);
  const [promoError, setPromoError] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [invoice, setInvoice] = useState("");
  const [createdAt, setCreatedAt] = useState<number>(0);
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [remaining, setRemaining] = useState(0);
  const [status, setStatus] = useState<Status>("Menunggu pembayaran");
  const [copied, setCopied] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paymentDetail, setPaymentDetail] = useState<PaymentInfo | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const method = methods.find((item) => item.id === methodId) ?? methods[0];
  const availableTabs = useMemo(
    () => Array.from(new Set(methods.map((item) => item.type))),
    [methods],
  );
  const basePrice = product?.price ?? 0;
  const discount = appliedVoucher?.potongan ?? 0;
  const total = Math.max(0, basePrice + (method?.fee ?? 0) - discount);
  const displayTotal = stage === "invoice" && orderTotal > 0 ? orderTotal : total;
  const totalWindow = Math.max(1, expiresAt - createdAt);
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

  if (!service || !product || !method) {
    return (
      <div className="container">
        <div className="order-not-found panel">
          <TriangleAlert size={28} style={{ margin: "0 auto 12px", color: "var(--orange)" }} />
          <h1>Pesanan tidak ditemukan</h1>
          <p>
            Detail pesanan atau metode pembayaran belum lengkap. Silakan pilih layanan dan produk
            terlebih dahulu dari halaman utama.
          </p>
          <Link href="/#layanan" className="btn btn-primary">
            Pilih layanan
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  function changeMethodTab(tab: CheckoutMethod["type"]) {
    setMethodTab(tab);
    const first = methods.find((item) => item.type === tab);
    if (first) setMethodId(first.id);
  }

  async function applyPromo(codeOverride?: string) {
    const code = (codeOverride ?? promoInput).trim().toUpperCase();
    setPromoError("");
    if (!code) {
      setPromoError("Masukkan kode promo terlebih dahulu.");
      return;
    }
    if (!dbServiceId) {
      setPromoError("Pembayaran belum tersedia. Coba lagi sebentar.");
      return;
    }

    setApplyingPromo(true);
    try {
      const result = await checkVoucher({
        brandSlug,
        code,
        serviceId: dbServiceId,
        subtotal: basePrice,
      });
      if (!result.valid) {
        setPromoError(result.pesan || "Kode promo tidak valid.");
        return;
      }
      setAppliedVoucher({
        code,
        potongan: result.potongan,
        label: `Potongan ${formatRupiah(result.potongan)}`,
      });
      setPromoInput(code);
    } catch (error) {
      setPromoError(toPublicError(error).message);
    } finally {
      setApplyingPromo(false);
    }
  }

  function removePromo() {
    setAppliedVoucher(null);
    setPromoInput("");
    setPromoError("");
  }

  async function handlePay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !service ||
      !product ||
      !method ||
      !dbServiceId ||
      !dbProductId ||
      !brandSlug ||
      !number.trim()
    ) {
      setPayError("Pembayaran belum tersedia. Periksa kembali data pesanan.");
      return;
    }

    setPayError("");
    setPaying(true);
    try {
      const input: Record<string, string> = { nomor_tujuan: number };
      if (months > 1) input.months = String(months);
      if (region) input.region = region;
      if (provider) input.provider = provider;
      if (finance) input.finance = finance;
      if (wallet) input.wallet = wallet;

      const created = await createOrder({
        brandSlug,
        serviceId: dbServiceId,
        productId: dbProductId,
        nomorTujuan: number,
        input,
        paymentMethodId: method.id,
        voucherCode: appliedVoucher?.code ?? null,
      });

      let detail: PaymentInfo | null = null;
      try {
        detail = await getPayment(created.ref);
      } catch {
        detail = null;
      }

      const end = new Date(created.expires_at).getTime();
      setPaymentDetail(detail);
      setOrderTotal(detail?.total ?? created.total);
      setInvoice(created.ref);
      setCreatedAt(detail?.created_at ? new Date(detail.created_at).getTime() : Date.now());
      setExpiresAt(end);
      setRemaining(Math.max(0, end - Date.now()));
      setStage("invoice");
      setStatus("Menunggu pembayaran");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setPayError(toPublicError(error).message);
    } finally {
      setPaying(false);
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const vaNumber = method.type === "va" ? buildVaNumber(invoice || "JGS-0000", method.id) : "";
  const steps =
    method.type === "qr"
      ? [
          "Buka aplikasi m-banking atau e-wallet yang mendukung QRIS.",
          "Pilih menu Scan QR, lalu arahkan kamera ke kode QR di samping.",
          "Periksa nominal dan nama merchant Juegora Satelit, lalu konfirmasi.",
          "Setelah kamu konfirmasi, admin mencocokkan pembayaran lalu memproses pesanan.",
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
                    {availableTabs.includes("qr") && (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={methodTab === "qr"}
                        className={`pay-tab ${methodTab === "qr" ? "is-active" : ""}`}
                        onClick={() => changeMethodTab("qr")}
                      >
                        <QrCode size={13} />
                        QRIS
                      </button>
                    )}
                    {availableTabs.includes("ewallet") && (
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
                    )}
                    {availableTabs.includes("va") && (
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
                    )}
                  </div>

                  <div className="method-panel" key={methodTab}>
                    {methodTab === "qr" ? (
                      <div className="method-group">
                        <div className="method-group-title">
                          <QrCode size={11} />
                          Scan & bayar
                          <span>instan · tanpa biaya admin</span>
                        </div>
                        {methods
                          .filter((item) => item.type === "qr")
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
                                <img src={methodLogo(item.name)} alt={item.name} />
                              </span>
                              <span className="method-copy">
                                <strong>{item.name}</strong>
                                <span>{methodNote(item.name)}</span>
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
                            {formatRupiah(
                              methods.find((item) => item.type === methodTab)?.fee ?? 0,
                            )}
                          </span>
                        </div>
                        <div className="method-grid">
                          {methods
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

                  {appliedVoucher ? (
                    <div className="promo-success">
                      <span className="promo-success-icon">
                        <BadgeCheck size={16} />
                      </span>
                      <div>
                        <strong>{appliedVoucher.code} berhasil dipakai</strong>
                        <span>{appliedVoucher.label}</span>
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
                                void applyPromo();
                              }
                            }}
                            placeholder="Masukkan kode promo"
                            aria-label="Kode promo"
                          />
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => void applyPromo()}
                          disabled={applyingPromo}
                        >
                          {applyingPromo ? <Loader2 className="spin" size={14} /> : "Pakai"}
                        </button>
                      </div>
                      {promoError && <p className="field-error">{promoError}</p>}
                      <p className="promo-hint">
                        Coba{" "}
                        <button type="button" onClick={() => void applyPromo("JUE20")}>
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
                  <button
                    type="submit"
                    className="btn btn-primary btn-block btn-lg"
                    disabled={paying}
                  >
                    {paying ? (
                      <Loader2 className="spin" size={16} />
                    ) : (
                      <LockKeyhole size={16} />
                    )}
                    {paying ? "Memproses…" : `Bayar ${formatRupiah(total)}`}
                    {!paying && <ArrowRight size={17} />}
                  </button>
                  {payError && (
                    <p className="field-error" role="alert">
                      {payError}
                    </p>
                  )}
                </div>
              </form>
            ) : (
              <InvoiceView
                service={service}
                productName={
                  serviceSlug === "bpjs" ? `${product.name} · ${months} bulan` : product.name
                }
                invoice={invoice}
                total={displayTotal}
                method={method}
                status={status}
                expired={expired}
                remaining={remaining}
                vaNumber={vaNumber}
                steps={steps}
                createdAt={createdAt}
                copied={copied}
                qrisImageUrl={paymentDetail?.qris_image_url ?? qrisImageUrl}
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
                  {status === "Diproses" ? "Pembayaran dicek admin" : expired ? "Waktu habis" : "Selesaikan dalam"}
                </div>
                <div className="timer-big">
                  {status === "Diproses" ? "DIPROSES" : formatRemaining(expired ? 0 : remaining)}
                  <small>{status === "Diproses" ? "" : "menit"}</small>
                </div>
                <div className="timer-progress">
                  <span
                    style={{
                      width:
                        status === "Diproses"
                          ? "100%"
                          : `${Math.max(0, Math.min(100, (remaining / totalWindow) * 100))}%`,
                    }}
                  />
                </div>
                <p className="simulation-note">
                  <Info size={10} />
                  {status === "Diproses"
                    ? "Pembayaran sedang diperiksa admin."
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
                {appliedVoucher && (
                  <div className="summary-row summary-promo-code">
                    <span>Kode promo</span>
                    <span>{appliedVoucher.code}</span>
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
                <strong>{formatRupiah(displayTotal)}</strong>
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
                    {status === "Diproses" ? "Sedang dicek admin" : "Saya sudah bayar"}
                  </button>
                </div>
              ) : (
                <div className="pay-summary-badge">
                  <ShieldCheck size={12} />
                  Pembayaran diverifikasi admin. Total sudah termasuk biaya admin.
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
  item: CheckoutMethod;
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
        <img src={methodLogo(item.name)} alt={item.name} />
      </span>
      <span className="method-copy">
        <strong>{item.name}</strong>
        <span>{methodNote(item.name)}</span>
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
  qrisImageUrl,
  onCopy,
  onConfirmPaid,
}: {
  service: Service | null;
  productName: string;
  invoice: string;
  total: number;
  method: CheckoutMethod;
  status: Status;
  expired: boolean;
  remaining: number;
  vaNumber: string;
  steps: string[];
  createdAt: number;
  copied: string;
  qrisImageUrl: string | null;
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
            {paid ? "Menunggu verifikasi admin" : expired ? "Kedaluwarsa" : "Menunggu pembayaran"}
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
          {method.type === "qr" && (
            <div className="qr-wrap">
              {qrisImageUrl ? (
                <img className="qr-image" src={qrisImageUrl} alt="Kode QRIS Juegora Satelit" />
              ) : (
                <p className="simulation-note">Kode QRIS belum tersedia. Hubungi CS.</p>
              )}
              <span>Scan dengan app m-banking atau e-wallet kamu</span>
            </div>
          )}

          {method.type === "va" && (
            <div className="va-box">
              <span className="method-logo">
                <img src={methodLogo(method.name)} alt={method.name} />
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
                Transfer tepat {formatRupiah(total)} sesuai nominal invoice.
              </p>
            </div>
          )}

          {method.type === "ewallet" && (
            <div className="va-box">
              <span className="method-logo">
                <img src={methodLogo(method.name)} alt={method.name} />
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
            <h3>Terima kasih, pembayaran sedang diperiksa admin</h3>
            <p className="wa-note" style={{ marginTop: 0 }}>
              <CheckCircle2 size={12} color="var(--success)" />
              Konfirmasi kamu sudah kami terima. Admin akan mencocokkan pembayaran sebelum layanan
              diproses. Status terbaru bisa dicek lewat halaman Cek Pesanan.
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
                {paid ? "Pembayaran dicek admin" : expired ? "Waktu pembayaran habis" : "Menunggu pembayaran"}
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
        Simpan nomor invoice ini. Status pembayaran dan bukti transaksi bisa dicek kembali kapan
        saja lewat halaman Cek Pesanan.
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
