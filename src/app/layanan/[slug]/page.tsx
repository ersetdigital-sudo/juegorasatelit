import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock3, LockKeyhole, Zap } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import { ServiceForm } from "@/components/service-form";
import { getHydratedService } from "@/lib/catalog-hydrate";
import { getService, services } from "@/lib/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.name,
    description: `${service.description} Bayar ${service.name.toLowerCase()} di Juegora Satelit, proses cepat dan aman.`,
    openGraph: {
      title: `${service.name} | Juegora Satelit`,
      description: service.description,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getHydratedService(slug);
  if (!service) notFound();

  return (
    <div className="detail-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight />
          <Link href="/#layanan">Layanan</Link>
          <ChevronRight />
          <span className="current">{service.navName}</span>
        </nav>

        <header className="detail-hero">
          <div className="detail-icon">
            <ServiceIcon name={service.icon} size={48} />
          </div>
          <div className="detail-hero-copy">
            <span className="eyebrow">{service.kicker}</span>
            <h1>{service.name}</h1>
            <p>{service.longDescription}</p>
            <div className="detail-tags">
              {service.tags.map((tag) => (
                <span className="badge" key={tag}>
                  <Zap size={9} />
                  {tag}
                </span>
              ))}
              <span className="badge">
                <Clock3 size={9} />
                Proses ± 3 detik
              </span>
              <span className="badge">
                <LockKeyhole size={9} />
                Pembayaran aman
              </span>
            </div>
          </div>
        </header>

        <ServiceForm service={service} />

        <p className="detail-focus-note">
          <LockKeyhole size={12} />
          Halaman ini khusus untuk {service.name}. Data transaksi kamu tidak dibagikan ke pihak
          ketiga.
        </p>
      </div>
    </div>
  );
}
