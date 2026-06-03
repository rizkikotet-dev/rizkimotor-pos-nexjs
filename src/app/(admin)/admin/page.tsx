import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import {
  Package, ShoppingCart, Users, TrendingUp, ArrowRight,
  AlertTriangle, Clock, Receipt, Banknote, BarChart3
} from "lucide-react";
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    productCount,
    transactionCount,
    userCount,
    totalRevenue,
    todayTransactions,
    todayRevenue,
    lowStockProducts,
    recentTransactions,
    topProducts,
    categoryCount,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.transaction.count(),
    prisma.user.count(),
    prisma.transaction.aggregate({ _sum: { total: true } }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: todayStart } },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.product.findMany({
      where: { active: true, stock: { gte: 0 } },
      select: { id: true, name: true, sku: true, stock: true, minStock: true, category: { select: { name: true } } },
      orderBy: { stock: "asc" },
      take: 50,
    }),
    prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: { select: { productName: true, quantity: true, subtotal: true } },
      },
    }),
    prisma.transactionItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      _count: true,
      where: { productId: { not: null } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.category.count(),
  ]);

  const lowStock = lowStockProducts.filter((p) => p.stock <= (p.minStock || 5));

  const topProductIds = topProducts.map((tp) => tp.productId).filter(Boolean) as number[];
  const topProductDetails = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, price: true },
      })
    : [];
  const topProductMap = new Map(topProductDetails.map((p) => [p.id, p]));

  const todaySales = todayRevenue._sum.total || 0;
  const todayCount = todayTransactions.length;

  const mainStats = [
    {
      label: "Total Produk",
      value: productCount.toString(),
      sub: `${categoryCount} kategori`,
      icon: Package,
      color: "bg-blue-500/10 text-blue-400",
      href: "/admin/produk",
    },
    {
      label: "Total Transaksi",
      value: transactionCount.toString(),
      sub: `${todayCount} hari ini`,
      icon: ShoppingCart,
      color: "bg-emerald-500/10 text-emerald-400",
      href: "/admin/transaksi",
    },
    {
      label: "Total Pengguna",
      value: userCount.toString(),
      sub: "akun aktif",
      icon: Users,
      color: "bg-purple-500/10 text-purple-400",
      href: "/admin/pengguna",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(totalRevenue._sum.total || 0),
      sub: `Hari ini: ${formatRupiah(todaySales)}`,
      icon: TrendingUp,
      color: "bg-amber-500/10 text-amber-400",
      href: "/admin/transaksi",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ringkasan data toko Anda.</p>
      </div>

      {/* Main Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6" aria-label="Ringkasan statistik">
        {mainStats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-4 hover:bg-surface-container-high transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest truncate">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-100 truncate">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 truncate">{stat.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Today's Activity */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Aktivitas Hari Ini</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Transaksi</span>
              <span className="text-sm font-bold text-zinc-200">{todayCount} transaksi</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Pendapatan</span>
              <span className="text-sm font-bold text-emerald-400">{formatRupiah(todaySales)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Rata-rata/Transaksi</span>
              <span className="text-sm font-bold text-zinc-200">
                {todayCount > 0 ? formatRupiah(Math.round(todaySales / todayCount)) : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Stok Menipis</h3>
            {lowStock.length > 0 && (
              <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-mono">
                {lowStock.length}
              </span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-xs text-zinc-500">Semua stok aman.</p>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{p.name}</p>
                    <p className="text-[10px] text-zinc-500">{p.category?.name}</p>
                  </div>
                  <span className={`text-xs font-bold ml-2 ${p.stock === 0 ? "text-red-400" : "text-amber-400"}`}>
                    {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Produk Terlaris</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-xs text-zinc-500">Belum ada penjualan.</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((tp, i) => {
                const prod = tp.productId ? topProductMap.get(tp.productId) : null;
                return (
                  <div key={tp.productId ?? i} className="flex items-center justify-between">
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600 font-mono w-4">{i + 1}.</span>
                      <p className="text-xs text-zinc-300 truncate">{prod?.name ?? tp.productId}</p>
                    </div>
                    <div className="text-right ml-2">
                      <span className="text-xs font-bold text-zinc-200">{tp._sum.quantity}x</span>
                      <span className="text-[10px] text-zinc-500 ml-1">{formatRupiah(tp._sum.subtotal || 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <section className="card" aria-label="Transaksi terbaru">
        <div className="flex items-center justify-between p-4 border-b border-surface-outline-variant">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-200">Transaksi Terbaru</h2>
          </div>
          <Link
            href="/admin/transaksi"
            className="text-xs text-primary hover:text-primary-400 flex items-center gap-1 group"
          >
            Lihat semua
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-outline-variant text-left">
                <th className="px-4 py-2.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-2.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Kasir</th>
                <th className="px-4 py-2.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider hidden sm:table-cell">Item</th>
                <th className="px-4 py-2.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-right">Total</th>
                <th className="px-4 py-2.5 text-[10px] text-zinc-500 font-mono uppercase tracking-wider text-right hidden sm:table-cell">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-outline-variant">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500 text-sm">Belum ada transaksi.</td>
                </tr>
              ) : (
                recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-2.5">
                      <Link href={`/pos/struk/${t.id}`} className="text-xs font-medium text-primary hover:underline">
                        {t.invoiceNo}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-300">{t.user.name}</td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400 hidden sm:table-cell">
                      {t.items.map((it) => it.productName).join(", ")}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-bold text-emerald-400 text-right">{formatRupiah(t.total)}</td>
                    <td className="px-4 py-2.5 text-[10px] text-zinc-500 text-right hidden sm:table-cell whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      {" "}
                      {new Date(t.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
