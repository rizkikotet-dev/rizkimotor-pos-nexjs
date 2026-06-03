import Link from "next/link";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    sku: string;
    image: string | null;
    stock: number;
    price?: number;
    category: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const inStock = product.stock > 0;
  return (
    <Link
      href={`/produk/${product.id}`}
      className="group block card-hover overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-2xl"
      aria-label={`${product.name}, ${product.category.name}${!inStock ? ', stok habis' : ''}`}
    >
      <div className="aspect-square bg-surface-100 relative overflow-hidden">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-surface-300">
            <Package className="h-12 w-12 sm:h-16 sm:w-16" aria-hidden="true" />
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center">
            <span className="badge-danger text-xs px-3 py-1.5">
              Stok Habis
            </span>
          </div>
        )}
        {inStock && product.stock <= 5 && (
          <div className="absolute top-2 right-2">
            <span className="badge-warning text-[10px] px-2 py-0.5" aria-label={`Sisa stok ${product.stock}`}>
              Sisa {product.stock}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-semibold mb-1">
          {product.category.name}
        </p>
        <h3 className="font-semibold text-sm text-surface-900 line-clamp-2 group-hover:text-brand-600 transition-colors duration-200 leading-snug">
          {product.name}
        </h3>
        <p className="text-[10px] text-surface-400 mt-1.5 font-mono">{product.sku}</p>
      </div>
    </Link>
  );
}
