"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Banknote, CreditCard, QrCode, Building2 } from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentAmount: number) => void;
  grandTotal: number;
  submitting: boolean;
}

const PAYMENT_METHODS = [
  { id: "TUNAI", label: "Tunai", icon: Banknote },
  { id: "QRIS", label: "QRIS", icon: QrCode },
  { id: "TRANSFER", label: "Transfer", icon: Building2 },
  { id: "KARTU", label: "Kartu", icon: CreditCard },
];

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

export function PaymentModal({ open, onClose, onConfirm, grandTotal, submitting }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("TUNAI");
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const paymentAmount = Number(inputValue.replace(/\D/g, "")) || 0;
  const change = paymentAmount - grandTotal;
  const isEnough = paymentAmount >= grandTotal;

  useEffect(() => {
    if (open) {
      setInputValue("");
      setPaymentMethod("TUNAI");
      setTimeout(() => inputRef.current?.focus(), 100);
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

  function handleQuickPay(amount: number) {
    setInputValue(amount.toString());
    inputRef.current?.focus();
  }

  function handleExactPay() {
    setInputValue(grandTotal.toString());
    inputRef.current?.focus();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    setInputValue(raw);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isEnough || submitting) return;
    onConfirm(paymentAmount);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Pembayaran">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-base border border-surface-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-outline-variant">
          <div>
            <h2 className="text-base font-bold text-zinc-100">Pembayaran</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Selesaikan transaksi</p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm" aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div className="bg-surface-container rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">Total Belanja</p>
            <p className="text-2xl font-bold text-primary">{formatRupiah(grandTotal)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Metode Bayar</label>
            <div className="grid grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-surface-outline-variant bg-surface-container text-zinc-400 hover:text-zinc-200 hover:border-surface-outline"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="payment-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Nominal Bayar
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">Rp</span>
              <input
                ref={inputRef}
                id="payment-input"
                type="text"
                inputMode="numeric"
                value={paymentAmount > 0 ? paymentAmount.toLocaleString("id-ID") : ""}
                onChange={handleChange}
                placeholder="0"
                className="input pl-10 text-lg font-bold tabular-nums"
                aria-label="Jumlah pembayaran"
                required
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">Bayar Cepat</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleExactPay} className="btn-secondary btn-sm">
                Uang Pas
              </button>
              {QUICK_AMOUNTS.filter((a) => a >= grandTotal).slice(0, 4).map((amount) => (
                <button key={amount} type="button" onClick={() => handleQuickPay(amount)} className="btn-secondary btn-sm">
                  {formatRupiah(amount)}
                </button>
              ))}
            </div>
          </div>

          {paymentAmount > 0 && (
            <div className={`rounded-xl p-3 ${isEnough ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{isEnough ? "Kembalian" : "Kurang"}</span>
                <span className={`text-sm font-bold ${isEnough ? "text-emerald-400" : "text-red-400"}`}>
                  {isEnough ? formatRupiah(change) : formatRupiah(Math.abs(change))}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isEnough || submitting}
            className="btn-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              `Bayar ${paymentAmount > 0 ? formatRupiah(paymentAmount) : ""}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
