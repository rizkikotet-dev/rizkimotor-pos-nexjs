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
      accent: "bg-emerald-500",
    },
    {
      label: "Penjualan Bulan Ini",
      value: formatRupiah(monthAgg._sum.total ?? 0),
      sub: `${monthAgg._count} transaksi`,
      icon: TrendingUp,
      accent: "bg-blue-500",
    },
    {
      label: "Total Produk",
      value: productCount.toString(),
      sub: `${categoryCount} kategori`,
      icon: Package,
      accent: "bg-brand-500",
    },
    {
      label: "Stok Menipis",
      value: lowStockProducts.length.toString(),
      sub: "perlu restock",
      icon: AlertTriangle,
      accent: "bg-amber-500",
    },
  ];

  return (
    <>
      <AdminHeader user={user} title="Dashboard" subtitle="Ringkasan operasional toko" />

      <div className="page-container pb-24 lg:pb-8 relative">
        <div className="absolute inset-0 grain" />

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 relative">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card p-4 lg:p-5 stagger-item group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${s.accent} opacity-60`} />
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-mono text-surface-400 uppercase tracking-[0.12em]">{s.label}</p>
                  <div className="p-2 rounded-xl bg-surface-50 text-surface-500 group-hover:bg-surface-100 transition-colors">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="font-display text-xl lg:text-2xl font-800 text-ink tracking-tight">{s.value}</p>
                <p className="text-xs text-surface-400 mt-1 font-mono">{s.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 relative">
          {/* LOW STOCK */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="font-display font-700 text-ink">Stok Menipis</h2>
              </div>
              <Link href="/admin/produk" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 group">
                Lihat semua <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-400">Semua stok aman</p>
            ) : (
              <ul className="divide-y divide-surface-100">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                      <p className="text-xs text-surface-400 font-mono">{p.category.name} &middot; {p.sku}</p>
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
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
                  <Receipt className="h-4 w-4" />
                </div>
                <h2 className="font-display font-700 text-ink">Transaksi Terbaru</h2>
              </div>
              <Link href="/admin/transaksi" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 group">
                Lihat semua <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            {recentTransactions.length === 0 ? (
              <p className="p-8 text-center text-sm text-surface-400">Belum ada transaksi</p>
            ) : (
              <ul className="divide-y divide-surface-100">
                {recentTransactions.map((t) => (
                  <li key={t.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium text-ink">{t.invoiceNo}</p>
                      <p className="text-xs text-surface-400">
                        {t.user.name} &middot; {t._count.items} item &middot; {formatDateTime(t.createdAt)}
                      </p>
                    </div>
                    <p className="font-display font-800 text-brand-600 text-sm">
                      {formatRupiah(t.total)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="card p-5 relative">
          <h2 className="font-display font-700 text-ink mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:gap-3">
            <Link
              href="/admin/produk/tambah"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
            >
              + Produk Baru
            </Link>
            <Link
              href="/admin/kategori"
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
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
              className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-all duration-200 border border-surface-200"
            >
              + Pengguna
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
