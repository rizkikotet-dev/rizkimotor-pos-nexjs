"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Receipt,
  ShoppingCart,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tag },
  { href: "/admin/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/pos", label: "Kasir", icon: ShoppingCart },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200 safe-area-bottom"
      aria-label="Navigasi admin mobile"
    >
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              {...(active ? { "aria-current": "page" } : {})}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all duration-200 min-w-[56px] min-h-[44px] justify-center ${
                active
                  ? "text-brand-600"
                  : "text-surface-400 hover:text-surface-600"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
