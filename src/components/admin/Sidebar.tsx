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
    <aside className="hidden lg:flex lg:flex-col w-[260px] bg-surface-900 text-surface-300 min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-surface-800">
        <Link
          href="/admin"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-900 rounded-xl px-2 py-1 -ml-2"
          aria-label="RIZKI MOTOR Admin Panel"
        >
          <div className="bg-brand-600 text-white p-2.5 rounded-xl group-hover:bg-brand-500 transition-colors">
            <Wrench className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-tight">RIZKI MOTOR</div>
            <div className="text-[10px] text-surface-500 uppercase tracking-widest">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Navigasi admin">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-900 ${
                active
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                  : "text-surface-400 hover:bg-surface-800 hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Quick links */}
      <div className="p-3 border-t border-surface-800 space-y-1" aria-label="Aksi cepat">
        <Link
          href="/pos"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-900"
        >
          <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
          Buka POS / Kasir
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface-900"
        >
          <Wrench className="h-[18px] w-[18px]" aria-hidden="true" />
          Katalog Publik
        </Link>
      </div>
    </aside>
  );
}
