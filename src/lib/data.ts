export type ServiceIconName =
  | "bolt"
  | "phone"
  | "wifi"
  | "droplet"
  | "shield"
  | "tv"
  | "wallet"
  | "car";

export type CategoryId =
  | "semua"
  | "listrik"
  | "pulsa-data"
  | "tagihan"
  | "e-wallet"
  | "cicilan";

export type Product = {
  id: string;
  name: string;
  detail: string;
  price: number;
  oldPrice?: number;
  badge?: string;
};

export type Service = {
  slug: string;
  name: string;
  navName: string;
  category: Exclude<CategoryId, "semua">;
  icon: ServiceIconName;
  kicker: string;
  description: string;
  longDescription: string;
  inputLabel: string;
  inputPlaceholder: string;
  inputHint: string;
  inputPrefix?: string;
  fromPrice: number;
  productsLabel: string;
  products: Product[];
  tags: string[];
};

export const categories: { id: CategoryId; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "listrik", label: "Listrik" },
  { id: "pulsa-data", label: "Pulsa & Data" },
  { id: "tagihan", label: "Tagihan" },
  { id: "e-wallet", label: "E-Wallet" },
  { id: "cicilan", label: "Cicilan" },
];

export const services: Service[] = [
  {
    slug: "pln",
    name: "Token & Tagihan PLN",
    navName: "PLN",
    category: "listrik",
    icon: "bolt",
    kicker: "Listrik prabayar & pascabayar",
    description: "Isi token listrik atau bayar tagihan PLN dalam hitungan detik.",
    longDescription:
      "Beli token listrik prabayar atau lunasi tagihan listrik pascabayar. Token dan bukti pembayaran langsung dikirim, tanpa perlu antre.",
    inputLabel: "ID Pelanggan / Nomor Meter",
    inputPlaceholder: "Contoh: 512345678901",
    inputHint: "Masukkan 11–12 digit ID pelanggan atau nomor meter yang tertera di meteran.",
    inputPrefix: "ID",
    fromPrice: 20500,
    productsLabel: "Pilih nominal",
    tags: ["Token instan", "Tagihan pascabayar", "Tersedia 24 jam"],
    products: [
      { id: "pln-20", name: "Token 20.000", detail: "± 13,7 kWh", price: 20500 },
      { id: "pln-50", name: "Token 50.000", detail: "± 34,3 kWh", price: 51000 },
      {
        id: "pln-100",
        name: "Token 100.000",
        detail: "± 68,6 kWh",
        price: 101000,
        badge: "Terpopuler",
      },
      { id: "pln-200", name: "Token 200.000", detail: "± 137,2 kWh", price: 201500 },
      { id: "pln-500", name: "Token 500.000", detail: "± 343 kWh", price: 502000 },
      { id: "pln-1000", name: "Token 1.000.000", detail: "± 686 kWh", price: 1003000 },
    ],
  },
  {
    slug: "pulsa",
    name: "Pulsa Semua Operator",
    navName: "Pulsa",
    category: "pulsa-data",
    icon: "phone",
    kicker: "Pulsa reguler & transfer",
    description: "Pulsa semua operator, langsung masuk ke nomor tujuan.",
    longDescription:
      "Isi pulsa Telkomsel, Indosat, XL, Axis, Tri, dan Smartfren. Nomor tujuan dideteksi otomatis supaya tidak salah operator.",
    inputLabel: "Nomor HP Tujuan",
    inputPlaceholder: "Contoh: 0812 3456 7890",
    inputHint: "Operator akan terdeteksi otomatis dari awalan nomor HP kamu.",
    inputPrefix: "+62",
    fromPrice: 6500,
    productsLabel: "Pilih nominal pulsa",
    tags: ["Semua operator", "Deteksi otomatis", "Proses instan"],
    products: [
      { id: "pulsa-5", name: "Pulsa 5.000", detail: "Masa aktif +3 hari", price: 6500 },
      { id: "pulsa-10", name: "Pulsa 10.000", detail: "Masa aktif +7 hari", price: 11500 },
      {
        id: "pulsa-25",
        name: "Pulsa 25.000",
        detail: "Masa aktif +15 hari",
        price: 26000,
        badge: "Terlaris",
      },
      { id: "pulsa-50", name: "Pulsa 50.000", detail: "Masa aktif +30 hari", price: 51000 },
      { id: "pulsa-100", name: "Pulsa 100.000", detail: "Masa aktif +60 hari", price: 101000 },
      { id: "pulsa-200", name: "Pulsa 200.000", detail: "Masa aktif +90 hari", price: 201000 },
    ],
  },
  {
    slug: "paket-data",
    name: "Paket Data Internet",
    navName: "Paket Data",
    category: "pulsa-data",
    icon: "wifi",
    kicker: "Kuota internet semua operator",
    description: "Kuota internet harian, mingguan, dan bulanan untuk semua operator.",
    longDescription:
      "Pilih paket data sesuai kebutuhan. Kuota utama dan masa aktif langsung ditambahkan ke nomor tujuan.",
    inputLabel: "Nomor HP Tujuan",
    inputPlaceholder: "Contoh: 0857 1234 5678",
    inputHint: "Operator akan terdeteksi otomatis dari awalan nomor HP kamu.",
    inputPrefix: "+62",
    fromPrice: 15000,
    productsLabel: "Pilih paket internet",
    tags: ["Kuota utama", "Semua operator", "Aktif otomatis"],
    products: [
      { id: "data-1", name: "1 GB / 7 hari", detail: "Kuota utama 24 jam", price: 15000 },
      { id: "data-3", name: "3 GB / 30 hari", detail: "Kuota utama 24 jam", price: 35000 },
      {
        id: "data-8",
        name: "8 GB / 30 hari",
        detail: "Kuota utama 24 jam",
        price: 65000,
        badge: "Favorit",
      },
      { id: "data-15", name: "15 GB / 30 hari", detail: "Kuota utama 24 jam", price: 95000 },
      { id: "data-25", name: "25 GB / 30 hari", detail: "Kuota utama 24 jam", price: 135000 },
      { id: "data-50", name: "50 GB / 30 hari", detail: "Kuota utama 24 jam", price: 195000 },
    ],
  },
  {
    slug: "bpjs",
    name: "Iuran BPJS Kesehatan",
    navName: "BPJS",
    category: "tagihan",
    icon: "shield",
    kicker: "Bayar iuran keluarga",
    description: "Bayar iuran BPJS Kesehatan untuk 1 sampai 6 bulan sekaligus.",
    longDescription:
      "Lunasi iuran BPJS Kesehatan tanpa antre. Pilih kelas peserta dan jumlah bulan, lalu bayar untuk seluruh anggota keluarga sekaligus.",
    inputLabel: "Nomor Kartu BPJS",
    inputPlaceholder: "Contoh: 0001234567890",
    inputHint: "Masukkan 13 digit nomor kartu BPJS Kesehatan.",
    inputPrefix: "BPJS",
    fromPrice: 35000,
    productsLabel: "Pilih kelas peserta",
    tags: ["1–6 bulan", "Kelas 1–3", "Pembayaran aman"],
    products: [
      { id: "bpjs-3", name: "Kelas 3", detail: "Rp 35.000 / bulan", price: 35000 },
      { id: "bpjs-2", name: "Kelas 2", detail: "Rp 100.000 / bulan", price: 100000 },
      { id: "bpjs-1", name: "Kelas 1", detail: "Rp 150.000 / bulan", price: 150000 },
    ],
  },
  {
    slug: "pdam",
    name: "Tagihan Air PDAM",
    navName: "PDAM",
    category: "tagihan",
    icon: "droplet",
    kicker: "Bayar tagihan air",
    description: "Cek dan bayar tagihan air PDAM di berbagai wilayah Indonesia.",
    longDescription:
      "Bayar tagihan air PDAM tanpa datang ke kantor. Pilih wilayah, masukkan nomor pelanggan, dan selesaikan pembayaran dari rumah.",
    inputLabel: "Nomor Pelanggan PDAM",
    inputPlaceholder: "Contoh: 123456789",
    inputHint: "Nomor pelanggan dapat dilihat pada tagihan atau meter air.",
    inputPrefix: "PDAM",
    fromPrice: 87500,
    productsLabel: "Pilih jenis tagihan",
    tags: ["Berbagai wilayah", "Tagihan & tunggakan", "Bukti resmi"],
    products: [
      { id: "pdam-ini", name: "Tagihan Bulan Ini", detail: "Pemakaian ± 18 m³", price: 87500 },
      { id: "pdam-tunggak", name: "Tagihan + Tunggakan", detail: "2 bulan terakhir", price: 154000 },
      { id: "pdam-pasang", name: "Sambungan Baru", detail: "Biaya administrasi", price: 250000 },
    ],
  },
  {
    slug: "tv-internet",
    name: "TV & Internet Rumah",
    navName: "TV Internet",
    category: "tagihan",
    icon: "tv",
    kicker: "IndiHome, Biznet & lainnya",
    description: "Bayar tagihan internet rumah dan TV kabel dengan mudah.",
    longDescription:
      "Bayar tagihan IndiHome, Biznet, First Media, dan penyedia internet rumah lainnya. Masukkan nomor pelanggan, pembayaran langsung diproses.",
    inputLabel: "Nomor Pelanggan / ID Pelanggan",
    inputPlaceholder: "Contoh: 122345678901",
    inputHint: "Bisa menggunakan nomor pelanggan atau nomor telepon terdaftar.",
    inputPrefix: "ID",
    fromPrice: 285000,
    productsLabel: "Pilih paket / tagihan",
    tags: ["Internet rumah", "TV kabel", "Bayar bulanan"],
    products: [
      { id: "tv-indi", name: "IndiHome 30 Mbps", detail: "Tagihan bulanan", price: 285000 },
      { id: "tv-indi-tv", name: "IndiHome + TV", detail: "Internet 50 Mbps + 60 kanal", price: 445000 },
      { id: "tv-biznet", name: "Biznet Home", detail: "Tagihan bulanan", price: 325000 },
      { id: "tv-first", name: "First Media", detail: "Tagihan bulanan", price: 379000 },
    ],
  },
  {
    slug: "e-wallet",
    name: "Top Up E-Wallet",
    navName: "E-Wallet",
    category: "e-wallet",
    icon: "wallet",
    kicker: "DANA, OVO, GoPay & lainnya",
    description: "Top up saldo dompet digital favoritmu, kapan pun.",
    longDescription:
      "Isi saldo DANA, OVO, GoPay, ShopeePay, dan LinkAja. Saldo langsung masuk dan siap dipakai untuk kebutuhan harian.",
    inputLabel: "Nomor HP Terdaftar",
    inputPlaceholder: "Contoh: 0812 3456 7890",
    inputHint: "Gunakan nomor HP yang terdaftar di akun dompet digital.",
    inputPrefix: "+62",
    fromPrice: 20000,
    productsLabel: "Pilih nominal top up",
    tags: ["5 dompet digital", "Saldo instan", "Tanpa biaya tersembunyi"],
    products: [
      { id: "ew-20", name: "Saldo 20.000", detail: "Top up instan", price: 20000 },
      { id: "ew-50", name: "Saldo 50.000", detail: "Top up instan", price: 50000 },
      {
        id: "ew-100",
        name: "Saldo 100.000",
        detail: "Top up instan",
        price: 100000,
        badge: "Populer",
      },
      { id: "ew-200", name: "Saldo 200.000", detail: "Top up instan", price: 200000 },
      { id: "ew-500", name: "Saldo 500.000", detail: "Top up instan", price: 500000 },
      { id: "ew-1000", name: "Saldo 1.000.000", detail: "Top up instan", price: 1000000 },
    ],
  },
  {
    slug: "multifinance",
    name: "Angsuran Multifinance",
    navName: "Multifinance",
    category: "cicilan",
    icon: "car",
    kicker: "Adira, FIF, BAF & Mega Auto",
    description: "Bayar angsuran motor, mobil, dan kendaraan lainnya.",
    longDescription:
      "Bayar cicilan kendaraan dari berbagai perusahaan pembiayaan. Masukkan nomor kontrak dan pilih nominal angsuran.",
    inputLabel: "Nomor Kontrak",
    inputPlaceholder: "Contoh: 2024 1234 5678",
    inputHint: "Nomor kontrak bisa dilihat pada buku angsuran atau aplikasi mitra.",
    inputPrefix: "KTR",
    fromPrice: 550000,
    productsLabel: "Pilih angsuran",
    tags: ["Motor & mobil", "Bayar tepat waktu", "Bukti pembayaran digital"],
    products: [
      { id: "mf-1", name: "Angsuran ke-1", detail: "Jatuh tempo bulan ini", price: 550000 },
      { id: "mf-2", name: "Angsuran ke-2", detail: "Pembayaran dipercepat", price: 550000 },
      { id: "mf-3", name: "Angsuran ke-3", detail: "Pembayaran dipercepat", price: 550000 },
      { id: "mf-pelunasan", name: "Pelunasan", detail: "Sisa kontrak", price: 4250000 },
    ],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getProduct(slug: string, productId: string) {
  return getService(slug)?.products.find((product) => product.id === productId);
}

export type Operator = {
  id: string;
  name: string;
  logo: string;
  prefixes: string[];
  color: string;
};

export const operators: Operator[] = [
  {
    id: "telkomsel",
    name: "Telkomsel",
    logo: "/images/operators/telkomsel.png",
    prefixes: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
    color: "#E60000",
  },
  {
    id: "indosat",
    name: "Indosat Ooredoo",
    logo: "/images/operators/indosat.svg",
    prefixes: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    color: "#FFC800",
  },
  {
    id: "xl",
    name: "XL Axiata",
    logo: "/images/operators/xl.png",
    prefixes: ["0817", "0818", "0819", "0859", "0877", "0878", "0879"],
    color: "#0067B1",
  },
  {
    id: "axis",
    name: "Axis",
    logo: "/images/operators/axis.jpg",
    prefixes: ["0831", "0832", "0833", "0838"],
    color: "#7B2D8E",
  },
  {
    id: "tri",
    name: "Tri",
    logo: "/images/operators/tri.svg",
    prefixes: ["0895", "0896", "0897", "0898", "0899"],
    color: "#E31E24",
  },
  {
    id: "smartfren",
    name: "Smartfren",
    logo: "/images/operators/smartfren.svg",
    prefixes: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
    color: "#E31E24",
  },
];

export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  if (digits.startsWith("8")) return `0${digits}`;
  return digits;
}

export function detectOperator(raw: string) {
  const phone = normalizePhone(raw);
  if (phone.length < 4) return undefined;
  return operators.find((operator) => operator.prefixes.includes(phone.slice(0, 4)));
}

export const wallets = [
  { id: "dana", name: "DANA", logo: "/images/payments/dana.svg", min: 10000 },
  { id: "ovo", name: "OVO", logo: "/images/payments/ovo.svg", min: 20000 },
  { id: "gopay", name: "GoPay", logo: "/images/payments/gopay.png", min: 20000 },
  { id: "shopeepay", name: "ShopeePay", logo: "/images/payments/shopeepay.svg", min: 20000 },
];

export const pdamRegions = [
  { id: "dki", name: "DKI Jakarta — PAM Jaya" },
  { id: "jabar", name: "Jawa Barat — Tirta Pakuan" },
  { id: "jateng", name: "Jawa Tengah — PDAM Semarang" },
  { id: "jatim", name: "Jawa Timur — PDAM Surabaya" },
  { id: "banten", name: "Banten — Tirta Cisadane" },
  { id: "sumut", name: "Sumatera Utara — PDAM Tirtanadi" },
  { id: "sulsel", name: "Sulawesi Selatan — PDAM Makassar" },
  { id: "bali", name: "Bali — Tirta Denpasar" },
];

export const tvProviders = [
  { id: "indihome", name: "IndiHome" },
  { id: "biznet", name: "Biznet Home" },
  { id: "firstmedia", name: "First Media" },
  { id: "myrepublic", name: "MyRepublic" },
];

export const financeProviders = [
  { id: "adira", name: "Adira Finance" },
  { id: "fif", name: "FIF Group" },
  { id: "baf", name: "BAF" },
  { id: "mega", name: "Mega Auto Finance" },
];

export type PaymentMethod = {
  id: string;
  name: string;
  logo: string;
  fee: number;
  type: "qris" | "ewallet" | "va";
  note: string;
};

export type PromoCode = {
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number;
  maxDiscount?: number;
  minSpend?: number;
};

export const promoCodes: PromoCode[] = [
  {
    code: "JUE20",
    label: "Diskon 20% maksimal Rp 20.000",
    type: "percent",
    value: 20,
    maxDiscount: 20000,
  },
  {
    code: "HEMAT10",
    label: "Potongan Rp 10.000 min. transaksi Rp 50.000",
    type: "fixed",
    value: 10000,
    minSpend: 50000,
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    logo: "/images/payments/qris.png",
    fee: 0,
    type: "qris",
    note: "Scan sekali, semua e-wallet & m-banking",
  },
  {
    id: "dana",
    name: "DANA",
    logo: "/images/payments/dana.svg",
    fee: 1500,
    type: "ewallet",
    note: "Bayar langsung dari aplikasi DANA",
  },
  {
    id: "ovo",
    name: "OVO",
    logo: "/images/payments/ovo.svg",
    fee: 1500,
    type: "ewallet",
    note: "Konfirmasi pembayaran di aplikasi OVO",
  },
  {
    id: "gopay",
    name: "GoPay",
    logo: "/images/payments/gopay.png",
    fee: 1500,
    type: "ewallet",
    note: "Bayar lewat aplikasi Gojek",
  },
  {
    id: "shopeepay",
    name: "ShopeePay",
    logo: "/images/payments/shopeepay.svg",
    fee: 1500,
    type: "ewallet",
    note: "Bayar lewat aplikasi Shopee",
  },
  {
    id: "bca",
    name: "BCA Virtual Account",
    logo: "/images/payments/bca.svg",
    fee: 2500,
    type: "va",
    note: "Transfer dari m-BCA atau ATM BCA",
  },
  {
    id: "bri",
    name: "BRI Virtual Account",
    logo: "/images/payments/bri.svg",
    fee: 2500,
    type: "va",
    note: "Transfer dari BRImo atau ATM BRI",
  },
  {
    id: "mandiri",
    name: "Mandiri Virtual Account",
    logo: "/images/payments/mandiri.svg",
    fee: 2500,
    type: "va",
    note: "Transfer dari Livin' atau ATM Mandiri",
  },
  {
    id: "bni",
    name: "BNI Virtual Account",
    logo: "/images/payments/bni.svg",
    fee: 2500,
    type: "va",
    note: "Transfer dari BNI Mobile atau ATM BNI",
  },
];

export type OrderStatus = "Menunggu pembayaran" | "Diproses" | "Selesai";

export type StoredOrder = {
  invoice: string;
  service: string;
  product: string;
  number: string;
  total: number;
  method: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
};

export const demoOrders: StoredOrder[] = [
  {
    invoice: "JSR-2610-0812",
    service: "Token & Tagihan PLN",
    product: "Token 100.000",
    number: "5123 4567 8901",
    total: 103500,
    method: "QRIS",
    status: "Selesai",
    createdAt: "2026-10-18T10:24:00+07:00",
    paidAt: "2026-10-18T10:25:11+07:00",
  },
  {
    invoice: "JSR-2610-0774",
    service: "Iuran BPJS Kesehatan",
    product: "Kelas 2 · 2 bulan",
    number: "0001 2345 6789 0",
    total: 202500,
    method: "BCA Virtual Account",
    status: "Diproses",
    createdAt: "2026-10-19T14:10:00+07:00",
  },
  {
    invoice: "JSR-2610-0641",
    service: "Pulsa Semua Operator",
    product: "Pulsa 25.000",
    number: "0812 3456 7890",
    total: 27500,
    method: "DANA",
    status: "Menunggu pembayaran",
    createdAt: "2026-10-20T08:42:00+07:00",
  },
];

export const testimonials = [
  {
    name: "Raka Pratama",
    role: "Mahasiswa · Bandung",
    initials: "RP",
    quote:
      "Isi token listrik jam 1 pagi tetap langsung masuk. Nggak perlu keluar kos, dan bukti bayarnya rapi banget.",
    service: "Token PLN",
  },
  {
    name: "Sinta Maharani",
    role: "Karyawan swasta · Jakarta",
    initials: "SM",
    quote:
      "Awalnya cuma coba bayar BPJS, sekarang semua tagihan rumah aku bayar di sini. Ringkasan pesanannya jelas.",
    service: "BPJS Kesehatan",
  },
  {
    name: "Dimas Ardianto",
    role: "Pemilik usaha · Surabaya",
    initials: "DA",
    quote:
      "Pulsa dan paket data buat tim langsung diproses. Deteksi operatornya bikin nggak pernah salah pilih lagi.",
    service: "Pulsa & Paket Data",
  },
];

export const faqs = [
  {
    question: "Berapa lama pesanan diproses?",
    answer:
      "Rata-rata pesanan selesai dalam 3 detik setelah pembayaran terverifikasi. Untuk tagihan tertentu seperti BPJS dan PDAM, proses verifikasi bisa memakan waktu hingga 5 menit.",
  },
  {
    question: "Bagaimana cara cek status pesanan?",
    answer:
      "Masukkan nomor invoice di halaman “Cek Pesanan” Juegora Satelit. Bukti transaksi digital juga tersimpan dan bisa dilihat kembali dari halaman pesanan.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima QRIS, e-wallet DANA, OVO, GoPay, ShopeePay, serta virtual account BCA, BRI, Mandiri, dan BNI. Semua pembayaran diproses melalui kanal resmi.",
  },
  {
    question: "Apakah nomor HP saya aman?",
    answer:
      "Nomor HP hanya digunakan untuk mengirim bukti transaksi dan status pesanan. Data pelanggan tidak dibagikan ke pihak ketiga di luar kebutuhan proses pembayaran.",
  },
  {
    question: "Apakah bisa bayar untuk orang lain?",
    answer:
      "Bisa. Masukkan ID pelanggan atau nomor HP tujuan milik orang lain, lalu selesaikan pembayaran. Pastikan data tujuan sudah benar sebelum membayar.",
  },
  {
    question: "Apa yang terjadi jika token atau pulsa tidak masuk?",
    answer:
      "Simpan nomor invoice dan hubungi layanan pelanggan kami. Tim akan mengecek status transaksi ke mitra dan menyelesaikan dalam 1×24 jam kerja.",
  },
  {
    question: "Apakah harga di website sudah termasuk biaya admin?",
    answer:
      "Harga produk yang tertera adalah harga dasar. Biaya admin mengikuti metode pembayaran yang dipilih dan selalu ditampilkan pada ringkasan sebelum kamu membayar.",
  },
  {
    question: "Bisakah saya membatalkan pesanan?",
    answer:
      "Pesanan yang belum dibayar akan kedaluwarsa otomatis dalam 15 menit. Setelah pembayaran diterima, pesanan tidak dapat dibatalkan karena langsung diproses ke mitra.",
  },
];

export const liveNames = [
  "Raka",
  "Sinta",
  "Dimas",
  "Nabila",
  "Fajar",
  "Citra",
  "Bima",
  "Ayu",
  "Gilang",
  "Maya",
  "Rizky",
  "Tari",
];

export const transactionFeed = [
  { name: "Raka P.", service: "Token PLN 100.000", city: "Bandung", seconds: 12 },
  { name: "Ayu L.", service: "Pulsa 25.000", city: "Surabaya", seconds: 38 },
  { name: "Dimas A.", service: "Paket Data 8 GB", city: "Jakarta", seconds: 64 },
  { name: "Nabila S.", service: "BPJS Kelas 2", city: "Semarang", seconds: 91 },
  { name: "Fajar R.", service: "Top Up DANA 50.000", city: "Medan", seconds: 127 },
  { name: "Citra M.", service: "PDAM Bulan Ini", city: "Denpasar", seconds: 152 },
  { name: "Gilang W.", service: "Token PLN 50.000", city: "Yogyakarta", seconds: 185 },
];
