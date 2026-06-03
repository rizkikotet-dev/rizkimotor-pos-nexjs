import Link from "next/link";
import { Package } from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    sku: string;
    image: string | null;
    stock: number;
    price?: number;
    priceReseller?: number;
    category: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  return (
    <Link
      href={`/produk/${product.id}`}
      className="group block card-hover overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-2xl"
      aria-label={`${product.name}, ${product.category.name}${!inStock ? ", stok habis" : ""}`}
    >
      {/* Image area */}
      <div className="aspect-[4/3] bg-surface-100 relative overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <Package className="h-14 w-14 group-hover:scale-110 transition-transform duration-500" aria-hidden="true" />
          </div>
        )}

        {/* Stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
              Stok Habis
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {inStock && product.stock <= 5 && (
          <div className="absolute top-2.5 right-2.5">
            <span
              className="bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
              aria-label={`Sisa stok ${product.stock}`}
            >
              Sisa {product.stock}
            </span>
          </div>
        )}

        {/* Category tag on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent p-3 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-[10px] font-mono text-white/80 uppercase tracking-[0.15em]">
            {product.category.name}
          </span>
        </div>
      </div>

      {/* Info area */}
      <div className="p-3.5 sm:p-4">
        <p className="text-[10px] font-mono text-surface-400 uppercase tracking-[0.12em] mb-1">
          {product.category.name}
        </p>
        <h3 className="font-display font-600 text-sm text-ink line-clamp-2 group-hover:text-brand-600 transition-colors duration-200 leading-snug mb-2">
          {product.name}
        </h3>
        {product.price != null && product.price > 0 && (
          <p className="font-display font-800 text-brand-600 text-base">
            {formatRupiah(product.price)}
          </p>
        )}
        <p className="text-[10px] text-surface-400 font-mono mt-1">{product.sku}</p>
      </div>
    </Link>
  );
}
