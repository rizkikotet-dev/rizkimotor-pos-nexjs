import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime, formatDate } from "@/lib/format";
import { ArrowLeft, Receipt, Printer, User, Calendar, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTransactionDetailPage({ params }: PageProps) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true, items: true },
  });
  if (!transaction) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/transaksi" className="text-sm text-zinc-500 hover:text-primary flex items-center gap-1 group transition-colors">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke daftar
        </Link>
        <Link
          href={`/pos/struk/${transaction.id}?from=admin`}
          target="_blank"
          className="btn-primary"
        >
          <Printer className="h-4 w-4" />
          Cetak Struk
        </Link>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {[
          { icon: Hash, label: "Invoice", value: transaction.invoiceNo, mono: true },
          { icon: User, label: "Kasir", value: transaction.user.name },
          { icon: Calendar, label: "Tanggal", value: formatDateTime(transaction.createdAt) },
        ].map((card, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1.5">
              <card.icon className="h-3.5 w-3.5" />
              <span className="font-mono uppercase tracking-widest text-[10px]">{card.label}</span>
            </div>
            <p className={`font-semibold text-zinc-200 ${card.mono ? "font-mono" : ""}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="card overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-surface-outline-variant flex items-center gap-2">
          <Receipt className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-zinc-200">Item ({transaction.items.length})</h2>
        </div>

        {transaction.items.length === 0 ? (
          <p className="p-8 text-center text-sm text-zinc-500">Tidak ada item.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Produk</th>
                  <th className="px-4 py-3 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Qty</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">@Harga</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {transaction.items.map((item) => (
                  <tr key={item.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-200">{item.productName}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">{item.productSku}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-zinc-200">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{formatRupiah(item.price)}</td>
                    <td className="px-4 py-3 text-right font-bold text-zinc-100">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500">Subtotal</span>
          <span className="font-medium text-zinc-200">{formatRupiah(transaction.total)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-surface-outline-variant pt-2">
          <span className="text-zinc-200">Total</span>
          <span className="text-primary">{formatRupiah(transaction.total)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500 pt-1">
          <span>Bayar</span>
          <span>{formatRupiah(transaction.payment)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Kembali</span>
          <span>{formatRupiah(transaction.change)}</span>
        </div>
      </div>

      {transaction.note && (
        <div className="card p-4 mt-4">
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">Catatan</p>
          <p className="text-sm text-zinc-300">{transaction.note}</p>
        </div>
      )}

      <div className="mt-4 text-[10px] text-zinc-600 text-center font-mono">
        ID Transaksi: {transaction.id} &middot; Dibuat: {formatDate(transaction.createdAt)}
      </div>
    </div>
  );
}
