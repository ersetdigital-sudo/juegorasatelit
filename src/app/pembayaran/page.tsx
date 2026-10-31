import type { Metadata } from "next";
import { PaymentClient } from "@/components/payment-client";
import { getCheckoutData } from "@/lib/catalog-hydrate";

export const metadata: Metadata = {
  title: "Pembayaran",
  description:
    "Selesaikan pembayaran pesanan Juegora Satelit melalui QRIS, e-wallet, atau virtual account.",
  robots: {
    index: false,
    follow: false,
  },
};

function text(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw ?? "";
}

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const serviceSlug = text(params.service);
  const productId = text(params.product);
  const months = Math.min(6, Math.max(1, Number(text(params.months)) || 1));
  const checkout = await getCheckoutData(serviceSlug, productId, months);

  return (
    <PaymentClient
      service={checkout.service}
      product={checkout.product}
      dbServiceId={checkout.dbServiceId}
      dbProductId={checkout.dbProductId}
      brandSlug={checkout.brand?.slug ?? ""}
      methods={checkout.methods}
      qrisImageUrl={checkout.brand?.qris_image_url ?? null}
      number={text(params.no)}
      months={months}
      region={text(params.region)}
      provider={text(params.provider)}
      finance={text(params.finance)}
      wallet={text(params.wallet)}
    />
  );
}
