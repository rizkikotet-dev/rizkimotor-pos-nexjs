"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import dynamic from "next/dynamic";
import { formatRupiah } from "@/lib/format";
import { ProductSearchBar } from "./ProductSearchBar";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { ManualItemModal } from "./ManualItemModal";
import { useCart } from "./useCart";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import { filterProducts, type POSClientProps, type Customer, type Product } from "./types";
import { PackagePlus } from "lucide-react";

const PaymentModal = dynamic(() => import("@/components/pos/PaymentModal").then(m => m.PaymentModal), { ssr: false });

// Main orchestrator. Composes:
//   - ProductSearchBar: search input (with focus ref + Enter to add first match)
//   - ProductGrid: catalog cards
//   - CartPanel: cart items + submit
//   - useCart hook: cart state + business logic
//   - useKeyboardShortcuts: global hotkeys (/, F2, F9, Esc)
//   - PaymentModal: payment flow (existing @/components/pos)
//
// State flow:
//   1. User search/click product → addToCart() → cart updates → re-render
//   2. User press Enter in search → add first filtered product at normal price
//   3. User press / or F2 anywhere → focus search
//   4. User press F9 (with cart) → open payment modal
//   5. User press Esc in search → clear query
//   6. User click "Buat Pesanan" → PaymentModal opens
//   7. Confirm payment → POST /api/transactions → success → redirect to receipt
export function POSClient({ products }: POSClientProps) {
  const router = useRouter();
  const toast = useToast();
  const { cart, grandTotal, addToCart, addManualItem, updateQty, removeItem, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    fetch("/api/customers?pageSize=100")
      .then((r) => r.json())
      .then((json) => setCustomers(json.data ?? []))
      .catch(() => {});
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, selectedPrice: number) => {
      addToCart(product, selectedPrice);
      setSearchQuery("");
      searchInputRef.current?.focus();
    },
    [addToCart]
  );

  const handleAddFirstMatch = useCallback(() => {
    const filtered = filterProducts(products, searchQuery);
    const first = filtered[0];
    if (!first) return;
    if (first.stock <= 0) {
      toast.error(`"${first.name}" stok habis`);
      return;
    }
    // Default ke harga normal. Kasir bisa klik tombol Reseller di kartu jika perlu.
    handleAddToCart(first, first.price);
  }, [products, searchQuery, handleAddToCart, toast]);

  const handleOpenPayment = useCallback(() => {
    if (cart.length === 0) return;
    setShowPayment(true);
  }, [cart.length]);

  const handleAddManualItem = useCallback(
    (name: string, price: number, quantity: number) => {
      addManualItem(name, price, quantity);
      setShowManualInput(false);
      searchInputRef.current?.focus();
    },
    [addManualItem]
  );

  // Global keyboard shortcuts (/, F2, F9, Esc)
  useKeyboardShortcuts({
    searchInputRef,
    isPaymentOpen: showPayment,
    hasCart: cart.length > 0,
    hasSearchQuery: searchQuery.length > 0,
    onFocusSearch: () => searchInputRef.current?.focus(),
    onOpenPayment: handleOpenPayment,
    onClearSearch: () => setSearchQuery(""),
  });

  async function handleConfirmPayment(
    paymentAmount: number,
    customerId: number | null,
    isDebt: boolean
  ) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((c) =>
            c.isManual
              ? { name: c.name, sku: "", price: c.price, quantity: c.quantity }
              : { productId: c.productId, price: c.price, quantity: c.quantity }
          ),
          payment: paymentAmount,
          note: null,
          customerId,
          isDebt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal membuat transaksi");
        return;
      }

      const result = await res.json();
      clearCart();
      setShowPayment(false);
      toast.success(
        `Transaksi berhasil! Invoice: ${result.invoiceNo} | Kembalian: ${formatRupiah(result.change)}`
      );
      router.push(`/pos/struk/${result.id}`);
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        <div className="flex-1 flex flex-col min-h-0 lg:h-[calc(100dvh-7rem)]">
          <div className="flex items-start gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <ProductSearchBar
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
                onEnter={handleAddFirstMatch}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="btn-secondary btn-md flex-shrink-0 mt-0.5"
              title="Input manual item"
            >
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Manual</span>
            </button>
          </div>
          <ProductGrid
            products={products}
            searchQuery={searchQuery}
            onAddToCart={handleAddToCart}
          />
        </div>

        <CartPanel
          cart={cart}
          grandTotal={grandTotal}
          submitting={submitting}
          onUpdateQty={updateQty}
          onRemoveItem={removeItem}
          onSubmit={handleOpenPayment}
        />
      </div>

      <ManualItemModal
        open={showManualInput}
        onClose={() => setShowManualInput(false)}
        onAdd={handleAddManualItem}
      />

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onConfirm={handleConfirmPayment}
        grandTotal={grandTotal}
        submitting={submitting}
        customers={customers}
      />
    </div>
  );
}
