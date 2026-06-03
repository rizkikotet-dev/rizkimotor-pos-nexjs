import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminProdukPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { sku: { contains: query } },
                { description: { contains: query } },
                { category: { name: { contains: query } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Produk</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-mono">{products.length} produk ditemukan</p>
          </div>
          <Link href="/admin/produk/tambah" className="btn-primary">
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <div className="mb-4">
          <form>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari nama, SKU, atau kategori..."
              className="input"
            />
          </form>
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Gambar</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Nama Produk</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">SKU</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Kategori</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Harga</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Harga Reseller</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Stok</th>
                  <th className="px-4 py-3 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-3">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-surface-outline-variant"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-surface-outline-variant flex items-center justify-center">
                          <Package className="h-5 w-5 text-zinc-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-200 max-w-[200px] truncate">{product.name}</td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3 text-zinc-400">{product.category.name}</td>
                    <td className="px-4 py-3 text-right text-primary font-semibold">{formatRupiah(product.price)}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{product.priceReseller ? formatRupiah(product.priceReseller) : "-"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={product.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/produk/${product.id}/edit`}
                          className="p-1.5 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                      Tidak ada produk ditemukan.
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
