"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  Receipt,
  Users,
  ShoppingCart,
  Settings as SettingsIcon,
  Wrench,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tag },
  { href: "/admin/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: SettingsIcon },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] bg-ink text-surface-300 min-h-screen flex-shrink-0 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 stripe-pattern" />
      <div className="absolute inset-0 grain grain-dark" />

      {/* Logo area */}
      <div className="p-5 border-b border-surface-800/50 relative z-10">
        <Link
          href="/admin"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-ink rounded-xl px-2 py-1 -ml-2"
          aria-label="RIZKI MOTOR Admin Panel"
        >
          <div className="bg-brand-600 text-white p-2.5 rounded-xl group-hover:bg-brand-500 transition-colors shadow-brutal-sm">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-display font-800 text-white text-sm tracking-tight">RIZKI MOTOR</div>
            <div className="text-[10px] text-surface-500 font-mono uppercase tracking-[0.15em]">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 relative z-10" aria-label="Navigasi admin">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              {...(active ? { "aria-current": "page" } : {})}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-ink ${
                active
                  ? "bg-brand-600 text-white shadow-brutal-sm"
                  : "text-surface-400 hover:bg-surface-800/50 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick links */}
      <div className="p-3 border-t border-surface-800/50 space-y-0.5 relative z-10" aria-label="Aksi cepat">
        <Link
          href="/pos"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-ink"
        >
          <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
          Buka POS / Kasir
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800/50 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-ink"
        >
          <Wrench className="h-[18px] w-[18px]" aria-hidden="true" />
          Katalog Publik
        </Link>
      </div>
    </aside>
  );
}
