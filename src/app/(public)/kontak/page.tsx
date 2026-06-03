import { MapPin, Phone, Mail, Clock, Globe, ExternalLink } from "lucide-react";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const s = await getSettings();
  return { title: `Kontak — ${s["store.name"]}` };
}

export default async function KontakPage() {
  const s = await getSettings();

  const items = [
    s["store.address"] && { icon: MapPin, label: "Alamat", value: s["store.address"] },
    s["store.phone"] && { icon: Phone, label: "Telepon", value: s["store.phone"], href: `tel:${s["store.phone"]}` },
    s["store.email"] && { icon: Mail, label: "Email", value: s["store.email"], href: `mailto:${s["store.email"]}` },
    s["store.website"] && { icon: Globe, label: "Website", value: s["store.website"], href: s["store.website"] },
    { icon: Clock, label: "Jam Buka", value: "Senin - Sabtu: 08.00 - 20.00 WIB" },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; href?: string }>;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative">
      <div className="absolute inset-0 grain" />

      {/* Header — editorial style */}
      <div className="text-center mb-12 lg:mb-14 relative">
        <p className="text-[10px] font-mono text-brand-600 uppercase tracking-[0.2em] mb-3">Kontak</p>
        <h1 className="font-display text-display-sm md:text-display-md text-ink tracking-tight mb-4">
          Hubungi Kami
        </h1>
        <div className="line-accent mx-auto mb-5" />
        <p className="text-surface-500 max-w-md mx-auto leading-relaxed">
          Kami siap melayani Anda. Silakan hubungi {s["store.name"]} melalui informasi di bawah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
        {items.map((item, i) => {
          const Wrapper = item.href ? "a" : "div";
          const wrapperProps = item.href
            ? { href: item.href, target: item.href.startsWith("http") ? "_blank" : undefined, rel: item.href.startsWith("http") ? "noopener noreferrer" : undefined }
            : {};
          return (
            <Wrapper
              key={i}
              {...wrapperProps}
              className="card p-5 flex items-start gap-4 group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="bg-ink text-white p-3 rounded-xl flex-shrink-0 group-hover:bg-brand-600 transition-colors duration-300">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-mono text-surface-400 uppercase tracking-[0.15em] mb-1">{item.label}</p>
                <p className="font-semibold text-ink break-words">{item.value}</p>
              </div>
              {item.href && (
                <ExternalLink className="h-4 w-4 text-surface-300 flex-shrink-0 mt-1 group-hover:text-brand-500 transition-colors" />
              )}
            </Wrapper>
          );
        })}
      </div>
    </div>
  );
}
