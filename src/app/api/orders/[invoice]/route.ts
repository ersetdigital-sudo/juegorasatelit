import { getOrderByRef, getPaymentByRef } from "@/lib/db/server";

function mapStatus(status: string) {
  if (status === "sukses") return "selesai";
  if (status === "sudah_bayar") return "diproses";
  if (status === "dibatalkan") return "gagal";
  return "menunggu";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ invoice: string }> },
) {
  const { invoice } = await context.params;
  const [payment, orders] = await Promise.all([
    getPaymentByRef(invoice),
    getOrderByRef(invoice),
  ]);

  if (!payment.data) {
    return Response.json(
      { message: payment.error || "Invoice tidak ditemukan" },
      { status: 404 },
    );
  }

  const data = payment.data;
  return Response.json({
    invoice: data.ref,
    status: mapStatus(data.status),
    service: data.nama_layanan,
    product: data.nama_produk ?? "-",
    number: data.nomor_tujuan,
    total: data.total ?? 0,
    method: data.metode_bayar ?? "QRIS",
    channel: data.metode_bayar ?? "QRIS",
    createdAt: data.created_at ?? new Date().toISOString(),
    sn: orders.data?.[0]?.sn ?? null,
  });
}
