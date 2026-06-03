import Link from "next/link";
import { ArrowRight, Wrench, ShieldCheck, Truck, Tag, ChevronRight, Zap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/public/ProductCard";

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
      {/* ═══════════════════════════════════════════ HERO ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-ink text-white min-h-[85vh] flex items-center">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid" />
        {/* Diagonal stripes */}
        <div className="absolute inset-0 stripe-pattern" />
        {/* Grain */}
        <div className="absolute inset-0 grain grain-dark" />
        {/* Mesh gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-brand-600/5 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px]" />
        </div>

        {/* Geometric decorations */}
        <div className="absolute top-20 right-[15%] w-20 h-20 border border-white/[0.06] rotate-45 animate-float" />
        <div className="absolute bottom-32 left-[10%] w-12 h-12 border border-brand-500/20 rotate-12" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] right-[8%] w-1.5 h-16 bg-brand-500/30 rounded-full" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 w-full">
          <div className="max-w-3xl">
            <div className="tag-dark w-fit mb-6">
              <Wrench className="h-3 w-3" />
              {settings["store.tagline"]}
            </div>

            <h1 className="font-display text-display-lg md:text-[5.5rem] text-white mb-6 leading-none">
              {settings["store.name"]}
            </h1>

            <div className="line-accent mb-6" />

            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-xl leading-relaxed font-light">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
              Katalog terlengkap, harga bersaing, kualitas terjamin.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/produk"
                className="btn-primary px-8 py-4 text-base rounded-2xl group"
              >
                Jelajahi Katalog
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/kontak"
                className="btn-outline-dark px-8 py-4 text-base rounded-2xl"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>

          {/* Right side decorative numbers */}
          <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-end gap-6">
            <div className="text-right">
              <p className="text-7xl font-display font-800 text-white/[0.04] leading-none">{productCount}+</p>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Produk</p>
            </div>
            <div className="w-px h-20 bg-white/10" />
            <div className="text-right">
              <p className="text-7xl font-display font-800 text-white/[0.04] leading-none">{categoryCount}</p>
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">Kategori</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ STATS ═══════════════════════════════════════════ */}
      <section className="bg-ink border-y border-surface-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-surface-800/50">
            {[
              { value: `${productCount}+`, label: "Produk Tersedia" },
              { value: `${categoryCount}`, label: "Kategori" },
              { value: "100%", label: "Kualitas Terjamin" },
            ].map((stat, i) => (
              <div key={i} className="py-6 md:py-8 text-center group">
                <p className="text-2xl md:text-3xl font-display font-800 text-white tracking-tight group-hover:text-brand-400 transition-colors duration-300">
                  {stat.value}
                </p>
                <p className="text-[10px] md:text-xs text-surface-500 mt-1 uppercase tracking-[0.15em] font-mono">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ FEATURES ═══════════════════════════════════════════ */}
      <section className="py-16 lg:py-24 bg-surface-50 relative">
        <div className="absolute inset-0 grain" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header — editorial style */}
          <div className="flex items-start gap-6 mb-14">
            <div>
              <p className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.2em] mb-3">Kenapa Kami</p>
              <h2 className="font-display text-display-sm md:text-display-md text-ink tracking-tight">
                Dibangun untuk<br />
                <span className="text-brand-600">Mekanik Sejati</span>
              </h2>
            </div>
          </div>

          {/* Asymmetric feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Large feature */}
            <div className="card-dark p-8 md:p-10 relative overflow-hidden group row-span-2 min-h-[320px] flex flex-col justify-end">
              <div className="absolute inset-0 bg-mesh-2 opacity-50" />
              <div className="absolute inset-0 hero-grid opacity-50" />
              <div className="absolute inset-0 grain grain-dark" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6 group-hover:bg-brand-500/30 transition-colors">
                  <ShieldCheck className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-display text-2xl font-700 text-white mb-3">
                  Kualitas Terjamin
                </h3>
                <p className="text-white/50 leading-relaxed max-w-sm">
                  Semua produk dijamin asli dan berkualitas tinggi dari merek-merek terpercaya. Kami hanya menjual produk yang kami sendiri percaya.
                </p>
              </div>
            </div>

            {/* Small features */}
            <div className="card p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                  <Tag className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-700 text-ink mb-2">Harga Bersaing</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    Harga terbaik di pasaran tanpa mengorbankan kualitas. Cocok untuk mekanik dan bengkel.
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8 relative overflow-hidden group">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              <div className="relative z-10 flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-700 text-ink mb-2">Stok Lengkap</h3>
                  <p className="text-sm text-surface-500 leading-relaxed">
                    Ribuan sparepart tersedia dan siap dikirim kapan saja. Tidak perlu menunggu lama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ PRODUCTS ═══════════════════════════════════════════ */}
      {latestProducts.length > 0 && (
        <section className="py-16 lg:py-24 relative">
          <div className="absolute inset-0 grain" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.2em] mb-3">Katalog</p>
                <h2 className="font-display text-display-sm md:text-display-md text-ink tracking-tight">
                  Produk Terbaru
                </h2>
              </div>
              <Link
                href="/produk"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-surface-500 hover:text-brand-600 transition-colors group"
              >
                Lihat Semua
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {latestProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/produk" className="btn-secondary">
                Lihat Semua Produk
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════ CTA ═══════════════════════════════════════════ */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink text-white p-10 sm:p-14 lg:p-20">
            {/* Background layers */}
            <div className="absolute inset-0 hero-grid" />
            <div className="absolute inset-0 stripe-pattern" />
            <div className="absolute inset-0 grain grain-dark" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Geometric accent */}
            <div className="absolute top-8 right-12 w-16 h-16 border border-white/[0.06] rotate-45" />
            <div className="absolute bottom-8 left-12 w-8 h-8 bg-brand-500/20 rotate-12 rounded-lg" />

            <div className="relative z-10 text-center max-w-xl mx-auto">
              <Zap className="h-8 w-8 text-brand-400 mx-auto mb-6" />
              <h2 className="font-display text-3xl sm:text-4xl font-800 tracking-tight mb-4">
                Butuh Bantuan?
              </h2>
              <p className="text-white/40 mb-8 leading-relaxed">
                Tim kami siap membantu Anda menemukan sparepart yang tepat. Jangan ragu untuk menghubungi.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  href="/kontak"
                  className="btn-primary px-8 py-4 rounded-2xl text-base"
                >
                  Hubungi Kami
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/produk"
                  className="btn-outline-dark px-8 py-4 rounded-2xl text-base"
                >
                  Lihat Katalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
