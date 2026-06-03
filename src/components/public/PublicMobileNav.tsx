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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-surface-200/80 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all min-w-[52px] ${
                active
                  ? "text-brand-600"
                  : "text-surface-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href={user.role === "ADMIN" ? "/admin" : "/pos"}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium text-surface-400 min-w-[52px]"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Panel</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
