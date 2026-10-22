"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Info,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import {
  detectOperator,
  financeProviders,
  normalizePhone,
  pdamRegions,
  tvProviders,
  wallets,
  type Service,
} from "@/lib/data";
import { formatPhone, formatRupiah } from "@/lib/format";

const PHONE_SERVICES = new Set(["pulsa", "paket-data", "e-wallet"]);
const BILL_SERVICES = new Set(["bpjs", "pdam", "tv-internet", "multifinance"]);

function validateNumber(slug: string, value: string) {
  if (PHONE_SERVICES.has(slug)) {
    return /^08\d{8,12}$/.test(normalizePhone(value));
  }
  if (slug === "bpjs") return /^\d{13}$/.test(value);
  if (slug === "pln") return /^\d{10,13}$/.test(value);
  if (slug === "multifinance") return value.replace(/\s/g, "").length >= 5;
  if (slug === "pdam") return value.length >= 6;
  return value.length >= 6;
}

export function ServiceForm({ service }: { service: Service }) {
  const router = useRouter();
  const productRef = useRef<HTMLElement>(null);
  const isPhone = PHONE_SERVICES.has(service.slug);
  const isBpjs = service.slug === "bpjs";
  const [number, setNumber] = useState("");
  const [productId, setProductId] = useState(service.products[0]?.id ?? "");
  const [months, setMonths] = useState(1);
  const [region, setRegion] = useState("");
  const [provider, setProvider] = useState("");
  const [finance, setFinance] = useState("");
  const [wallet, setWallet] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const product = service.products.find((item) => item.id === productId) ?? service.products[0];
  const operator = isPhone ? detectOperator(number) : undefined;
  const selectedRegion = pdamRegions.find((item) => item.id === region);
  const selectedProvider = tvProviders.find((item) => item.id === provider);
  const selectedFinance = financeProviders.find((item) => item.id === finance);
  const selectedWallet = wallets.find((item) => item.id === wallet);

  const total = useMemo(() => {
    const base = product?.price ?? 0;
    return isBpjs ? base * months : base;
  }, [product, isBpjs, months]);

  const billAmount = useMemo(() => {
    if (!verified || !BILL_SERVICES.has(service.slug)) return null;
    return total;
  }, [verified, service.slug, total]);

  const verificationMeta =
    operator?.name ??
    selectedRegion?.name.split(" — ")[0] ??
    selectedProvider?.name ??
    selectedFinance?.name ??
    selectedWallet?.name ??
    (service.slug === "bpjs" ? "Peserta BPJS" : "Data ditemukan");

  function resetVerification() {
    setVerified(false);
    setVerifyError("");
  }

  function validateEntry() {
    const nextErrors: Record<string, string> = {};

    if (!number.trim()) {
      nextErrors.number =
        service.slug === "multifinance" ? "Nomor kontrak wajib diisi." : "Nomor wajib diisi.";
    } else if (!validateNumber(service.slug, number)) {
      nextErrors.number =
        service.slug === "bpjs"
          ? "Nomor kartu BPJS harus 13 digit."
          : isPhone
            ? "Masukkan nomor HP Indonesia yang valid, contoh 81234567890."
            : "Nomor yang kamu masukkan belum valid. Periksa kembali.";
    }

    if (service.slug === "pdam" && !region) nextErrors.region = "Pilih wilayah PDAM terlebih dahulu.";
    if (service.slug === "tv-internet" && !provider)
      nextErrors.provider = "Pilih penyedia layanan terlebih dahulu.";
    if (service.slug === "multifinance" && !finance)
      nextErrors.finance = "Pilih perusahaan pembiayaan terlebih dahulu.";
    if (service.slug === "e-wallet" && !wallet) nextErrors.wallet = "Pilih dompet digital tujuan.";

    return nextErrors;
  }

  function handleCheck() {
    const nextErrors = validateEntry();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setVerifyError("Lengkapi data tujuan terlebih dahulu.");
      return;
    }

    setErrors({});
    setVerifyError("");
    setChecking(true);
    window.setTimeout(() => {
      setVerified(true);
      setChecking(false);
      if (window.innerWidth < 900) {
        window.setTimeout(() => {
          productRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }, 850);
  }

  function updateNumber(raw: string) {
    let clean: string;
    if (service.slug === "multifinance") {
      clean = raw.replace(/[^0-9A-Za-z ]/g, "").toUpperCase().slice(0, 24);
    } else if (isPhone) {
      clean = raw.replace(/\D/g, "");
      if (clean.startsWith("62")) clean = clean.slice(2);
      if (clean.startsWith("0")) clean = clean.slice(1);
      clean = clean.slice(0, 13);
    } else {
      clean = raw.replace(/\D/g, "").slice(0, 16);
    }
    setNumber(clean);
    resetVerification();
    if (errors.number) setErrors((current) => ({ ...current, number: "" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verified) {
      setVerifyError("Verifikasi nomor tujuan dulu, ya. Tekan “Cek Nomor” di langkah 01.");
      document.getElementById("destination")?.focus();
      return;
    }

    const nextErrors = validateEntry();
    if (!productId) nextErrors.product = "Pilih produk atau nominal terlebih dahulu.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const params = new URLSearchParams();
    params.set("service", service.slug);
    params.set("product", productId);
    params.set("no", isPhone ? normalizePhone(number) : number);
    if (isBpjs) params.set("months", String(months));
    if (selectedRegion) params.set("region", selectedRegion.name);
    if (selectedProvider) params.set("provider", selectedProvider.name);
    if (selectedFinance) params.set("finance", selectedFinance.name);
    if (selectedWallet) params.set("wallet", selectedWallet.name);

    router.push(`/pembayaran?${params.toString()}`);
  }

  const displayNumber = number
    ? isPhone
      ? formatPhone(number)
      : service.slug === "multifinance"
        ? number
        : number.replace(/(\d{4})(?=\d)/g, "$1 ").trim()
    : "Belum diisi";

  return (
    <>
      <CheckoutStepper verified={verified} />
      <div className="detail-layout">
        <form className="detail-form" onSubmit={handleSubmit} noValidate>
          <section className="form-card panel">
            <div className="step-head">
              <span className="step-badge">01</span>
              <div>
                <h2>{service.inputLabel}</h2>
                <span>Pastikan data tujuan sudah benar</span>
              </div>
            </div>

          {service.slug === "pdam" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="region">
                Wilayah PDAM
              </label>
              <div className="select-shell">
                <select
                  id="region"
                  value={region}
                  onChange={(event) => {
                    setRegion(event.target.value);
                    resetVerification();
                    if (errors.region) setErrors((current) => ({ ...current, region: "" }));
                  }}
                  className={errors.region ? "is-error" : ""}
                  aria-invalid={Boolean(errors.region)}
                >
                  <option value="">Pilih wilayah</option>
                  {pdamRegions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.region && <p className="field-error">{errors.region}</p>}
            </div>
          )}

          {service.slug === "tv-internet" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="provider">
                Penyedia layanan
              </label>
              <div className="select-shell">
                <select
                  id="provider"
                  value={provider}
                  onChange={(event) => {
                    setProvider(event.target.value);
                    resetVerification();
                    if (errors.provider) setErrors((current) => ({ ...current, provider: "" }));
                  }}
                  aria-invalid={Boolean(errors.provider)}
                >
                  <option value="">Pilih penyedia</option>
                  {tvProviders.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.provider && <p className="field-error">{errors.provider}</p>}
            </div>
          )}

          {service.slug === "multifinance" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label" htmlFor="finance">
                Perusahaan pembiayaan
              </label>
              <div className="select-shell">
                <select
                  id="finance"
                  value={finance}
                  onChange={(event) => {
                    setFinance(event.target.value);
                    resetVerification();
                    if (errors.finance) setErrors((current) => ({ ...current, finance: "" }));
                  }}
                  aria-invalid={Boolean(errors.finance)}
                >
                  <option value="">Pilih pembiayaan</option>
                  {financeProviders.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown />
              </div>
              {errors.finance && <p className="field-error">{errors.finance}</p>}
            </div>
          )}

          {service.slug === "e-wallet" && (
            <div style={{ marginBottom: 14 }}>
              <label className="field-label">Pilih dompet digital</label>
              <div className="wallet-grid">
                {wallets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`wallet-option ${wallet === item.id ? "is-selected" : ""}`}
                    onClick={() => {
                      setWallet(item.id);
                      if (errors.wallet) setErrors((current) => ({ ...current, wallet: "" }));
                    }}
                  >
                    <img src={item.logo} alt={item.name} />
                    {item.name}
                  </button>
                ))}
              </div>
              {errors.wallet && <p className="field-error">{errors.wallet}</p>}
            </div>
          )}

          <label className="field-label" htmlFor="destination">
            {service.slug === "bpjs"
              ? "Nomor kartu"
              : service.slug === "multifinance"
                ? "Nomor kontrak"
                : isPhone
                  ? "Nomor HP tujuan"
                  : "Nomor tujuan"}
          </label>
          <div className={`field-shell ${errors.number ? "is-error" : ""}`}>
            <span className="field-prefix">{isPhone ? "+62" : service.inputPrefix}</span>
            <input
              id="destination"
              type="text"
              inputMode={isPhone || service.slug !== "multifinance" ? "numeric" : "text"}
              value={number}
              onChange={(event) => updateNumber(event.target.value)}
              placeholder={
                isPhone
                  ? "812 3456 7890"
                  : service.slug === "multifinance"
                    ? "2024 1234 5678"
                    : service.inputPlaceholder.replace(/^Contoh:\s*/i, "")
              }
              autoComplete="off"
              aria-invalid={Boolean(errors.number)}
              aria-describedby="destination-hint"
            />
          </div>
          {errors.number ? (
            <p className="field-error">{errors.number}</p>
          ) : (
            <p className="field-hint" id="destination-hint">
              {service.inputHint}
            </p>
          )}

          {isPhone && operator && (
            <div className="operator-card">
              <span className="operator-logo">
                <img src={operator.logo} alt={`Logo ${operator.name}`} />
              </span>
              <span className="operator-copy">
                <strong>{operator.name}</strong>
                <span>Operator terdeteksi otomatis</span>
              </span>
              <Check className="operator-check" size={14} strokeWidth={3} />
            </div>
          )}

          {isPhone && number.length >= 4 && !operator && (
            <div className="operator-empty">
              <Info size={12} />
              Operator belum dikenali. Periksa kembali awalan nomor HP.
            </div>
          )}

          <div className="verify-area">
            {!verified ? (
              <>
                <button
                  type="button"
                  className="btn btn-check btn-block"
                  onClick={handleCheck}
                  disabled={checking}
                >
                  {checking ? (
                    <Loader2 className="spin" size={16} />
                  ) : (
                    <Search size={15} strokeWidth={2.2} />
                  )}
                  {checking ? "Mengecek nomor…" : "Cek Nomor"}
                </button>
                <p className="verify-note">
                  <ShieldCheck size={11} />
                  Verifikasi data tujuan. Nomor yang valid siap langsung dibayar.
                </p>
                {verifyError && <p className="field-error">{verifyError}</p>}
              </>
            ) : (
              <div className="verification-card">
                <div className="verification-main">
                  <span className="verification-copy">
                    <span className="verification-eyebrow">
                      <BadgeCheck size={12} />
                      Nomor terverifikasi
                    </span>
                    <strong>{displayNumber}</strong>
                    <span>{verificationMeta}</span>
                  </span>
                  <button
                    type="button"
                    className="verify-change"
                    onClick={() => {
                      resetVerification();
                      document.getElementById("destination")?.focus();
                    }}
                  >
                    <RefreshCw size={11} />
                    Ganti
                  </button>
                </div>
                {billAmount !== null && (
                  <div className="bill-preview">
                    <div>
                      <span>
                        {service.slug === "bpjs"
                          ? `Iuran ${months} bulan`
                          : service.slug === "pdam"
                            ? "Tagihan air ditemukan"
                            : service.slug === "tv-internet"
                              ? "Tagihan layanan ditemukan"
                              : "Angsuran ditemukan"}
                      </span>
                      <small>Data berhasil dibaca dari mitra</small>
                    </div>
                    <strong>{formatRupiah(billAmount)}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section
          ref={productRef}
          className={`form-card panel product-step ${verified ? "is-unlocked" : "is-locked"}`}
        >
          <div className="step-head">
            <span className="step-badge">02</span>
            <div>
              <h2>{service.productsLabel}</h2>
              <span>{verified ? "Data terverifikasi — pilih produk" : "Terkunci sampai nomor dicek"}</span>
            </div>
            {verified && (
              <span className="step-check">
                <Check size={10} strokeWidth={3} />
              </span>
            )}
          </div>

          <div className="product-step-body">
            <div className="product-grid">
              {service.products.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`product-card ${productId === item.id ? "is-selected" : ""}`}
                  onClick={() => {
                    setProductId(item.id);
                    if (errors.product) setErrors((current) => ({ ...current, product: "" }));
                  }}
                  aria-pressed={productId === item.id}
                  disabled={!verified}
                >
                  <span className="product-check">
                    <Check size={9} strokeWidth={3} />
                  </span>
                  <span className="product-name">{item.name}</span>
                  <span className="product-detail">{item.detail}</span>
                  <span className="product-price">
                    {formatRupiah(item.price)}
                    {item.oldPrice && (
                      <span className="product-old-price">{formatRupiah(item.oldPrice)}</span>
                    )}
                  </span>
                  {item.badge && <span className="product-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
            {errors.product && <p className="field-error">{errors.product}</p>}

            {isBpjs && (
              <>
                <div className="field-label" style={{ marginTop: 18 }}>
                  Iuran untuk berapa bulan?
                  <span className="optional">Maks. 6 bulan</span>
                </div>
                <div className="month-grid">
                  {Array.from({ length: 6 }).map((_, index) => {
                    const value = index + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={`month-btn ${months === value ? "is-selected" : ""}`}
                        onClick={() => setMonths(value)}
                        aria-pressed={months === value}
                        disabled={!verified}
                      >
                        {value} bln
                        <small>{(product?.price ?? 0) * value > 0 ? "iuran" : ""}</small>
                      </button>
                    );
                  })}
                </div>
                <div className="helper-row">
                  <Info size={11} />
                  Total iuran {months} bulan:{" "}
                  <strong style={{ color: "var(--text)" }}>{formatRupiah(total)}</strong>
                </div>
              </>
            )}
          </div>

          {!verified && (
            <div className="product-lock">
              <span className="product-lock-icon">
                <LockKeyhole size={17} />
              </span>
              <div>
                <strong>Pilih produk setelah nomor terverifikasi</strong>
                <span>Selesaikan langkah 01 untuk membuka pilihan ini.</span>
              </div>
            </div>
          )}
        </section>

        <div className="form-note">
          <ShieldCheck size={13} />
          Data tujuan hanya digunakan untuk memproses transaksi. Pastikan nomor dan nominal sudah
          benar sebelum melanjutkan.
        </div>
      </form>

      <aside className="summary-column">
        <div className="summary-card panel">
          <div className="summary-label">
            <span className="live-dot" />
            Ringkasan pesanan
          </div>

          <div className="summary-product">
            <span className="summary-product-icon">
              <ServiceIcon name={service.icon} size={23} />
            </span>
            <span className="summary-product-copy">
              <strong>{service.name}</strong>
              <span>
                {product?.name ?? "Pilih produk"}
                {isBpjs ? ` · ${months} bulan` : ""}
              </span>
            </span>
          </div>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Nomor tujuan</span>
              <span>{displayNumber}</span>
            </div>
            {isPhone && operator && (
              <div className="summary-row">
                <span>Operator</span>
                <span>{operator.name}</span>
              </div>
            )}
            {selectedRegion && (
              <div className="summary-row">
                <span>Wilayah</span>
                <span>{selectedRegion.name.split(" — ")[0]}</span>
              </div>
            )}
            {selectedProvider && (
              <div className="summary-row">
                <span>Penyedia</span>
                <span>{selectedProvider.name}</span>
              </div>
            )}
            {selectedFinance && (
              <div className="summary-row">
                <span>Pembiayaan</span>
                <span>{selectedFinance.name}</span>
              </div>
            )}
            {selectedWallet && (
              <div className="summary-row">
                <span>Dompet</span>
                <span>{selectedWallet.name}</span>
              </div>
            )}
            {isBpjs && (
              <div className="summary-row">
                <span>Durasi</span>
                <span>{months} bulan</span>
              </div>
            )}
            <div className="summary-row">
              <span>Biaya admin</span>
              <span>Gratis</span>
            </div>
          </div>

          <div className="summary-total">
            <span>Total pembayaran</span>
            <strong>{formatRupiah(total)}</strong>
          </div>

          <div className="summary-cta">
            <button
              type="button"
              className="btn btn-primary btn-block btn-lg"
              onClick={() => {
                const form = document.querySelector(".detail-form") as HTMLFormElement | null;
                form?.requestSubmit();
              }}
              disabled={submitting || !verified}
            >
              {!verified ? (
                <>
                  <LockKeyhole size={16} />
                  Cek Nomor Dulu
                </>
              ) : (
                <>
                  {submitting ? "Memproses…" : "Lanjut Bayar"}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
          {!verified && (
            <p className="summary-lock-note">
              <Info size={10} />
              Verifikasi nomor di langkah 01 untuk melanjutkan ke pembayaran.
            </p>
          )}

          <div className="summary-trust">
            <span>
              <LockKeyhole size={11} />
              Pembayaran aman & terenkripsi
            </span>
            <span>
              <ShieldCheck size={11} />
              Garansi transaksi 100%
            </span>
            <span>
              <Smartphone size={11} />
              Bukti transaksi digital
            </span>
          </div>
        </div>

        <LinkBack />
      </aside>
      </div>
    </>
  );
}

function CheckoutStepper({ verified }: { verified: boolean }) {
  return (
    <div className="checkout-stepper" aria-label="Alur checkout">
      <div className={`checkout-step ${verified ? "is-done" : "is-active"}`}>
        <span className="checkout-step-dot">
          {verified ? <Check size={10} strokeWidth={3} /> : "1"}
        </span>
        <span className="checkout-step-copy">
          <small>Langkah 1</small>
          <strong>Data tujuan</strong>
        </span>
      </div>
      <span className={`checkout-step-line ${verified ? "is-done" : ""}`} />
      <div className={`checkout-step ${verified ? "is-active" : ""}`}>
        <span className="checkout-step-dot">2</span>
        <span className="checkout-step-copy">
          <small>Langkah 2</small>
          <strong>Pilih produk</strong>
        </span>
      </div>
      <span className="checkout-step-line" />
      <div className="checkout-step">
        <span className="checkout-step-dot">3</span>
        <span className="checkout-step-copy">
          <small>Langkah 3</small>
          <strong>Pembayaran</strong>
        </span>
      </div>
    </div>
  );
}

function LinkBack() {
  return (
    <a href="/#layanan" className="back-link">
      ← Kembali ke semua layanan
    </a>
  );
}
