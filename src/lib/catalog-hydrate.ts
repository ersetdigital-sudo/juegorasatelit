import {
  services as baseServices,
  type Product,
  type Service,
} from "@/lib/data";
import {
  getCatalog,
  type CatalogMethod,
  type CatalogService,
  type PublicCatalog,
} from "@/lib/db/server";
import type { WebBrand } from "@/lib/db/types";

function dbProductFor(
  service: Service,
  product: Product,
  dbService: CatalogService,
  months: number,
) {
  if (service.slug === "bpjs") {
    const exact = dbService.products.find(
      (item) => item.nama === `${product.name} · ${months} bulan`,
    );
    if (exact) return exact;
    const index = service.products.findIndex((item) => item.id === product.id);
    return dbService.products[index * 6 + (months - 1)] ?? null;
  }

  const exact = dbService.products.find((item) => item.nama === product.name);
  if (exact) return exact;
  const index = service.products.findIndex((item) => item.id === product.id);
  return dbService.products[index] ?? null;
}

function hydrateService(
  service: Service,
  dbService: CatalogService | undefined,
): Service {
  if (!dbService) return service;

  const products = service.products.map((product) => {
    const dbProduct = dbProductFor(service, product, dbService, 1);
    return dbProduct ? { ...product, price: dbProduct.hargaJual } : product;
  });
  const fromPrice = products.length
    ? Math.min(...products.map((product) => product.price))
    : service.fromPrice;

  return { ...service, products, fromPrice };
}

function hydrateCatalog(catalog: PublicCatalog | null): Service[] {
  if (!catalog) return baseServices;
  const bySlug = new Map(catalog.services.map((service) => [service.slug, service]));
  return baseServices.map((service) => hydrateService(service, bySlug.get(service.slug)));
}

export async function getHydratedServices(): Promise<Service[]> {
  const catalog = await getCatalog();
  return hydrateCatalog(catalog.data);
}

export async function getHydratedService(slug: string): Promise<Service | undefined> {
  const services = await getHydratedServices();
  return services.find((service) => service.slug === slug);
}

export type CheckoutData = {
  service: Service | null;
  product: Product | null;
  dbServiceId: string | null;
  dbProductId: string | null;
  methods: CatalogMethod[];
  brand: WebBrand | null;
};

export async function getCheckoutData(
  slug: string,
  productId: string,
  months: number,
): Promise<CheckoutData> {
  const catalog = await getCatalog();
  const data = catalog.data;
  const services = hydrateCatalog(data);
  const service = services.find((item) => item.slug === slug) ?? null;
  const product = service?.products.find((item) => item.id === productId) ?? null;
  const dbService = data?.services.find((item) => item.slug === slug) ?? null;

  if (!service || !product || !dbService) {
    return {
      service,
      product,
      dbServiceId: dbService?.dbId ?? null,
      dbProductId: null,
      methods: data?.methods ?? [],
      brand: data?.brand ?? null,
    };
  }

  const dbProduct = dbProductFor(service, product, dbService, months);
  const price =
    dbProduct?.hargaJual ?? (service.slug === "bpjs" ? product.price * months : product.price);

  return {
    service,
    product: { ...product, price },
    dbServiceId: dbService.dbId,
    dbProductId: dbProduct?.id ?? null,
    methods: data?.methods ?? [],
    brand: data?.brand ?? null,
  };
}
