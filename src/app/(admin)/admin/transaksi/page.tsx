import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

export default async function AdminTransaksiPage() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      debt: { select: { amount: true, paid: true, status: true } },
    },
  });

  return (
    <div>
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Transaksi</h1>
          <p className="text-sm text-zinc-500 mt-0.5 font-mono">{transactions.length} transaksi tercatat</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Invoice</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Kasir</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Tanggal</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Total</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Bayar</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {transactions.map((t) => {
                  const hasDebt = !!t.debt;
                  const debtStatus = t.debt?.status;
                  return (
                    <tr key={t.id} className="hover:bg-surface-container-high transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/transaksi/${t.id}`} className="font-mono text-primary hover:text-primary-400 text-xs transition-colors">
                          {t.invoiceNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-200">{t.user.name}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs">{new Date(t.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-4 py-3 text-right text-primary font-semibold">{formatRupiah(t.total)}</td>
                      <td className="px-4 py-3 text-right text-zinc-400">{formatRupiah(t.payment)}</td>
                      <td className="px-4 py-3 text-right">
                        {hasDebt ? (
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border inline-block ${
                            debtStatus === "PAID" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : debtStatus === "PARTIAL" ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                          }`}>
                            {debtStatus === "PAID" ? "Lunas" : debtStatus === "PARTIAL" ? "Sebagian" : "Utang"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-500/10 border-emerald-500/20 inline-block">
                            Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-zinc-500">
                      <ShoppingCart className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                      Belum ada transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
