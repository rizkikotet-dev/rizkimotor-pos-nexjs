import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { Printer } from "lucide-react";

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
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Riwayat Transaksi</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {user.role === "ADMIN" ? "Semua transaksi" : "Transaksi Anda"} &middot; Total:{" "}
            <span className="font-bold text-primary">
              {formatRupiah(totalAgg._sum.total ?? 0)}
            </span>
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {transactions.length === 0 ? (
          <p className="p-12 text-center text-sm text-zinc-500">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-surface-outline-variant">
                <tr>
                  <th className="text-left px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Invoice</th>
                  <th className="text-left px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold hidden sm:table-cell">Tanggal</th>
                  {user.role === "ADMIN" && (
                    <th className="text-left px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold hidden md:table-cell">Kasir</th>
                  )}
                  <th className="text-center px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Item</th>
                  <th className="text-right px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Total</th>
                  <th className="text-right px-4 py-3 text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-3.5 font-mono font-medium text-zinc-200">{t.invoiceNo}</td>
                    <td className="px-4 py-3.5 text-zinc-500 text-xs hidden sm:table-cell">{formatDateTime(t.createdAt)}</td>
                    {user.role === "ADMIN" && (
                      <td className="px-4 py-3.5 text-zinc-400 hidden md:table-cell">{t.user.name}</td>
                    )}
                    <td className="px-4 py-3.5 text-center">
                      <span className="tag-brand text-[10px]">{t._count.items}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-primary">
                      {formatRupiah(t.total)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/pos/struk/${t.id}`}
                        target="_blank"
                        className="btn-ghost text-xs px-2.5 py-1.5"
                      >
                        <Printer className="h-3.5 w-3.5" aria-hidden="true" />
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
