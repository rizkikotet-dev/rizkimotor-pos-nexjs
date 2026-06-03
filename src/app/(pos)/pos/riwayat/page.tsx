import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { ArrowLeft, Receipt, Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PosRiwayatPage() {
  const user = (await getCurrentUser())!;

  const where = user.role === "ADMIN" ? {} : { userId: parseInt(user.id) };

  const [transactions, totalAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: true, _count: { select: { items: true } } },
    }),
    prisma.transaction.aggregate({ where, _sum: { total: true } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-surface-500 mt-1">
            {user.role === "ADMIN" ? "Semua transaksi" : "Transaksi Anda"} &middot; Total:{" "}
            <span className="font-bold text-brand-600">
              {formatRupiah(totalAgg._sum.total ?? 0)}
            </span>
          </p>
        </div>
        <Link href="/pos" className="btn-primary text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
      </div>

      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <p className="p-12 text-center text-sm text-surface-500">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Invoice</th>
                  <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden sm:table-cell">Tanggal</th>
                  {user.role === "ADMIN" && (
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden md:table-cell">Kasir</th>
                  )}
                  <th className="text-center px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Item</th>
                  <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-surface-900">{t.invoiceNo}</td>
                    <td className="px-4 py-3.5 text-surface-500 text-xs hidden sm:table-cell">{formatDateTime(t.createdAt)}</td>
                    {user.role === "ADMIN" && (
                      <td className="px-4 py-3.5 text-surface-600 hidden md:table-cell">{t.user.name}</td>
                    )}
                    <td className="px-4 py-3.5 text-center">{t._count.items}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-brand-600">
                      {formatRupiah(t.total)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/pos/struk/${t.id}`}
                        target="_blank"
                        className="btn-ghost text-xs px-2.5 py-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Struk
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
