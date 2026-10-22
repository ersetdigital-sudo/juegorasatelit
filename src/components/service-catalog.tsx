"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { ServiceIcon } from "@/components/service-icon";
import { categories, services, type CategoryId } from "@/lib/data";
import { formatRupiah } from "@/lib/format";

export function ServiceCatalog() {
  const [category, setCategory] = useState<CategoryId>("semua");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory = category === "semua" || service.category === category;
      if (!matchesCategory) return false;
      if (!needle) return true;
      const haystack = [service.name, service.description, service.kicker, ...service.tags]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [category, query]);

  return (
    <div>
      <div className="category-toolbar">
        <div className="filter-row" role="group" aria-label="Filter kategori layanan">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`filter-btn ${category === item.id ? "is-active" : ""}`}
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="search-field">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari layanan…"
            aria-label="Cari layanan"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="service-grid">
        {filtered.map((service) => (
          <Link href={`/layanan/${service.slug}`} className="service-card panel" key={service.slug}>
            <span className="service-tag">{service.tags[0]}</span>
            <span className="service-icon-wrap">
              <ServiceIcon name={service.icon} size={31} />
            </span>
            <h3>{service.name}</h3>
            <p>{service.description}</p>
            <div className="service-card-footer">
              <span>
                <span className="service-price-label">Mulai dari</span>
                <span className="service-price">
                  <strong>{formatRupiah(service.fromPrice)}</strong>
                </span>
              </span>
              <span className="service-arrow">
                <ArrowUpRight size={14} strokeWidth={2.2} />
              </span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="empty-state">
            <strong>Layanan tidak ditemukan</strong>
            Coba kata kunci lain atau pilih kategori “Semua”.
          </div>
        )}
      </div>
    </div>
  );
}
