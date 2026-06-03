"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatRupiah } from "@/lib/format";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Search,
  DollarSign,
  X,
} from "lucide-react";

interface Debt {
  id: number;
  amount: number;
  paid: number;
  status: string;
  createdAt: string;
  customer: { id: number; name: string; phone: string | null };
  transaction: { invoiceNo: string; total: number };
}

export default function UtangPiutangPage() {
  const toast = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNPAID" | "PARTIAL" | "PAID">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchDebts();
  }, [filter]);

  async function fetchDebts() {
    setLoading(true);
    try {
      const url = filter === "ALL" ? "/api/debts" : `/api/debts?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) setDebts(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function handlePay() {
    if (!payingId || !payAmount) return;
    const amount = Number(payAmount.replace(/\D/g, ""));
    if (amount <= 0) return;

    setPaying(true);
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ debtId: payingId, amount }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal membayar");
        return;
      }

      toast.success("Pembayaran tercatat");
      setPayingId(null);
      setPayAmount("");
      fetchDebts();
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setPaying(false);
    }
  }

  const filtered = debts.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.customer.name.toLowerCase().includes(q) || d.transaction.invoiceNo.toLowerCase().includes(q);
  });

  const totalOutstanding = debts
    .filter((d) => d.status !== "PAID")
    .reduce((sum, d) => sum + (d.amount - d.paid), 0);

  const unpaidCount = debts.filter((d) => d.status !== "PAID").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100">Utang & Piutang</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Kelola utang pelanggan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="card p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Berutang</p>
          <p className="text-xl font-bold text-red-400">{formatRupiah(totalOutstanding)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-zinc-500 mb-1">Belum Lunas</p>
          <p className="text-xl font-bold text-amber-400">{unpaidCount} transaksi</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-zinc-500 mb-1">Lunas</p>
          <p className="text-xl font-bold text-emerald-400">{debts.filter((d) => d.status === "PAID").length} transaksi</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-1 p-1 bg-surface-container rounded-lg">
          {(["ALL", "UNPAID", "PARTIAL", "PAID"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-sm rounded-md transition-colors ${
                filter === f ? "bg-primary/10 text-primary font-medium" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f === "ALL" ? "Semua" : f === "UNPAID" ? "Belum Bayar" : f === "PARTIAL" ? "Sebagian" : "Lunas"}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pelanggan atau invoice..."
            className="input pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Tidak ada data utang</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((debt) => {
            const remaining = debt.amount - debt.paid;
            const statusColor =
              debt.status === "PAID"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : debt.status === "PARTIAL"
                ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20";

            return (
              <div
                key={debt.id}
                className="p-3 rounded-lg border border-surface-outline-variant bg-surface-container-low"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-zinc-200">{debt.customer.name}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${statusColor}`}>
                        {debt.status === "PAID" ? "Lunas" : debt.status === "PARTIAL" ? "Sebagian" : "Belum Bayar"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Invoice: {debt.transaction.invoiceNo}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-zinc-400">
                        Total: <span className="text-zinc-200 font-medium">{formatRupiah(debt.amount)}</span>
                      </span>
                      {debt.paid > 0 && (
                        <span className="text-zinc-400">
                          Dibayar: <span className="text-emerald-400 font-medium">{formatRupiah(debt.paid)}</span>
                        </span>
                      )}
                      {remaining > 0 && (
                        <span className="text-zinc-400">
                          Sisa: <span className="text-red-400 font-medium">{formatRupiah(remaining)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {debt.status !== "PAID" && (
                    <button
                      onClick={() => {
                        setPayingId(debt.id);
                        setPayAmount(remaining.toString());
                      }}
                      className="btn-primary btn-sm flex-shrink-0"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {payingId && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayingId(null)} />
          <div className="relative bg-surface-base border border-surface-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-100">Bayar Utang</h3>
              <button onClick={() => setPayingId(null)} className="btn-ghost btn-sm">
                <X className="h-4 w-4" />
              </button>
            </div>

            {(() => {
              const debt = debts.find((d) => d.id === payingId);
              if (!debt) return null;
              const remaining = debt.amount - debt.paid;
              return (
                <>
                  <p className="text-sm text-zinc-400 mb-1">
                    {debt.customer.name} — {debt.transaction.invoiceNo}
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Sisa utang: <span className="text-red-400 font-medium">{formatRupiah(remaining)}</span>
                  </p>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Nominal Bayar
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={payAmount ? Number(payAmount.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                        onChange={(e) => setPayAmount(e.target.value.replace(/\D/g, ""))}
                        className="input pl-10 text-lg font-bold"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setPayAmount(remaining.toString())}
                      className="btn-secondary btn-sm"
                    >
                      Lunas
                    </button>
                    {[50000, 100000, 200000].filter((a) => a <= remaining).map((a) => (
                      <button
                        key={a}
                        onClick={() => setPayAmount(a.toString())}
                        className="btn-secondary btn-sm"
                      >
                        {formatRupiah(a)}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handlePay}
                    disabled={paying || Number(payAmount.replace(/\D/g, "")) <= 0}
                    className="btn-primary w-full"
                  >
                    {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                    <CheckCircle className="h-4 w-4" />
                    Konfirmasi Pembayaran
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
