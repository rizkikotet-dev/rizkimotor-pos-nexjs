"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, UserCircle, Settings } from "lucide-react";

// Bottom nav follows Material Design guidance: max 5 top-level destinations.
// Less-used items (Kategori, Barcode, Utang-Piutang, Pengguna) tetap
// reachable via the sidebar (drawer) yang dibuka dari header menu.
const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/transaksi", label: "Transaksi", icon: ShoppingCart },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: UserCircle },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface-base/95 backdrop-blur-xl border-t border-surface-outline-variant safe-area-bottom lg:hidden"
      aria-label="Menu admin (mobile)"
    >
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[56px] px-2 transition-colors duration-150 ${
                isActive ? "text-zinc-100" : "text-zinc-400 active:text-zinc-100"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-b-full"
                  style={{ backgroundColor: "var(--nav-active-indicator)" }}
                />
              )}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
