import { Wrench, Target, Eye, Heart, Award, Users, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings();
  return { title: `Tentang Kami — ${s["store.name"]}` };
}

export default async function TentangPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      {/* Hero */}
      <div className="text-center mb-12 lg:mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 text-brand-600 rounded-2xl mb-5">
          <Wrench className="h-8 w-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 tracking-tight mb-3">
          Tentang {s["store.name"]}
        </h1>
        <p className="text-surface-500 max-w-xl mx-auto leading-relaxed">
          Mitra terpercaya Anda untuk segala kebutuhan alat-alat sepeda motor.
        </p>
      </div>

      {/* About card */}
      <div className="card p-6 sm:p-8 mb-10">
        <p className="text-surface-700 leading-relaxed text-base">
          <strong className="text-surface-900">{s["store.name"]}</strong> adalah toko sparepart alat-alat sepeda motor
          yang berkomitmen menyediakan produk berkualitas dengan harga bersaing. Kami
          menyediakan berbagai macam komponen dan aksesoris motor dari merek-merek
          terpercaya untuk memastikan kendaraan Anda tetap dalam kondisi terbaik.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          {
            icon: Target,
            title: "Misi",
            desc: "Menyediakan sparepart motor asli berkualitas dengan pelayanan terbaik untuk pelanggan.",
            color: "bg-brand-50 text-brand-600",
          },
          {
            icon: Eye,
            title: "Visi",
            desc: "Menjadi toko sparepart motor pilihan utama di wilayah kami.",
            color: "bg-blue-50 text-blue-600",
          },
          {
            icon: Heart,
            title: "Komitmen",
            desc: "Kepuasan pelanggan adalah prioritas utama. Kami siap melayani dengan ramah dan profesional.",
            color: "bg-emerald-50 text-emerald-600",
          },
        ].map((item, i) => (
          <div key={i} className="card p-6 text-center hover:shadow-lifted hover:-translate-y-1 transition-all duration-300">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-surface-900 mb-2">{item.title}</h3>
            <p className="text-sm text-surface-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
