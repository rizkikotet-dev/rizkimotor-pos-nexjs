import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { Eye, Calendar, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ from?: string; to?: string; userId?: string }>;
}

export default async function AdminTransactionListPage({ searchParams }: PageProps) {
  const user = (await getCurrentUser())!;
  const { from, to, userId } = await searchParams;

  const where: any = {};
  if (from) {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    where.createdAt = { ...where.createdAt, gte: fromDate };
  }
  if (to) {
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);
    where.createdAt = { ...where.createdAt, lte: toDate };
  }
  if (userId) {
    where.userId = parseInt(userId);
  }

  const [transactions, users, totalAgg] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true, _count: { select: { items: true } } },
    }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.transaction.aggregate({ where, _sum: { total: true }, _count: true }),
  ]);

  return (
    <>
      <AdminHeader user={user} title="Transaksi" subtitle="Riwayat semua penjualan" />

      <div className="page-container pb-24 lg:pb-8">
        {/* Filter */}
        <form className="card p-4 flex flex-wrap items-end gap-3 mb-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Dari</label>
            <input type="date" name="from" defaultValue={from} className="input-sm w-full" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Sampai</label>
            <input type="date" name="to" defaultValue={to} className="input-sm w-full" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Kasir</label>
            <select name="userId" defaultValue={userId ?? ""} className="input-sm w-full bg-white">
              <option value="">Semua</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          {(from || to || userId) && (
            <Link href="/admin/transaksi" className="btn-ghost text-sm">
              Reset
            </Link>
          )}
        </form>

        {/* Summary */}
        <div className="card px-5 py-3.5 flex items-center justify-between text-sm mb-4">
          <span className="text-surface-500">
            {totalAgg._count} transaksi &middot; {transactions.length} ditampilkan
          </span>
          <span className="font-bold text-surface-900">
            Total: {formatRupiah(totalAgg._sum.total ?? 0)}
          </span>
        </div>

        {/* List */}
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
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden md:table-cell">Kasir</th>
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
                      <td className="px-4 py-3.5 text-surface-600 hidden md:table-cell">{t.user.name}</td>
                      <td className="px-4 py-3.5 text-center">{t._count.items}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-brand-600">
                        {formatRupiah(t.total)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/transaksi/${t.id}`}
                          className="btn-ghost text-xs px-2.5 py-1.5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detail
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
    </>
  );
}
