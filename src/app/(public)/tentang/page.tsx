import type { Metadata } from "next";
import { Wrench, Shield, Clock, Award } from "lucide-react";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Kenali Rizki Motor — toko sparepart motor terpercaya sejak 2015. Komitmen kami: produk berkualitas, harga bersaing, dan stok lengkap untuk mekanik dan bengkel di seluruh Indonesia.",
  alternates: { canonical: "/tentang" },
  openGraph: {
    title: "Tentang Rizki Motor",
    description:
      "Toko sparepart motor terpercaya sejak 2015. Kualitas terjamin, harga bersaing, stok lengkap.",
    type: "website",
    url: `${SITE_URL}/tentang`,
  },
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-4 border border-primary/20">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-3">
          Tentang RIZKI MOTOR
        </h1>
        <div className="line-accent mb-4" />
        <p className="text-zinc-400 leading-relaxed">
          Kami adalah toko sparepart motor terpercaya yang melayani kebutuhan mekanik dan pemilik motor sejak 2015.
          Dengan ribuan produk berkualitas dan harga bersaing, kami berkomitmen menjadi solusi terlengkap untuk segala kebutuhan alat sepeda motor Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {[
          {
            icon: Shield,
            title: "Terpercaya",
            desc: "Lebih dari 8 tahun melayani mekanik dan bengkel di seluruh Indonesia.",
            color: "bg-primary/10 text-primary",
          },
          {
            icon: Award,
            title: "Kualitas Terjamin",
            desc: "Semua produk dijamin asli dan berkualitas dari merek terpercaya.",
            color: "bg-emerald-500/10 text-emerald-400",
          },
          {
            icon: Clock,
            title: "Stok Ready",
            desc: "Ribuan sparepart tersedia siap dikirim untuk mendukung bisnis Anda.",
            color: "bg-zinc-500/10 text-zinc-400",
          },
          {
            icon: Wrench,
            title: "Harga Bersaing",
            desc: "Harga terbaik untuk mekanik dan bengkel, termasuk harga reseller khusus.",
            color: "bg-primary/10 text-primary",
          },
        ].map((item) => (
          <div key={item.title} className="card p-5 hover:bg-surface-container-high transition-colors">
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${item.color}`}>
              <item.icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1.5">{item.title}</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
