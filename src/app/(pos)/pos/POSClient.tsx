"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah } from "@/lib/format";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ProductSearchBar } from "./ProductSearchBar";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { useCart } from "./useCart";
import type { POSClientProps, Customer } from "./types";

// Main orchestrator. Composes:
//   - ProductSearchBar: search input (with focus ref)
//   - ProductGrid: catalog cards
//   - CartPanel: cart items + submit
//   - useCart hook: cart state + business logic
//   - PaymentModal: payment flow (existing @/components/pos)
//
// State flow:
//   1. User search/click product → addToCart() → cart updates → re-render
//   2. User adjust qty/remove → updateQty/removeItem
//   3. User click "Buat Pesanan" → PaymentModal opens
//   4. Confirm payment → POST /api/transactions → success → redirect to receipt
export function POSClient({ products }: POSClientProps) {
  const router = useRouter();
  const toast = useToast();
  const { cart, grandTotal, addToCart, updateQty, removeItem, clearCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
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

  function handleAddToCart(product: Parameters<typeof addToCart>[0], selectedPrice: number) {
    addToCart(product, selectedPrice);
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  function handleOpenPayment() {
    if (cart.length === 0) return;
    setShowPayment(true);
  }

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
          items: cart.map((c) => ({ productId: c.productId, price: c.price, quantity: c.quantity })),
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
          <ProductSearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
          />
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
