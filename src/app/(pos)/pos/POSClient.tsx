"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  priceReseller: number;
  stock: number;
  image: string | null;
  description: string | null;
  active: boolean;
  categoryId: number;
  category: { name: string };
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  maxStock: number;
}
import { formatRupiah } from "@/lib/format";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  Loader2,
  Package,
} from "lucide-react";

interface POSClientProps {
  products: Product[];
  settings: Record<string, string>;
  userRole?: string;
}

export function POSClient({ products, settings, userRole }: POSClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = useCallback((product: Product) => {
    const isReseller =
      userRole === "KASIR" &&
      settings["store.resellerCategoryId"] &&
      String(product.categoryId) === settings["store.resellerCategoryId"];

    const price = isReseller && product.priceReseller > 0 ? product.priceReseller : product.price;

    setCart((prev) => {
      const existing = prev.find((c) => c.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((c) =>
          c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      if (product.stock <= 0) return prev;
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price,
          quantity: 1,
          maxStock: product.stock,
        },
      ];
    });
    setSearchQuery("");
    searchInputRef.current?.focus();
  }, [userRole, settings]);

  function updateQty(productId: number, delta: number) {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeItem(productId: number) {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }

  async function submitOrder() {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grandTotal,
          paymentMethod: "CASH",
          paymentStatus: "UNPAID",
          items: cart.map((c) => ({
            productId: c.productId,
            quantity: c.quantity,
            unitPrice: c.price,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Gagal membuat pesanan");
        return;
      }

      setCart([]);
      router.refresh();
      alert("Pesanan berhasil dibuat!");
    } catch {
      alert("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 flex flex-col min-h-0 lg:h-[calc(100dvh-7rem)]">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" aria-hidden="true" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ketik nama atau SKU produk..."
            className="input pl-9 pr-9"
            aria-label="Cari produk"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
              aria-label="Hapus pencarian"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-surface-outline-variant bg-surface-container-low/50" role="region" aria-label="Daftar produk">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              <Package className="h-8 w-8 text-zinc-700 mx-auto mb-2" aria-hidden="true" />
              <p>Produk tidak ditemukan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 p-2">
              {filtered.map((product) => {
                const inStock = product.stock > 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                    className={`text-left p-3 rounded-lg border transition-all duration-150 min-h-[80px] active:scale-[0.97] ${
                      inStock
                        ? "border-surface-outline-variant bg-surface-base hover:bg-surface-container-high hover:border-zinc-600 cursor-pointer"
                        : "border-surface-outline-variant bg-surface-container-low opacity-50 cursor-not-allowed"
                    }`}
                    aria-label={`Tambah ${product.name} ke keranjang${!inStock ? ", stok habis" : ""}`}
                  >
                    <p className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug mb-1">{product.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mb-1.5">{product.sku}</p>
                    <p className="text-sm font-bold text-primary">{formatRupiah(product.price)}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Stok: {product.stock}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-80 xl:w-96 flex-shrink-0 flex flex-col border border-surface-outline-variant rounded-lg bg-surface-base overflow-hidden lg:h-[calc(100dvh-7rem)]">
        <div className="p-3 border-b border-surface-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-zinc-200">Keranjang</h2>
            {cart.length > 0 && (
              <span className="tag-brand text-[10px]">{cart.length} item</span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2" role="region" aria-label="Item di keranjang" ref={cartEndRef}>
          {cart.length === 0 ? (
            <div className="text-center text-zinc-600 text-sm py-10">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-zinc-700" aria-hidden="true" />
              <p>Belum ada item.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="bg-surface-container-low border border-surface-outline-variant rounded-lg p-2.5"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{item.name}</p>
                    <p className="text-[10px] text-primary font-mono">{formatRupiah(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500/40 min-h-[32px] min-w-[32px]"
                    aria-label={`Hapus ${item.name} dari keranjang`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.productId, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded border border-surface-outline-variant bg-surface-container-high text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 active:scale-90 transition-all"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-zinc-100" aria-live="polite" aria-label={`Jumlah ${item.quantity}`}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="w-8 h-8 flex items-center justify-center rounded border border-surface-outline-variant bg-surface-container-high text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-zinc-200">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-surface-outline-variant p-3 bg-surface-container-low space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Grand Total</span>
            <span className="text-lg font-bold text-primary" aria-live="polite">{formatRupiah(grandTotal)}</span>
          </div>
          <button
            onClick={submitOrder}
            disabled={cart.length === 0 || submitting}
            className="btn-primary w-full py-2.5 text-sm min-h-[44px]"
            aria-label={submitting ? "Memproses pesanan" : "Buat Pesanan"}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memproses...
              </>
            ) : (
              "Buat Pesanan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
