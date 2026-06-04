import Link from "next/link";
import { Wrench, LayoutDashboard } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { PublicMobileNav } from "./PublicMobileNav";
import { ThemeToggle } from "@/components/ThemeToggle";

export async function PublicHeader() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);
  const s = settings;

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-xl border-b border-surface-outline-variant">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-2 py-1 -ml-2"
              aria-label={`${s["store.name"]} - Beranda`}
            >
              <div className="bg-primary text-surface-base p-1.5 rounded-lg">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <div className="font-bold text-sm leading-none text-zinc-100 tracking-tight">
                  {s["store.name"]}
                </div>
                <div className="text-[10px] text-zinc-100/70 leading-tight mt-0.5 font-mono uppercase tracking-widest">
                  {s["store.tagline"]}
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5 text-sm" aria-label="Navigasi utama">
              {[
                { href: "/", label: "Beranda" },
                { href: "/produk", label: "Produk" },
                { href: "/tentang", label: "Tentang" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-item-hover px-3 py-1.5 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <ThemeToggle />
              {user ? (
                <Link
                  href={user.role === UserRole.ADMIN ? "/admin" : "/pos"}
                  className="btn-primary btn-md"
                  aria-label={`${user.role === UserRole.ADMIN ? "Admin" : "POS"} Panel`}
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Panel</span>
                </Link>
              ) : (
                <Link href="/login" className="btn-secondary btn-md">
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
