import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Tag, Zap } from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/public/ProductCard";
import { FadeIn } from "@/components/ui/FadeIn";
import { JsonLd, buildLocalBusiness, buildBreadcrumb } from "@/components/StructuredData";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Beranda",
  description:
    "Rizki Motor — toko sparepart alat-alat sepeda motor terlengkap. Katalog produk, harga bersaing, dan ketersediaan stok terkini. Belanja mudah, bayar cepat, struk digital.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, latestProducts, categoryCount, productCount] = await Promise.all([
    getSettings(),
    prisma.product.findMany({
      where: { active: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }).catch(() => []),
    prisma.category.count().catch(() => 0),
    prisma.product.count({ where: { active: true } }).catch(() => 0),
  ]);

  // Structured data: store info + breadcrumb. Google rich results
  // dapat menampilkan jam buka, telepon, dan harga di SERP.
  const ld = [
    buildLocalBusiness(settings, SITE_URL),
    buildBreadcrumb(SITE_URL, [{ name: "Beranda", url: "/" }]),
  ];

  return (
    <div>
      <JsonLd data={ld} />
      <FadeIn direction="none">
      <section className="relative bg-surface-base border-b border-surface-outline-variant overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0 surface-grid opacity-40 dark:opacity-50" aria-hidden="true" />
        <div className="absolute -top-32 -right-32 w-[36rem] h-[36rem] bg-primary/10 dark:bg-primary/8 rounded-full blur-[160px]" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-[36rem] h-[36rem] bg-accent/8 dark:bg-accent/6 rounded-full blur-[160px]" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="max-w-xl">
              <div className="tag-brand w-fit mb-6">
                {settings["store.tagline"]}
              </div>

              <h1 id="hero-heading" className="heading-xl text-4xl sm:text-5xl md:text-7xl text-zinc-100 mb-5">
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  {settings["store.name"]}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 mb-8 leading-relaxed">
                Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
                Katalog terlengkap, harga bersaing, kualitas terjamin.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/produk"
                  className="btn-primary group"
                >
                  Jelajahi Katalog
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href="/kontak"
                  className="btn-secondary"
                >
                  Hubungi Kami
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-surface-outline-variant">
                <div className="flex -space-x-2" aria-hidden="true">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container flex items-center justify-center text-[10px] font-semibold text-zinc-400">
                      {["A","B","C"][i-1]}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-zinc-500">
                  Dipercaya <span className="font-semibold text-zinc-300">{productCount}+ pelanggan</span>
                </p>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-5" aria-hidden="true">
              <div className="card-md p-6 ml-auto w-56">
                <p className="text-4xl font-bold text-zinc-100 heading-md">{productCount}+</p>
                <p className="label-uppercase mt-1">Produk Tersedia</p>
              </div>
              <div className="card-md p-6 w-48">
                <p className="text-4xl font-bold text-zinc-100 heading-md">{categoryCount}</p>
                <p className="label-uppercase mt-1">Kategori</p>
              </div>
              <div className="card-md p-6 ml-16 w-52">
                <p className="text-4xl font-bold text-primary heading-md">100%</p>
                <p className="label-uppercase mt-1">Kualitas Terjamin</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      </FadeIn>

      <FadeIn delay={100}>
      <section className="bg-surface-container-low border-b border-surface-outline-variant py-6" aria-label="Statistik toko">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-20">
            {[
              { value: `${productCount}+`, label: "Produk Tersedia" },
              { value: `${categoryCount}`, label: "Kategori" },
              { value: "100%", label: "Kualitas Terjamin" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold heading-sm text-zinc-100">{stat.value}</p>
                <p className="label-uppercase mt-0.5">{stat.label}</p>
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
              <div className="absolute inset-0 surface-grid opacity-25" aria-hidden="true" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 dark:bg-primary/10 rounded-full blur-[80px]" aria-hidden="true" />
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
                className="btn-soft-primary text-sm"
              >
                Lihat Semua
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {latestProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/produk" className="btn-primary">
                Lihat Semua Produk
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
            <div className="absolute inset-0 surface-grid opacity-25" aria-hidden="true" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/15 dark:bg-primary/10 rounded-full blur-[80px]" aria-hidden="true" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 dark:bg-emerald-500/10 rounded-full blur-[80px]" aria-hidden="true" />

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
