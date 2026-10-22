export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function maskNumber(value: string) {
  const clean = value.replace(/\s+/g, "");
  if (clean.length <= 6) return clean;
  return `${clean.slice(0, 4)} ${"•".repeat(Math.max(4, clean.length - 8))} ${clean.slice(-4)}`;
}

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^62/, "0");
  if (digits.length < 4) return digits;
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function isValidPhone(value: string) {
  const phone = value.replace(/\D/g, "").replace(/^62/, "0");
  return /^08\d{8,12}$/.test(phone);
}

export function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `+62${digits}`;
  return digits;
}

export function makeInvoice() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `JSR-${yy}${mm}${dd}-${random}`;
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export function relativeTime(secondsAgo: number) {
  if (secondsAgo < 60) return `${secondsAgo} dtk lalu`;
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} mnt lalu`;
  return `${Math.floor(secondsAgo / 3600)} jam lalu`;
}
