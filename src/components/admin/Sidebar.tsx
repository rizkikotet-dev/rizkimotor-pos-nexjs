"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Wrench,
  ChevronLeft,
  Barcode,
  UserCircle,
  DollarSign,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pos", label: "POS / Kasir", icon: ShoppingCart },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tag },
  { href: "/admin/barcode", label: "Cetak Barcode", icon: Barcode },
  { href: "/admin/transaksi", label: "Transaksi", icon: ShoppingCart },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: UserCircle },
  { href: "/admin/utang-piutang", label: "Utang Piutang", icon: DollarSign },
  { href: "/admin/pengguna", label: "Pengguna", icon: Users },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          bg-surface-base border-r border-surface-outline-variant
          transition-transform duration-200 ease-out
          lg:static lg:translate-x-0 lg:w-64
          ${collapsed ? "-translate-x-full" : "translate-x-0"}
        `}
        role="navigation"
        aria-label="Menu admin"
      >
        <div className="flex flex-col h-full">
          <div className="h-14 flex items-center justify-between px-4 border-b border-surface-outline-variant">
            <Link href="/admin" className="flex items-center gap-2 min-w-0 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-1" aria-label="RIZKI MOTOR - Dashboard">
              <div className="w-8 h-8 rounded-lg bg-primary text-surface-base flex items-center justify-center flex-shrink-0">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-zinc-100 truncate">RIZKI MOTOR</span>
            </Link>
            {onToggle && (
              <button
                onClick={onToggle}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden min-h-[36px] min-w-[36px]"
                aria-label="Tutup sidebar"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    nav-item-hover relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium
                    min-h-[44px] text-zinc-100
                    ${isActive ? "nav-item-active font-semibold" : ""}
                  `}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full"
                      style={{ backgroundColor: "var(--nav-active-indicator)" }}
                    />
                  )}
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-surface-outline-variant p-2 space-y-0.5 pb-20 lg:pb-2">
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <span className="text-[10px] text-zinc-100 font-mono uppercase tracking-widest font-semibold">Tampilan</span>
              <ThemeToggle />
            </div>
            <Link
              href="/"
              className="nav-item-hover flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-100 min-h-[44px]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Wrench className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Katalog Publik</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
              className="nav-item-danger flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-zinc-100 min-h-[44px] w-full text-left"
              aria-label="Logout dari akun"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
