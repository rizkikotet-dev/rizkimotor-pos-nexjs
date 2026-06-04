"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import type { Product, CartItem } from "./types";

interface UseCartReturn {
  cart: CartItem[];
  grandTotal: number;
  addToCart: (product: Product, selectedPrice: number) => void;
  addManualItem: (name: string, price: number, quantity: number) => void;
  updateQty: (productId: number, price: number, delta: number) => void;
  removeItem: (productId: number, price: number) => void;
  clearCart: () => void;
}

// Counter untuk ID unik item manual (negatif agar tidak tabrakan dengan productId dari DB)
let manualIdCounter = 0;

// Custom hook untuk cart state management. Extracted dari POSClient
// untuk testability + reusability. Pure state — no UI.
export function useCart(): UseCartReturn {
  const toast = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (product: Product, selectedPrice: number) => {
      let didAdd = false;
      setCart((prev) => {
        const existing = prev.find(
          (c) => c.productId === product.id && c.price === selectedPrice
        );
        if (existing) {
          if (existing.quantity >= product.stock) {
            toast.warning(`Stok maksimal ${product.stock}`);
            return prev;
          }
          didAdd = true;
          return prev.map((c) =>
            c.productId === product.id && c.price === selectedPrice
              ? { ...c, quantity: c.quantity + 1 }
              : c
          );
        }
        if (product.stock <= 0) {
          toast.error("Stok habis");
          return prev;
        }
        didAdd = true;
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: selectedPrice,
            quantity: 1,
            maxStock: product.stock,
          },
        ];
      });
      return didAdd;
    },
    [toast]
  );

  const addManualItem = useCallback((name: string, price: number, quantity: number) => {
    setCart((prev) => {
      // Merge jika item manual dengan nama+harga sama sudah ada
      const existing = prev.find((c) => c.isManual && c.name === name && c.price === price);
      if (existing) {
        return prev.map((c) =>
          c.isManual && c.name === name && c.price === price
            ? { ...c, quantity: c.quantity + quantity }
            : c
        );
      }
      manualIdCounter++;
      return [
        ...prev,
        {
          productId: -manualIdCounter,
          name,
          price,
          quantity,
          maxStock: 999999,
          isManual: true,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId: number, price: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId || item.price !== price) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((productId: number, price: number) => {
    setCart((prev) =>
      prev.filter((c) => !(c.productId === productId && c.price === price))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return { cart, grandTotal, addToCart, addManualItem, updateQty, removeItem, clearCart };
}
