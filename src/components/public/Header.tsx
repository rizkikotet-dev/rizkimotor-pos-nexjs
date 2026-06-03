import Link from "next/link";
import { Wrench, LayoutDashboard } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { PublicMobileNav } from "./PublicMobileNav";

export async function PublicHeader() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const s = settings;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-surface-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-xl px-2 py-1 -ml-2"
              aria-label={`${s["store.name"]} - Beranda`}
            >
              <div className="bg-ink text-white p-2 rounded-xl group-hover:bg-brand-600 transition-all duration-300 shadow-brutal-sm">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="font-display font-800 text-base leading-none text-ink tracking-tight">
                  {s["store.name"]}
                </div>
                <div className="text-[10px] text-surface-400 leading-tight mt-0.5 font-mono uppercase tracking-[0.15em]">
                  {s["store.tagline"]}
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium" aria-label="Navigasi utama">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/tentang", label: "Tentang" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3.5 py-2 rounded-lg text-surface-500 hover:text-ink hover:bg-surface-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right action */}
            <div className="flex items-center gap-2">
              {user ? (
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/pos"}
                  className="btn-primary text-sm px-4 py-2"
                  aria-label={`${user.role === "ADMIN" ? "Admin" : "POS"} Panel`}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Panel</span>
                </Link>
              ) : (
                <Link href="/login" className="btn-secondary text-sm px-4 py-2">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <PublicMobileNav user={user} />
    </>
  );
}
