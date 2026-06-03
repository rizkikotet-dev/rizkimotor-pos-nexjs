import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Package, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Back */}
      <Link
        href="/produk"
        className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-brand-600 mb-6 transition-colors font-medium group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke katalog
      </Link>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="aspect-square md:aspect-auto md:h-full bg-surface-100 relative overflow-hidden">
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700" />
            ) : (
              <div className="w-full h-full min-h-[300px] flex items-center justify-center text-surface-300">
                <Package className="h-20 w-20 sm:h-28 sm:w-28" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8 flex flex-col">
            <span className="tag-brand w-fit mb-3">
              {product.category.name}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-800 text-ink tracking-tight mb-2">
              {product.name}
            </h1>
            <p className="text-sm text-surface-400 font-mono mb-4">SKU: {product.sku}</p>

            {/* Stock status */}
            <div className="mb-6">
              {inStock ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse-subtle" />
                  <span className="text-sm text-emerald-700 font-semibold">
                    Tersedia — Stok: {product.stock} unit
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-600 font-semibold">Stok habis</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="bg-surface-50 rounded-2xl p-5 mb-6 border border-surface-100">
              <p className="text-[10px] text-surface-400 font-mono uppercase tracking-[0.15em] mb-1">Harga</p>
              <p className="font-display text-3xl font-800 text-brand-600">{formatRupiah(product.price)}</p>
              {product.priceReseller > 0 && (
                <p className="text-sm text-surface-500 mt-1.5">
                  Harga reseller: <span className="font-semibold text-ink">{formatRupiah(product.priceReseller)}</span>
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-ink mb-2">Deskripsi</h3>
                <p className="text-sm text-surface-600 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Contact actions */}
            <div className="mt-auto pt-6 border-t border-surface-200">
              <p className="text-sm font-semibold text-ink mb-3">Tertarik dengan produk ini?</p>
              <p className="text-sm text-surface-500 mb-4">
                Hubungi kami untuk info lebih lanjut atau kunjungi langsung toko.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${waNumber}`}
                  className="btn-primary flex-1 sm:flex-none"
                >
                  <Phone className="h-4 w-4" />
                  Telepon
                </a>
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn flex-1 sm:flex-none bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm"
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
