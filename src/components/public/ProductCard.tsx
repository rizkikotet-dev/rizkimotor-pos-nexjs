import Link from "next/link";
import Image from "next/image";
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
      prefetch
      className="group block card-hover overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg active:scale-[0.98] transition-all duration-150"
      aria-label={`${product.name}, ${product.category.name}${!inStock ? ", stok habis" : ""}`}
    >
      <div className="aspect-[4/3] bg-surface-container-low relative overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9PQAI8wNPvd7POQAAAABJRU5ErkJggg=="
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Package className="h-12 w-12" aria-hidden="true" />
          </div>
        )}

        {!inStock && (
          <div className="absolute inset-0 bg-surface-base/70 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Stok Habis
            </span>
          </div>
        )}

        {inStock && product.stock <= 2 && (
          <div className="absolute top-2 right-2">
            <span
              className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm"
              aria-label={`Stok menipis, sisa ${product.stock}`}
            >
              Stok {product.stock}
            </span>
          </div>
        )}
        {inStock && product.stock > 2 && product.stock <= 5 && (
          <div className="absolute top-2 right-2">
            <span
              className="bg-amber-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md"
              aria-label={`Sisa stok ${product.stock}`}
            >
              Sisa {product.stock}
            </span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
          {product.category.name}
        </p>
        <h3 className="font-semibold text-sm text-zinc-100 line-clamp-2 group-hover:text-primary transition-colors duration-150 leading-snug mb-1.5">
          {product.name}
        </h3>
        {product.price != null && product.price > 0 && (
          <p className="font-bold text-primary text-sm">
            {formatRupiah(product.price)}
          </p>
        )}
        <p className="text-[10px] text-zinc-600 font-mono mt-1">{product.sku}</p>
      </div>
    </Link>
  );
}
