import { getSettings } from "@/lib/settings";
import { MapPin, Phone, Clock, Wrench } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

export default async function KontakPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
      <FadeIn>
        <div className="max-w-2xl mx-auto text-center mb-12">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-4 border border-primary/20">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight mb-3">
          Hubungi Kami
        </h1>
        <div className="line-accent mb-4" />
        <p className="text-zinc-400 leading-relaxed">
          Ada pertanyaan tentang produk atau pesanan? Jangan ragu untuk menghubungi kami.
        </p>
      </div>
      </FadeIn>

      <FadeIn delay={100}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {[
          {
            icon: MapPin,
            title: "Alamat",
            lines: [settings["store.address"]],
            color: "bg-primary/10 text-primary",
          },
          {
            icon: Phone,
            title: "Telepon",
            lines: [settings["store.phone"]],
            href: `tel:${settings["store.phone"]?.replace(/[^0-9+]/g, "")}`,
            color: "bg-emerald-500/10 text-emerald-400",
          },
          {
            icon: Clock,
            title: "Jam Operasional",
            lines: [
              settings["store.openDays"],
              `${settings["store.openStart"]} — ${settings["store.openEnd"]} WIB`,
            ],
            color: "bg-zinc-500/10 text-zinc-400",
          },
        ].map((item) => (
          <div key={item.title} className="card p-6 text-center hover:bg-surface-container-high transition-colors">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-100 mb-1">{item.title}</h3>
            {item.href ? (
              <a href={item.href} className="text-sm text-primary hover:text-primary-400 font-medium">
                {item.lines[0]}
              </a>
            ) : (
              item.lines.map((line, i) => (
                <p key={i} className="text-sm text-zinc-400">
                  {line}
                </p>
              ))
            )}
          </div>
        ))}
      </div>
      </FadeIn>

      <FadeIn delay={200}>
      {settings["store.mapsEmbedUrl"] && (
        <div className="mt-10 max-w-3xl mx-auto">
          <div className="card overflow-hidden border-surface-outline-variant">
            <div className="aspect-video bg-surface-container-high relative">
              <iframe
                src={settings["store.mapsEmbedUrl"]}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi RIZKI MOTOR di Google Maps"
              />
            </div>
          </div>
        </div>
      )}
      </FadeIn>
    </div>
  );
}
