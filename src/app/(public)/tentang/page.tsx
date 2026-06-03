import { Wrench, Target, Eye, Heart } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings();
  return { title: `Tentang Kami — ${s["store.name"]}` };
}

export default async function TentangPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative">
      <div className="absolute inset-0 grain" />

      {/* Hero — editorial style */}
      <div className="text-center mb-14 lg:mb-18 relative">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-ink text-white rounded-2xl mb-6 shadow-brutal-sm">
          <Wrench className="h-8 w-8" />
        </div>
        <p className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.2em] mb-3">Profil</p>
        <h1 className="font-display text-display-sm md:text-display-md text-ink tracking-tight mb-4">
          Tentang {s["store.name"]}
        </h1>
        <div className="line-accent mx-auto mb-5" />
        <p className="text-surface-500 max-w-xl mx-auto leading-relaxed">
          Mitra terpercaya Anda untuk segala kebutuhan alat-alat sepeda motor.
        </p>
      </div>

      {/* About card */}
      <div className="card p-6 sm:p-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <div className="line-accent mb-4" />
          <p className="text-surface-700 leading-relaxed text-base">
            <strong className="text-ink">{s["store.name"]}</strong> adalah toko sparepart alat-alat sepeda motor
            yang berkomitmen menyediakan produk berkualitas dengan harga bersaing. Kami
            menyediakan berbagai macam komponen dan aksesoris motor dari merek-merek
            terpercaya untuk memastikan kendaraan Anda tetap dalam kondisi terbaik.
          </p>
        </div>
      </div>

      {/* Values — asymmetric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: Target,
            title: "Misi",
            desc: "Menyediakan sparepart motor asli berkualitas dengan pelayanan terbaik untuk pelanggan.",
            accent: "bg-brand-500",
          },
          {
            icon: Eye,
            title: "Visi",
            desc: "Menjadi toko sparepart motor pilihan utama di wilayah kami.",
            accent: "bg-blue-500",
          },
          {
            icon: Heart,
            title: "Komitmen",
            desc: "Kepuasan pelanggan adalah prioritas utama. Kami siap melayani dengan ramah dan profesional.",
            accent: "bg-emerald-500",
          },
        ].map((item, i) => (
          <div key={i} className="card p-6 group hover:shadow-lifted hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
            <div className={`w-full h-1 ${item.accent} rounded-full mb-5 group-hover:h-1.5 transition-all`} />
            <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-4 group-hover:bg-surface-200 transition-colors">
              <item.icon className="h-5 w-5 text-surface-600" />
            </div>
            <h3 className="font-display font-700 text-ink mb-2">{item.title}</h3>
            <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
