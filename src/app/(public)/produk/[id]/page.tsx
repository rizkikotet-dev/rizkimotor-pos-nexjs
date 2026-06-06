import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Package, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { JsonLd, buildProductJsonLd, buildBreadcrumb } from "@/components/StructuredData";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

// Per-halaman metadata (title, description, OG) untuk SEO optimal.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) return { title: "Produk tidak ditemukan" };

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      image: true,
      price: true,
      stock: true,
      active: true,
    },
  });
  if (!product || !product.active) {
    // Page returns 404 jika product tidak aktif, jadi tidak ada
    // metadata yang perlu di-generate.
    return { title: "Produk tidak ditemukan" };
  }

  const description =
    product.description?.slice(0, 160) ||
    `${product.name} — ${formatRupiah(product.price)}. ${product.stock > 0 ? "Tersedia" : "Stok habis"}. Sparepart motor berkualitas dari Rizki Motor.`;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/produk/${id}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: product.image ? [{ url: product.image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image ? [product.image] : undefined,
    },
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    getSettings(),
  ]);

  if (!product || !product.active) notFound();

  const inStock = product.stock > 0;
  const phone = settings["store.phone"]?.replace(/[^0-9]/g, "") || "6281234567890";
  const waNumber = phone.startsWith("62") ? phone : `62${phone.replace(/^0/, "")}`;

  // Structured data: Product + breadcrumb untuk rich results Google.
  const ld = [
    buildProductJsonLd(product, SITE_URL),
    buildBreadcrumb(SITE_URL, [
      { name: "Beranda", url: "/" },
      { name: "Produk", url: "/produk" },
      { name: product.name, url: `/produk/${product.id}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <JsonLd data={ld} />
      <Link
        href="/produk"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-primary mb-6 transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke katalog
      </Link>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square md:aspect-auto md:h-full bg-surface-container-low relative overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-zinc-700">
                <Package className="h-20 w-20 sm:h-28 sm:w-28" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8 flex flex-col">
            <span className="tag-brand w-fit mb-3">
              {product.category.name}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-zinc-500 font-mono mb-4">SKU: {product.sku}</p>

            {/* Stock status */}
            <div className="mb-5">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse-subtle" />
                  <span className="text-sm text-emerald-400 font-medium">
                    Tersedia — Stok: {product.stock} unit
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-400 font-medium">Stok habis</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-surface-container-low rounded-lg p-4 mb-5 border border-surface-outline-variant">
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Harga</p>
              <p className="text-3xl font-bold text-primary">{formatRupiah(product.price)}</p>
              {product.priceReseller > 0 && (
                <p className="text-sm text-zinc-400 mt-1.5">
                  Harga reseller: <span className="font-semibold text-zinc-200">{formatRupiah(product.priceReseller)}</span>
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">Deskripsi</h3>
                <p className="text-sm text-zinc-400 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Contact actions */}
            <div className="mt-auto pt-5 border-t border-surface-outline-variant">
              <p className="text-sm font-semibold text-zinc-200 mb-2">Tertarik dengan produk ini?</p>
              <p className="text-sm text-zinc-500 mb-4">
                Hubungi kami untuk info lebih lanjut atau kunjungi langsung toko.
              </p>
              <div className="flex flex-wrap gap-2">
                <a href={`tel:${waNumber}`} className="btn-primary flex-1 sm:flex-none">
                  <Phone className="h-4 w-4" />
                  Telepon
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn flex-1 sm:flex-none bg-emerald-600 text-white hover:bg-emerald-500 font-semibold"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
