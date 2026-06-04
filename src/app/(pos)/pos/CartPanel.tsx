"use client";

import { useRef, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Trash2, Loader2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import type { CartItem } from "./types";

interface CartPanelProps {
  cart: CartItem[];
  grandTotal: number;
  submitting: boolean;
  onUpdateQty: (productId: number, price: number, delta: number) => void;
  onRemoveItem: (productId: number, price: number) => void;
  onSubmit: () => void;
}

function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (productId: number, price: number, delta: number) => void;
  onRemove: (productId: number, price: number) => void;
}) {
  return (
    <div className="bg-surface-container-low border border-surface-outline-variant rounded-lg p-2.5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-zinc-200 truncate">{item.name}</p>
          <p className="text-[10px] text-primary font-mono">{formatRupiah(item.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.productId, item.price)}
          className="text-zinc-600 hover:text-red-400 transition-colors p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500/40 min-h-[32px] min-w-[32px]"
          aria-label={`Hapus ${item.name} dari keranjang`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, item.price, -1)}
            className="w-8 h-8 flex items-center justify-center rounded border border-surface-outline-variant bg-surface-container-high text-zinc-400 hover:text-zinc-200 hover:border-surface-outline active:scale-90 transition-all"
            aria-label="Kurangi jumlah"
          >
            <Minus className="h-3 w-3" aria-hidden="true" />
          </button>
          <span
            className="w-8 text-center text-sm font-bold text-zinc-100"
            aria-live="polite"
            aria-label={`Jumlah ${item.quantity}`}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.productId, item.price, 1)}
            disabled={item.quantity >= item.maxStock}
            className="w-8 h-8 flex items-center justify-center rounded border border-surface-outline-variant bg-surface-container-high text-zinc-400 hover:text-zinc-200 hover:border-surface-outline active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
  );
}

function CartEmpty() {
  return (
    <div className="text-center text-zinc-600 text-sm py-10">
      <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-zinc-700" aria-hidden="true" />
      <p>Belum ada item.</p>
    </div>
  );
}

// Cart panel: items list + grand total + submit button.
// Auto-scroll ke item terbaru saat cart bertambah.
export function CartPanel({
  cart,
  grandTotal,
  submitting,
  onUpdateQty,
  onRemoveItem,
  onSubmit,
}: CartPanelProps) {
  const cartEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [cart.length]);

  const isEmpty = cart.length === 0;

  return (
    <div className="lg:w-80 xl:w-96 flex-shrink-0 flex flex-col border border-surface-outline-variant rounded-lg bg-surface-base overflow-hidden lg:h-[calc(100dvh-7rem)]">
      <div className="p-3 border-b border-surface-outline-variant bg-surface-container-low">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-zinc-200">Keranjang</h2>
          {cart.length > 0 && <span className="tag-brand text-[10px]">{cart.length} item</span>}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3 space-y-2"
        role="region"
        aria-label="Item di keranjang"
      >
        {isEmpty ? <CartEmpty /> : cart.map((item) => (
          <CartItemRow
            key={`${item.productId}-${item.price}`}
            item={item}
            onUpdateQty={onUpdateQty}
            onRemove={onRemoveItem}
          />
        ))}
        <div ref={cartEndRef} />
      </div>

      <div className="border-t border-surface-outline-variant p-3 bg-surface-container-low space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-400">Grand Total</span>
          <span className="text-lg font-bold text-primary" aria-live="polite">
            {formatRupiah(grandTotal)}
          </span>
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isEmpty || submitting}
          className="btn-primary w-full"
          aria-label={submitting ? "Memproses pesanan" : "Buat Pesanan"}
          title="Buat Pesanan (F9)"
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
  );
}
