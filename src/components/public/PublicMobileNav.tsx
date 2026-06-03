"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Info, Phone, LayoutDashboard } from "lucide-react";

interface Props {
  user: { role: string } | null;
}

const navItems = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/produk", label: "Produk", icon: Package },
  { href: "/tentang", label: "Tentang", icon: Info },
  { href: "/kontak", label: "Kontak", icon: Phone },
];

export function PublicMobileNav({ user }: Props) {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-ink/95 backdrop-blur-xl border-t border-surface-800/50 safe-area-bottom"
      aria-label="Navigasi mobile"
    >
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              {...(active ? { "aria-current": "page" } : {})}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all duration-200 min-w-[56px] min-h-[44px] justify-center ${
                active
                  ? "text-brand-400"
                  : "text-surface-500 hover:text-surface-300"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/pos"}
            aria-label="Panel Admin"
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium text-surface-500 hover:text-surface-300 transition-all duration-200 min-w-[56px] min-h-[44px] justify-center"
          >
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            <span>Panel</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
