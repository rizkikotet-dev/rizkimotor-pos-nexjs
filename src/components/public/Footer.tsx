import { Wrench, MapPin, Phone, Mail, Globe } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function PublicFooter() {
  const settings = await getSettings();
  const s = settings;

  return (
    <footer className="bg-surface-container-low border-t border-surface-outline-variant mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-primary text-surface-base p-1.5 rounded-lg">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <div className="font-bold text-zinc-100 text-sm tracking-tight">{s["store.name"]}</div>
                <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{s["store.tagline"]}</div>
              </div>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-zinc-300 font-semibold text-xs uppercase tracking-widest mb-4">Navigasi</h2>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/tentang", label: "Tentang" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-zinc-500 hover:text-zinc-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-zinc-300 font-semibold text-xs uppercase tracking-widest mb-4">Hubungi Kami</h2>
            <ul className="space-y-3 text-sm">
              {s["store.address"] && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-zinc-600" aria-hidden="true" />
                  <span className="text-zinc-500">{s["store.address"]}</span>
                </li>
              )}
              {s["store.phone"] && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-zinc-600" aria-hidden="true" />
                  <a href={`tel:${s["store.phone"]}`} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                    {s["store.phone"]}
                  </a>
                </li>
              )}
              {s["store.email"] && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-zinc-600" aria-hidden="true" />
                  <a href={`mailto:${s["store.email"]}`} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                    {s["store.email"]}
                  </a>
                </li>
              )}
              {s["store.website"] && (
                <li className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 flex-shrink-0 text-zinc-600" aria-hidden="true" />
                  <a href={s["store.website"]} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-100 transition-colors">
                    {s["store.website"]}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-outline-variant mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <p className="text-zinc-500 text-xs font-mono">
            &copy; {new Date().getFullYear()} {s["store.name"]}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
            Sparepart Motor Terpercaya
          </p>
        </div>
      </div>
    </footer>
  );
}
