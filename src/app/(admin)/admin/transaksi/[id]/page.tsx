import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime, formatDate } from "@/lib/format";
import { ArrowLeft, Receipt, Printer, User, Calendar, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTransactionDetailPage({ params }: PageProps) {
  const user = (await getCurrentUser())!;
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true, items: true },
  });
  if (!transaction) notFound();

  return (
    <>
      <AdminHeader user={user} title="Detail Transaksi" subtitle={transaction.invoiceNo} />

      <div className="page-container max-w-3xl pb-24 lg:pb-8">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin/transaksi" className="btn-ghost text-sm">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar
          </Link>
          <Link
            href={`/pos/struk/${transaction.id}?from=admin`}
            target="_blank"
            className="btn-primary text-sm"
          >
            <Printer className="h-4 w-4" />
            Cetak Struk
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { icon: Hash, label: "Invoice", value: transaction.invoiceNo, mono: true },
            { icon: User, label: "Kasir", value: transaction.user.name },
            { icon: Calendar, label: "Tanggal", value: formatDateTime(transaction.createdAt) },
          ].map((card, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center gap-2 text-surface-500 text-xs mb-1.5">
                <card.icon className="h-3.5 w-3.5" />
                <span className="font-medium">{card.label}</span>
              </div>
              <p className={`font-semibold text-surface-900 ${card.mono ? "font-mono" : ""}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Items */}
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-surface-900">Item ({transaction.items.length})</h2>
          </div>

          {transaction.items.length === 0 ? (
            <p className="p-8 text-center text-sm text-surface-500">Tidak ada item.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Produk</th>
                    <th className="text-center px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Qty</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">@Harga</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {transaction.items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-surface-900">{item.productName}</div>
                        <div className="text-xs text-surface-500 font-mono mt-0.5">{item.productSku}</div>
                      </td>
                      <td className="px-4 py-3.5 text-center font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-right">{formatRupiah(item.price)}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-surface-900">{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="card p-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Subtotal</span>
            <span className="font-medium">{formatRupiah(transaction.total)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-surface-200 pt-2">
            <span>Total</span>
            <span className="text-brand-600">{formatRupiah(transaction.total)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500 pt-1">
            <span>Bayar</span>
            <span>{formatRupiah(transaction.payment)}</span>
          </div>
          <div className="flex justify-between text-sm text-surface-500">
            <span>Kembali</span>
            <span>{formatRupiah(transaction.change)}</span>
          </div>
        </div>

        {transaction.note && (
          <div className="card p-4 mt-4">
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider mb-1">Catatan</p>
            <p className="text-sm text-surface-700">{transaction.note}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-surface-400 text-center font-mono">
          ID Transaksi: {transaction.id} &middot; Dibuat: {formatDate(transaction.createdAt)}
        </div>
      </div>
    </>
  );
}
