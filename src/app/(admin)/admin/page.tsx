import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, transactionCount, userCount, recentTransactions, totalRevenue] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.transaction.count(),
    prisma.user.count(),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.transaction.aggregate({ _sum: { total: true } }),
  ]);

  const stats = [
    {
      label: "Total Produk",
      value: productCount,
      icon: Package,
      color: "bg-primary/10 text-primary",
      href: "/admin/produk",
    },
    {
      label: "Total Transaksi",
      value: transactionCount,
      icon: ShoppingCart,
      color: "bg-emerald-500/10 text-emerald-400",
      href: "/admin/transaksi",
    },
    {
      label: "Total Pengguna",
      value: userCount,
      icon: Users,
      color: "bg-zinc-500/10 text-zinc-400",
      href: "/admin/pengguna",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(totalRevenue._sum.total || 0),
      icon: TrendingUp,
      color: "bg-emerald-500/10 text-emerald-400",
      href: "/admin/transaksi",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Ringkasan data toko Anda.</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8" aria-label="Ringkasan statistik">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card p-4 hover:bg-surface-container-high transition-colors group">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest truncate">{stat.label}</p>
                <p className="text-xl font-bold text-zinc-100 truncate">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="card" aria-label="Transaksi terbaru">
        <div className="flex items-center justify-between p-4 border-b border-surface-outline-variant">
          <h2 className="text-sm font-semibold text-zinc-200">Transaksi Terbaru</h2>
          <Link
            href="/admin/transaksi"
            className="text-xs text-primary hover:text-primary-400 flex items-center gap-1 group"
          >
            Lihat semua
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
        </div>
        <div className="divide-y divide-surface-outline-variant">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">Belum ada transaksi.</div>
          ) : (
            recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-surface-container-high transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">#{t.invoiceNo}</p>
                  <p className="text-xs text-zinc-500">{t.user.name} &middot; {new Date(t.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-bold text-primary">{formatRupiah(t.total)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
