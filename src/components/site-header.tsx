"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { JuegoraLogo } from "@/components/juegora-logo";
import { ServiceIcon } from "@/components/service-icon";
import { services } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

const NAV = [
  { label: "Beranda", href: "/" },
  { label: "Flash Sale", href: "/#flash-sale" },
  { label: "Cara Order", href: "/#cara-order" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [pathname]);

  const onServicePage = pathname.startsWith("/layanan");

  return (
    <header className="site-header">
      <div className="container header-inner">
        <JuegoraLogo />
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link
            href="/"
            className={pathname === "/" ? "is-active" : undefined}
            aria-current={pathname === "/" ? "page" : undefined}
          >
            Beranda
          </Link>

          <div className={`nav-group ${servicesOpen ? "is-open" : ""}`.trim()}>
            <button
              type="button"
              className={`nav-group__trigger ${onServicePage ? "is-active" : ""}`.trim()}
              aria-expanded={servicesOpen}
              onClick={() => setServicesOpen((current) => !current)}
            >
              Layanan
              <ChevronDown size={13} strokeWidth={2.4} className="nav-group__chevron" />
            </button>

            <div className="nav-group__wrap">
              <div className="nav-group__panel">
                {services.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/layanan/${service.slug}`}
                    className="nav-service"
                  >
                    <span className="nav-service__icon">
                      <ServiceIcon name={service.icon} size={15} />
                    </span>
                    <span className="nav-service__body">
                      <strong>{service.navName}</strong>
                      <small>mulai {formatRupiah(service.fromPrice)}</small>
                    </span>
                  </Link>
                ))}
                <Link href="/#layanan" className="nav-group__all">
                  Lihat semua layanan
                  <ArrowRight size={13} strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </div>

          {NAV.slice(1).map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/cek-transaksi" className="btn btn-ghost btn-sm header-actions__check">
            Cek Pesanan
          </Link>
          <Link href="/#layanan" className="btn btn-primary btn-sm">
            Bayar
            <ArrowRight size={14} strokeWidth={2.4} />
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="mobile-menu" aria-label="Navigasi mobile">
          <Link href="/" onClick={() => setOpen(false)}>
            Beranda
            <ChevronRight className="mobile-menu__arrow" size={14} aria-hidden="true" />
          </Link>

          <span className="mobile-menu__label">Layanan</span>
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/layanan/${service.slug}`}
              className="mobile-menu__sub"
              onClick={() => setOpen(false)}
            >
              {service.navName}
              <ChevronRight className="mobile-menu__arrow" size={14} aria-hidden="true" />
            </Link>
          ))}

          {NAV.slice(1).map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
              <ChevronRight className="mobile-menu__arrow" size={14} aria-hidden="true" />
            </Link>
          ))}

          <Link href="/cek-transaksi" onClick={() => setOpen(false)}>
            Cek Pesanan
            <ChevronRight className="mobile-menu__arrow" size={14} aria-hidden="true" />
          </Link>

          <Link href="/#layanan" className="mobile-menu__cta" onClick={() => setOpen(false)}>
            Bayar Tagihan
            <ArrowRight size={15} strokeWidth={2.4} />
          </Link>
        </nav>
      )}
    </header>
  );
}
