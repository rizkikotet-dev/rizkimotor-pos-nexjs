import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/format";
import { buildPaginationMeta, parsePagination } from "@/lib/pagination";
import { Pagination } from "@/components/ui/Pagination";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { DeleteButton } from "./DeleteButton";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function AdminProdukPage({ searchParams }: PageProps) {
  const { q, page: pageStr, pageSize: pageSizeStr } = await searchParams;
  const query = q?.trim() || "";
  const { page, pageSize, skip, take } = parsePagination({ page: pageStr, pageSize: pageSizeStr });
  const preserve = { q, pageSize: pageSizeStr };

  const where = query
    ? {
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { description: { contains: query } },
          { category: { name: { contains: query } } },
        ],
      }
    : {};

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
      skip,
      take,
      include: { category: true },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const pagination = buildPaginationMeta(page, pageSize, total);

  return (
    <div>
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Produk</h1>
            <p className="text-sm text-zinc-500 mt-0.5 font-mono">{total} produk ditemukan</p>
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
                  <tr
                    key={product.id}
                    className={`hover:bg-surface-container-high transition-colors ${
                      product.stock < 3
                        ? "bg-red-600/[0.04]"
                        : product.stock <= 5
                          ? "bg-amber-600/[0.02]"
                          : ""
                    }`}
                  >
                    <td className={`px-4 py-3 ${product.stock < 3 ? "border-l-2 border-l-red-500/60" : ""}`}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={40}
                          height={40}
                          unoptimized
                          className="rounded-lg object-cover border border-surface-outline-variant"
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
                      {product.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 bg-red-600/15 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                          Habis
                        </span>
                      ) : product.stock < 3 ? (
                        <span className="inline-flex items-center gap-1 bg-red-600/15 text-red-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {product.stock}
                        </span>
                      ) : product.stock <= 5 ? (
                        <span className="inline-flex items-center gap-1 bg-amber-600/15 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {product.stock}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">{product.stock}</span>
                      )}
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
        <div className="mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            basePath="/admin/produk"
            pageSize={pageSize}
            preserveParams={preserve}
          />
        </div>
      </FadeIn>
    </div>
  );
}
