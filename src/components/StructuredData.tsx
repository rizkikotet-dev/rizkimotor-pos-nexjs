// Helper untuk injeksi JSON-LD structured data.
// Dipakai untuk:
// - LocalBusiness (kontak/toko) di halaman kontak & beranda
// - Product di halaman detail produk
// - WebSite dengan SearchAction di beranda (saat ada search publik)
// - BreadcrumbList di halaman dalam
//
// JSON-LD membantu Google menampilkan rich results (rating, harga, jam buka, dll.)
// di hasil pencarian.

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Render a JSON-LD script tag. The data is serialized with the
 * <script type="application/ld+json"> convention. Multiple objects
 * can be passed as an array (e.g., LocalBusiness + BreadcrumbList).
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Build a LocalBusiness JSON-LD object for the store. */
export function buildLocalBusiness(settings: Record<string, string>, siteUrl: string) {
  const phone = settings["store.phone"] || "";
  const street = settings["store.address"] || "";
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#store`,
    name: settings["store.name"] || "Rizki Motor",
    description:
      settings["store.description"] ||
      "Toko sparepart alat-alat sepeda motor. Katalog terlengkap, harga bersaing, kualitas terjamin.",
    url: siteUrl,
    telephone: phone,
    email: settings["store.email"] || undefined,
    image: `${siteUrl}/icon-512.png`,
    address: street
      ? {
          "@type": "PostalAddress",
          streetAddress: street,
          addressCountry: "ID",
        }
      : undefined,
    openingHoursSpecification: buildOpeningHours(
      settings["store.openDays"],
      settings["store.openStart"],
      settings["store.openEnd"]
    ),
    priceRange: "Rp",
  };
}

/** Build an Offer/Product JSON-LD object. */
export function buildProductJsonLd(
  product: {
    name: string;
    description: string | null;
    sku: string;
    image: string | null;
    price: number;
    stock: number;
  },
  siteUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    sku: product.sku,
    image: product.image || `${siteUrl}/icon-512.png`,
    brand: { "@type": "Brand", name: "Rizki Motor" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "IDR",
      availability: product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/produk`,
    },
  };
}

/** Build a BreadcrumbList. */
export function buildBreadcrumb(
  siteUrl: string,
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  };
}

/**
 * Parse the opening days string (e.g., "Senin - Sabtu") into a
 * schema.org DayOfWeek array. Indonesian day names mapped to
 * schema.org values.
 */
function buildOpeningHours(
  days: string | undefined,
  start: string | undefined,
  end: string | undefined
) {
  if (!days || !start || !end) return undefined;
  const dayMap: Record<string, string> = {
    senin: "Monday",
    selasa: "Tuesday",
    rabu: "Wednesday",
    kamis: "Thursday",
    jumat: "Friday",
    sabtu: "Saturday",
    minggu: "Sunday",
    minggu_: "Sunday",
  };
  const matches = days.toLowerCase().match(/senin|selasa|rabu|kamis|jumat|sabtu|minggu/g);
  if (!matches) return undefined;
  const valid = matches
    .map((d) => dayMap[d])
    .filter((d): d is string => Boolean(d));
  if (valid.length === 0) return undefined;
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: valid,
      opens: start,
      closes: end,
    },
  ];
}
