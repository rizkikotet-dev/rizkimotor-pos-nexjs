"use client";

import { useState, useRef, useEffect } from "react";
import { X, Loader2, Banknote, CreditCard, QrCode, Building2, UserPlus, Search } from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (paymentAmount: number, customerId: number | null, isDebt: boolean) => void;
  grandTotal: number;
  submitting: boolean;
  customers: Customer[];
}

const PAYMENT_METHODS = [
  { id: "TUNAI", label: "Tunai", icon: Banknote },
  { id: "QRIS", label: "QRIS", icon: QrCode },
  { id: "TRANSFER", label: "Transfer", icon: Building2 },
  { id: "KARTU", label: "Kartu", icon: CreditCard },
];

const QUICK_AMOUNTS = [50000, 100000, 150000, 200000, 500000];

export function PaymentModal({ open, onClose, onConfirm, grandTotal, submitting, customers }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("TUNAI");
  const [inputValue, setInputValue] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [isDebt, setIsDebt] = useState(false);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const customerSearchRef = useRef<HTMLInputElement>(null);

  const paymentAmount = Number(inputValue.replace(/\D/g, "")) || 0;
  const change = paymentAmount - grandTotal;
  const isEnough = paymentAmount >= grandTotal;

  useEffect(() => {
    if (open) {
      setInputValue("");
      setPaymentMethod("TUNAI");
      setSelectedCustomer(null);
      setIsDebt(false);
      setShowCustomerList(false);
      setCustomerSearch("");
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

  function handleToggleDebt() {
    if (!selectedCustomer) return;
    setIsDebt(!isDebt);
    if (!isDebt) {
      setInputValue("0");
    } else {
      setInputValue("");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (isDebt && selectedCustomer) {
      onConfirm(0, selectedCustomer.id, true);
    } else if (isEnough) {
      onConfirm(paymentAmount, selectedCustomer?.id || null, false);
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone || "").includes(q);
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Pembayaran">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-surface-base border border-surface-outline-variant rounded-2xl shadow-2xl overflow-hidden animate-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-outline-variant sticky top-0 bg-surface-base z-10">
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
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Pelanggan</label>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{selectedCustomer.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{selectedCustomer.name}</p>
                    {selectedCustomer.phone && <p className="text-[10px] text-zinc-500">{selectedCustomer.phone}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedCustomer(null); setIsDebt(false); }}
                  className="btn-ghost btn-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowCustomerList(!showCustomerList); setTimeout(() => customerSearchRef.current?.focus(), 50); }}
                  className="w-full flex items-center gap-2 p-3 rounded-lg border border-surface-outline-variant bg-surface-container text-zinc-400 hover:text-zinc-200 hover:border-surface-outline transition-colors text-sm text-left"
                >
                  <UserPlus className="h-4 w-4" />
                  Pilih Pelanggan (opsional)
                </button>
                {showCustomerList && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-base border border-surface-outline-variant rounded-lg shadow-xl z-20 max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-surface-outline-variant">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                        <input
                          ref={customerSearchRef}
                          type="text"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Cari nama atau no. HP..."
                          className="input pl-7 py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-44">
                      {filteredCustomers.length === 0 ? (
                        <p className="p-3 text-xs text-zinc-500 text-center">Tidak ditemukan</p>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setSelectedCustomer(c); setShowCustomerList(false); setCustomerSearch(""); }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-container-high transition-colors text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-zinc-200 truncate">{c.name}</p>
                              {c.phone && <p className="text-[10px] text-zinc-500">{c.phone}</p>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="flex items-center justify-between p-3 rounded-lg border border-surface-outline-variant bg-surface-container">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDebt ? "bg-amber-500/10" : "bg-surface-container-high"}`}>
                  <span className="text-xs">🏷️</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Bayar Nanti (Utang)</p>
                  <p className="text-[10px] text-zinc-500">Transaksi dicatat sebagai utang</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleDebt}
                className={`relative w-11 h-6 rounded-full transition-colors ${isDebt ? "bg-primary" : "bg-surface-container-high"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isDebt ? "left-6" : "left-1"}`} />
              </button>
            </div>
          )}

          {!isDebt && (
            <>
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
            </>
          )}

          <button
            type="submit"
            disabled={submitting || (!isDebt && !isEnough)}
            className="btn-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : isDebt ? (
              "Catat Utang"
            ) : (
              `Bayar ${paymentAmount > 0 ? formatRupiah(paymentAmount) : ""}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
