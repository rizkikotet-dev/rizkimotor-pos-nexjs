import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { ProductDeleteButton } from "./ProductDeleteButton";
import { formatRupiah } from "@/lib/format";
import { Package, Plus, Pencil, Eye, EyeOff } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProductListPage() {
  const user = (await getCurrentUser())!;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <>
      <AdminHeader user={user} title="Produk" subtitle="Kelola katalog produk" />

      <div className="page-container pb-24 lg:pb-8 relative">
        <div className="absolute inset-0 grain" />

        <div className="flex items-center justify-between mb-4 relative">
          <p className="text-sm text-surface-400 font-mono">{products.length} produk terdaftar</p>
          <Link
            href="/admin/produk/tambah"
            className="btn-primary text-sm"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>

        <div className="card overflow-hidden relative">
          {products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-100 rounded-2xl mb-4">
                <Package className="h-8 w-8 text-surface-300" />
              </div>
              <p className="text-surface-500 font-medium mb-3">Belum ada produk.</p>
              <Link href="/admin/produk/tambah" className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Tambah Produk Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em]">Produk</th>
                    <th className="text-left px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em] hidden sm:table-cell">Kategori</th>
                    <th className="text-right px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em]">Harga</th>
                    <th className="text-center px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em]">Stok</th>
                    <th className="text-center px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em] hidden md:table-cell">Status</th>
                    <th className="text-right px-4 py-3 font-mono text-[10px] font-semibold text-surface-400 uppercase tracking-[0.12em]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-ink">{p.name}</div>
                        <div className="text-xs text-surface-400 font-mono mt-0.5">{p.sku}</div>
                      </td>
                      <td className="px-4 py-3.5 text-surface-500 hidden sm:table-cell">{p.category.name}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-ink">
                        {formatRupiah(p.price)}
                        {p.priceReseller > 0 && (
                          <div className="text-[10px] text-brand-600 font-medium mt-0.5">
                            Reseller: {formatRupiah(p.priceReseller)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`badge ${
                          p.stock === 0 ? "badge-danger" : p.stock <= p.minStock ? "badge-warning" : "badge-success"
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden md:table-cell">
                        {p.active ? (
                          <span className="badge-success">
                            <Eye className="h-3 w-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="badge-neutral">
                            <EyeOff className="h-3 w-3" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/produk/${p.id}/edit`}
                            className="btn-ghost p-1.5 rounded-lg"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <ProductDeleteButton id={p.id} name={p.name} />
                        </div>
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
