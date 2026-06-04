"use client";

import { Package } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { filterProducts, type Product } from "./types";

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  onAddToCart: (product: Product, selectedPrice: number) => void;
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: (product: Product, selectedPrice: number) => void;
}) {
  const hasResellerPrice = product.priceReseller > 0;

  return (
    <div
      className={`text-left p-3 rounded-lg border transition-all duration-150 min-h-[120px] ${
        product.stock > 0
          ? "border-surface-outline-variant bg-surface-base"
          : "border-surface-outline-variant bg-surface-container-low opacity-50"
      }`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <p className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug">
          {product.name}
        </p>
        {product.stock > 0 && product.stock < 3 && (
          <span className="shrink-0 bg-red-600/15 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider leading-tight">
            Stok {product.stock}
          </span>
        )}
      </div>
      <p className="text-[10px] text-zinc-500 font-mono mb-2">{product.sku}</p>
      <p className="text-[10px] text-zinc-500 mb-2">Stok: {product.stock}</p>

      {product.stock < 3 ? (
        <div className="text-center py-2 text-xs text-red-500 font-medium bg-red-600/10 rounded">
          {product.stock <= 0 ? "Stok Habis" : `Stok Menipis (${product.stock})`}
        </div>
      ) : (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onAddToCart(product, product.price)}
            className="w-full px-2 py-1.5 bg-primary text-surface-base hover:bg-primary-400 rounded text-xs font-medium transition-colors active:scale-95 flex items-center justify-between"
            aria-label={`Tambah ${product.name} harga normal`}
          >
            <span>Normal</span>
            <span className="font-bold">{formatRupiah(product.price)}</span>
          </button>
          {hasResellerPrice && (
            <button
              type="button"
              onClick={() => onAddToCart(product, product.priceReseller)}
              className="w-full px-2 py-1.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded text-xs font-medium transition-colors active:scale-95 flex items-center justify-between"
              aria-label={`Tambah ${product.name} harga reseller`}
            >
              <span>Reseller</span>
              <span className="font-bold">{formatRupiah(product.priceReseller)}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Grid product catalog dengan client-side search. Filter by name/SKU/description.
// Empty state khusus untuk "no match" vs "no products".
export function ProductGrid({ products, searchQuery, onAddToCart }: ProductGridProps) {
  const filtered = filterProducts(products, searchQuery);

  if (filtered.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto rounded-lg border border-surface-outline-variant bg-surface-container-low/50">
        <div className="p-8 text-center text-zinc-500 text-sm">
          <Package className="h-8 w-8 text-zinc-700 mx-auto mb-2" aria-hidden="true" />
          <p>Produk tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto rounded-lg border border-surface-outline-variant bg-surface-container-low/50"
      role="region"
      aria-label="Daftar produk"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 p-2">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}
