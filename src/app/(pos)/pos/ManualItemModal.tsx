"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface ManualItemModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number, quantity: number) => void;
}

export function ManualItemModal({ open, onClose, onAdd }: ManualItemModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setPrice("");
      setQuantity("1");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    const priceNum = parseInt(price.replace(/\D/g, ""));
    const qtyNum = parseInt(quantity) || 1;
    if (!cleanName || !priceNum) return;
    onAdd(cleanName, priceNum, Math.max(1, qtyNum));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Input manual item">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-surface-base border border-surface-outline-variant rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-outline-variant">
          <h2 className="text-sm font-bold text-zinc-100">Input Manual Item</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[32px] min-w-[32px]"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="manual-name" className="block text-[10px] font-mono text-primary uppercase tracking-widest mb-1.5">
              Nama Item
            </label>
            <input
              ref={nameRef}
              id="manual-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama item / jasa..."
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="manual-price" className="block text-[10px] font-mono text-primary uppercase tracking-widest mb-1.5">
                Harga
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 select-none pointer-events-none">Rp</span>
                <input
                  id="manual-price"
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="input pl-8"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="manual-qty" className="block text-[10px] font-mono text-primary uppercase tracking-widest mb-1.5">
                Jumlah
              </label>
              <input
                id="manual-qty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div className="pt-1">
            <button type="submit" className="btn-primary w-full justify-center">
              Tambah ke Keranjang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
