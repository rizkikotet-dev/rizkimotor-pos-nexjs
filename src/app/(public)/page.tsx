import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Tag, ChevronRight, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/public/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();
  const [latestProducts, categoryCount, productCount] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.count(),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div>
      <FadeIn direction="none">
      <section className="relative bg-surface-base border-b border-surface-outline-variant overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 dark-grid opacity-50" aria-hidden="true" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="tag-brand w-fit mb-5">
              {settings["store.tagline"]}
            </div>

            <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-100 mb-4 leading-[1.1] tracking-tight">
              {settings["store.name"]}
            </h1>

            <div className="line-accent mb-5" aria-hidden="true" />

            <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
              Katalog terlengkap, harga bersaing, kualitas terjamin.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/produk"
                className="btn-primary group"
              >
                Jelajahi Katalog
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="/kontak"
                className="btn-secondary"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-end gap-4" aria-hidden="true">
            <div className="text-right">
              <p className="text-6xl font-bold text-zinc-300 leading-none">{productCount}+</p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Produk</p>
            </div>
            <div className="w-px h-16 bg-surface-outline-variant" aria-hidden="true" />
            <div className="text-right">
              <p className="text-6xl font-bold text-zinc-300 leading-none">{categoryCount}</p>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">Kategori</p>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn delay={100}>
      <section className="bg-surface-container-low border-b border-surface-outline-variant" aria-label="Statistik toko">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-surface-outline-variant">
            {[
              { value: `${productCount}+`, label: "Produk" },
              { value: `${categoryCount}`, label: "Kategori" },
              { value: "100%", label: "Kualitas" },
            ].map((stat, i) => (
              <div key={i} className="py-5 text-center">
                <p className="text-xl sm:text-2xl font-bold text-zinc-100">{stat.value}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn delay={200}>
      <section className="py-14 lg:py-20" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">Kenapa Kami</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              Dibangun untuk Mekanik Sejati
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-dark p-8 relative overflow-hidden group row-span-2 min-h-[280px] flex flex-col justify-end">
              <div className="absolute inset-0 dark-grid opacity-30" aria-hidden="true" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" aria-hidden="true" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 mb-2">
                  Kualitas Terjamin
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                  Semua produk dijamin asli dan berkualitas tinggi dari merek-merek terpercaya.
                </p>
              </div>
            </div>

            <div className="card p-6 group hover:bg-surface-container-high transition-colors duration-150">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1.5">Harga Bersaing</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Harga terbaik di pasaran tanpa mengorbankan kualitas.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6 group hover:bg-surface-container-high transition-colors duration-150">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 mb-1.5">Stok Lengkap</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Ribuan sparepart tersedia dan siap dikirim kapan saja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn delay={300}>
      {latestProducts.length > 0 && (
        <section className="py-14 lg:py-20 border-t border-surface-outline-variant" aria-labelledby="products-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">Katalog</p>
                <h2 id="products-heading" className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
                  Produk Terbaru
                </h2>
              </div>
              <Link
                href="/produk"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-primary transition-colors group"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {latestProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link href="/produk" className="btn-secondary">
                Lihat Semua Produk
              </Link>
            </div>
          </div>
        </section>
      )}
      </FadeIn>

      <FadeIn delay={400}>
      <section className="py-14 lg:py-20 border-t border-surface-outline-variant" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="card-dark p-10 sm:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 dark-grid opacity-30" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" aria-hidden="true" />

            <div className="relative z-10 max-w-md mx-auto">
              <Zap className="h-6 w-6 text-primary mx-auto mb-4" aria-hidden="true" />
              <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-3">
                Butuh Bantuan?
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                Tim kami siap membantu Anda menemukan sparepart yang tepat.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/kontak" className="btn-primary">
                  Hubungi Kami
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/produk" className="btn-secondary">
                  Lihat Katalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>
    </div>
  );
}
