import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { Search, X, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ProductListPage({ searchParams }: PageProps) {
  const { category, q } = await searchParams;
  const categoryId = category ? parseInt(category) : undefined;
  const query = q?.trim() || "";

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: {
        active: true,
        ...(categoryId ? { categoryId } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { sku: { contains: query } },
                { description: { contains: query } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10 relative">
      <div className="absolute inset-0 grain" />

      {/* Page header — editorial style */}
      <div className="mb-8 lg:mb-10 relative">
        <p className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.2em] mb-2">Katalog</p>
        <h1 className="font-display text-display-sm md:text-display-md text-ink tracking-tight">
          Katalog Produk
        </h1>
        <p className="text-sm text-surface-400 mt-2 font-mono">
          {products.length} produk tersedia {query && `untuk "${query}"`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 lg:gap-8 relative">
        {/* SIDEBAR */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Search */}
          <form className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari produk..."
              className="input pl-10 pr-10"
            />
            {query && (
              <Link
                href="/produk"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </Link>
            )}
          </form>

          {/* Categories */}
          <div className="card p-3">
            <div className="flex items-center gap-2 px-2 mb-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-surface-400" />
              <h3 className="font-mono text-[10px] text-surface-400 uppercase tracking-[0.15em] font-semibold">Kategori</h3>
            </div>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/produk"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !categoryId
                      ? "bg-brand-50 text-brand-700"
                      : "text-surface-500 hover:bg-surface-50"
                  }`}
                >
                  Semua Kategori
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/produk?category=${c.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      categoryId === c.id
                        ? "bg-brand-50 text-brand-700"
                        : "text-surface-500 hover:bg-surface-50"
                    }`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* PRODUCT GRID */}
        <div>
          {products.length === 0 ? (
            <div className="card p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 grain" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-100 rounded-2xl mb-4">
                  <Search className="h-8 w-8 text-surface-300" />
                </div>
                <p className="text-surface-500 font-medium mb-1">
                  {query
                    ? `Tidak ada produk untuk "${query}"`
                    : "Belum ada produk di kategori ini."}
                </p>
                {query && (
                  <Link href="/produk" className="text-sm text-brand-600 hover:text-brand-700 font-semibold">
                    Lihat semua produk
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
