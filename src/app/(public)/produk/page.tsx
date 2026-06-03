import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/public/ProductCard";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <FadeIn>
        <div className="mb-6 lg:mb-8">
          <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1">Katalog</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
            Katalog Produk
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-mono">
            {products.length} produk tersedia {query && `untuk "${query}"`}
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 lg:gap-8">
        <FadeIn delay={100}>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start" aria-label="Filter produk">
          <form className="relative" role="search" aria-label="Cari produk">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Cari produk..."
              className="input pl-9 pr-9"
              aria-label="Cari produk"
            />
            {query && (
              <Link
                href="/produk"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
                aria-label="Hapus pencarian"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </form>

          <div className="card p-2">
            <div className="flex items-center gap-2 px-2 mb-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-600" aria-hidden="true" />
              <h2 className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Kategori</h2>
            </div>
            <ul className="space-y-0.5" role="list" aria-label="Daftar kategori">
              <li>
                <Link
                  href="/produk"
                  className={`block px-2.5 py-1.5 rounded-md text-sm transition-colors duration-150 min-h-[36px] ${
                    !categoryId
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-container-high"
                  }`}
                  aria-current={!categoryId ? "page" : undefined}
                >
                  Semua Kategori
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/produk?category=${c.id}`}
                    className={`block px-2.5 py-1.5 rounded-md text-sm transition-colors duration-150 min-h-[36px] ${
                      categoryId === c.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-container-high"
                    }`}
                    aria-current={categoryId === c.id ? "page" : undefined}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        </FadeIn>

        <FadeIn delay={200}>
        <div>
          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-surface-container-high rounded-lg mb-4 border border-surface-outline-variant">
                <Search className="h-6 w-6 text-zinc-600" aria-hidden="true" />
              </div>
              <p className="text-zinc-400 font-medium mb-1">
                {query
                  ? `Tidak ada produk untuk "${query}"`
                  : "Belum ada produk di kategori ini."}
              </p>
              <p className="text-xs text-zinc-500 mb-3">
                Coba gunakan kata kunci lain atau pilih kategori berbeda.
              </p>
              {query && (
                <Link href="/produk" className="btn-secondary">
                  Lihat semua produk
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
        </FadeIn>
      </div>
    </div>
  );
}
