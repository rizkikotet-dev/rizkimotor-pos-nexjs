"use client";

import { forwardRef, useEffect } from "react";
import { Search, X } from "lucide-react";

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

// Search input untuk product catalog. Auto-focus on mount.
// Exposes ref untuk parent agar bisa re-focus saat user add to cart.
export const ProductSearchBar = forwardRef<HTMLInputElement, ProductSearchBarProps>(
  function ProductSearchBar({ value, onChange, onEnter }, ref) {
    useEffect(() => {
      // forwardRef tidak auto-focus; parent panggil ref.current?.focus() setelah addToCart
    }, []);

    return (
      <div className="relative mb-3">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
          aria-hidden="true"
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          placeholder="Ketik nama atau SKU produk..."
          className="input pl-9 pr-9"
          aria-label="Cari produk"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);
