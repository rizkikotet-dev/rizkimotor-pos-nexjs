"use client";

import { useEffect, type RefObject } from "react";

interface ShortcutHandlers {
  onFocusSearch: () => void;
  onOpenPayment: () => void;
  onClearSearch: () => void;
  // State for guards — passed as refs/values to avoid stale closures
  searchInputRef: RefObject<HTMLInputElement | null>;
  isPaymentOpen: boolean;
  hasCart: boolean;
  hasSearchQuery: boolean;
}

// Global keyboard shortcuts untuk POS workflow:
//   /  atau F2 → focus search bar (dari mana saja)
//   F9        → buka payment modal (skip jika di input/textarea atau cart kosong)
//   Esc       → clear search (hanya jika target = search input + ada query)
//
// Catatan:
//   - PaymentModal handle Esc-nya sendiri untuk close modal — tidak konflik.
//   - Skip semua shortcut jika ada modifier key (Ctrl/Cmd/Alt) untuk tidak
//     override browser/OS shortcuts.
//   - "Add first product to cart" di-handle oleh ProductSearchBar.onEnter
//     (Enter di search input), bukan di sini — biar logika tetap lokal.
export function useKeyboardShortcuts(h: ShortcutHandlers): void {
  const { onFocusSearch, onOpenPayment, onClearSearch } = h;

  useEffect(() => {
    function isTypingInForm(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
    }

    function handleKeyDown(e: KeyboardEvent): void {
      // Skip jika ada modifier — biarkan browser/OS handle
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target;
      const inForm = isTypingInForm(target);
      const inSearch = target === h.searchInputRef.current;

      // Esc: clear search (jika di search + ada query)
      if (e.key === "Escape") {
        if (inSearch && h.hasSearchQuery) {
          e.preventDefault();
          onClearSearch();
        }
        return;
      }

      // F9: open payment (skip jika di form atau modal sudah terbuka atau cart kosong)
      if (e.key === "F9") {
        if (inForm || h.isPaymentOpen || !h.hasCart) return;
        e.preventDefault();
        onOpenPayment();
        return;
      }

      // / atau F2: focus search (selalu, biar kasir cepat)
      if (e.key === "/" || e.key === "F2") {
        // Skip jika sudah di search (no-op anyway)
        if (inSearch) return;
        e.preventDefault();
        onFocusSearch();
        return;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onFocusSearch, onOpenPayment, onClearSearch, h]);
}
