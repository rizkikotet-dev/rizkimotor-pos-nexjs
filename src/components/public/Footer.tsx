import { Wrench, MapPin, Phone, Mail, Globe } from "lucide-react";
import { getSettings } from "@/lib/settings";

export async function PublicFooter() {
  const settings = await getSettings();
  const s = settings;

  return (
    <footer className="bg-surface-900 text-surface-400 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="bg-brand-600 text-white p-2 rounded-xl">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <div className="font-bold text-white text-lg tracking-tight">{s["store.name"]}</div>
                <div className="text-[10px] text-surface-500 uppercase tracking-widest">{s["store.tagline"]}</div>
              </div>
            </div>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
              Solusi terpercaya untuk segala kebutuhan alat-alat sepeda motor Anda.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Navigasi</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/tentang", label: "Tentang" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-white transition-colors duration-200">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              {s["store.address"] && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-surface-500" />
                  <span>{s["store.address"]}</span>
                </li>
              )}
              {s["store.phone"] && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 flex-shrink-0 text-surface-500" />
                  <span>{s["store.phone"]}</span>
                </li>
              )}
              {s["store.email"] && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 flex-shrink-0 text-surface-500" />
                  <span>{s["store.email"]}</span>
                </li>
              )}
              {s["store.website"] && (
                <li className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 flex-shrink-0 text-surface-500" />
                  <a href={s["store.website"]} target="_blank" rel="noopener" className="hover:text-white transition-colors">
                    {s["store.website"]}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-surface-500">
          <p>&copy; {new Date().getFullYear()} {s["store.name"]}. All rights reserved.</p>
          <p className="text-xs">Sparepart Motor Terpercaya</p>
        </div>
      </div>
    </footer>
  );
}
