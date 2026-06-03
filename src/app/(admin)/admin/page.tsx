import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { TrendingUp, Package, AlertTriangle, Receipt, DollarSign, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = (await getCurrentUser())!;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    todayAgg,
    monthAgg,
    productCount,
    categoryCount,
    lowStockProducts,
    todayTransactions,
    recentTransactions,
  ] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfDay } },
    }),
    prisma.transaction.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: startOfMonth } },
    }),
    prisma.product.count({ where: { active: true } }),
    prisma.category.count(),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: "asc" },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: startOfDay } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, _count: { select: { items: true } } },
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true, _count: { select: { items: true } } },
    }),
  ]);

  const stats = [
    {
      label: "Penjualan Hari Ini",
      value: formatRupiah(todayAgg._sum.total ?? 0),
      sub: `${todayAgg._count} transaksi`,
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Penjualan Bulan Ini",
      value: formatRupiah(monthAgg._sum.total ?? 0),
      sub: `${monthAgg._count} transaksi`,
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Produk",
      value: productCount.toString(),
      sub: `${categoryCount} kategori`,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Stok Menipis",
      value: lowStockProducts.length.toString(),
      sub: "perlu restock",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <>
      <AdminHeader user={user} title="Dashboard" subtitle="Ringkasan operasional toko" />

      <div className="page-container pb-24 lg:pb-8">
        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-4 lg:p-5 stagger-item">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-surface-500 font-medium">{s.label}</p>
                  <div className={`p-2 rounded-xl ${s.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xl lg:text-2xl font-bold text-surface-900 tracking-tight">{s.value}</p>
                <p className="text-xs text-surface-500 mt-1">{s.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* LOW STOCK */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="font-semibold text-surface-900">Stok Menipis</h2>
              </div>
              <Link href="/admin/produk" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-500">Semua stok aman</p>
            ) : (
              <ul className="divide-y divide-surface-100">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{p.name}</p>
                      <p className="text-xs text-surface-500">{p.category.name} &middot; {p.sku}</p>
                    </div>
                    <span className={`badge ${p.stock === 0 ? "badge-danger" : "badge-warning"}`}>
                      {p.stock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-brand-600" />
                <h2 className="font-semibold text-surface-900">Transaksi Terbaru</h2>
              </div>
              <Link href="/admin/transaksi" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-500">Belum ada transaksi</p>
            ) : (
              <ul className="divide-y divide-surface-100">
                {recentTransactions.map((t) => (
                  <li key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium text-surface-900">{t.invoiceNo}</p>
                      <p className="text-xs text-surface-500">
                        {t.user.name} &middot; {t._count.items} item &middot; {formatDateTime(t.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-brand-600">
                      {formatRupiah(t.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card p-5">
          <h2 className="font-semibold text-surface-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
            <Link
              href="/admin/produk/tambah"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-700 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
            >
              + Produk Baru
            </Link>
            <Link
              href="/admin/kategori"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-700 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
            >
              + Kategori
            </Link>
            <Link
              href="/pos"
              className="btn-primary py-3 rounded-xl"
            >
              <ShoppingCart className="h-4 w-4" />
              Buka Kasir
            </Link>
            <Link
              href="/admin/pengguna"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-700 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
            >
              + Pengguna
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
