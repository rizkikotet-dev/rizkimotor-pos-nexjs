import { Wrench, MapPin, Phone, Mail, Globe } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function PublicFooter() {
  const settings = await getSettings();
  const s = settings;

  return (
    <footer className="bg-ink text-surface-400 mt-16 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 hero-grid opacity-50" />
      <div className="absolute inset-0 stripe-pattern" />
      <div className="absolute inset-0 grain grain-dark" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-brand-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand — takes more space */}
          <div className="sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-brutal-sm">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-800 text-white text-lg tracking-tight">{s["store.name"]}</div>
                <div className="text-[10px] text-surface-500 font-mono uppercase tracking-[0.15em]">{s["store.tagline"]}</div>
              </div>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed max-w-xs">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-display font-700 text-sm mb-5">Navigasi</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/tentang", label: "Tentang" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="hover:text-white transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-brand-500 transition-all duration-200" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-display font-700 text-sm mb-5">Hubungi Kami</h3>
            <ul className="space-y-3.5 text-sm">
              {s["store.address"] && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-surface-600" />
                  <span>{s["store.address"]}</span>
                </li>
              )}
              {s["store.phone"] && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-surface-600" />
                  <span>{s["store.phone"]}</span>
                </li>
              )}
              {s["store.email"] && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 flex-shrink-0 text-surface-600" />
                  <span>{s["store.email"]}</span>
                </li>
              )}
              {s["store.website"] && (
                <li className="flex items-center gap-3">
                  <Globe className="h-4 w-4 flex-shrink-0 text-surface-600" />
                  <a href={s["store.website"]} target="_blank" rel="noopener" className="hover:text-white transition-colors">
                    {s["store.website"]}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-800/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-surface-600 text-xs font-mono">
            &copy; {new Date().getFullYear()} {s["store.name"]}
          </p>
          <p className="text-[10px] text-surface-700 font-mono uppercase tracking-[0.2em]">
            Sparepart Motor Terpercaya
          </p>
        </div>
      </div>
    </footer>
  );
}
