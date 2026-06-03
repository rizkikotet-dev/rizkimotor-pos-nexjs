import Link from "next/link";
import { ArrowRight, Wrench, ShieldCheck, Truck, Tag } from "lucide-react";
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
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0f172a] text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 bg-brand-500/15 text-brand-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 border border-brand-500/20">
              <Wrench className="h-3 w-3" />
              {settings["store.tagline"]}
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.1]">
              {settings["store.name"]}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
              Katalog terlengkap, harga bersaing, dan kualitas terjamin.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/produk"
                className="btn-primary px-6 py-3 text-base"
              >
                Lihat Katalog
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/kontak"
                className="btn px-6 py-3 text-base bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 font-semibold"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-b border-surface-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-surface-200">
            {[
              { value: productCount, label: "Produk" },
              { value: categoryCount, label: "Kategori" },
              { value: "100%", label: "Kualitas" },
            ].map((stat, i) => (
              <div key={i} className="py-6 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-xs sm:text-sm text-surface-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mb-3">Mengapa Memilih Kami?</h2>
            <p className="text-surface-500 max-w-lg mx-auto">
              Pelayanan terbaik untuk kebutuhan sparepart motor Anda
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Kualitas Terjamin",
                desc: "Semua produk dijamin asli dan berkualitas tinggi dari merek-merek terpercaya.",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Tag,
                title: "Harga Bersaing",
                desc: "Harga terbaik di pasaran tanpa mengorbankan kualitas produk.",
                color: "bg-brand-50 text-brand-600",
              },
              {
                icon: Truck,
                title: "Stok Lengkap",
                desc: "Ribuan sparepart tersedia dan siap dikirim kapan saja Anda butuhkan.",
                color: "bg-blue-50 text-blue-600",
              },
            ].map((feature, i) => (
              <div key={i} className="card p-6 text-center hover:shadow-lifted hover:-translate-y-1 transition-all duration-300">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-surface-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-surface-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST PRODUCTS */}
      {latestProducts.length > 0 && (
        <section className="py-16 lg:py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-surface-900">Produk Terbaru</h2>
                <p className="text-surface-500 mt-1">Koleksi terbaru dari toko kami</p>
              </div>
              <Link href="/produk" className="btn-secondary text-sm hidden sm:inline-flex">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-brand-700 text-white p-8 sm:p-12 lg:p-16 text-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Butuh Bantuan?</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Tim kami siap membantu Anda menemukan sparepart yang tepat.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/kontak" className="btn bg-white text-brand-700 hover:bg-surface-50 px-6 py-3 rounded-xl font-semibold shadow-lg">
                  Hubungi Kami
                </Link>
                <Link href="/produk" className="btn bg-white/15 text-white hover:bg-white/25 border border-white/20 px-6 py-3 rounded-xl font-semibold backdrop-blur-sm">
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
