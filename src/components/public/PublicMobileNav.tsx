"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Info, Phone, LayoutDashboard } from "lucide-react";
import { UserRole } from "@/lib/constants";

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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-base/90 backdrop-blur-xl border-t border-surface-outline-variant safe-area-bottom"
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
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors duration-150 min-w-[56px] min-h-[44px] justify-center ${
                active
                  ? "text-primary"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href={user.role === UserRole.ADMIN ? "/admin" : "/pos"}
            aria-label="Panel Admin"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors duration-150 min-w-[56px] min-h-[44px] justify-center"
          >
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            <span>Panel</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
