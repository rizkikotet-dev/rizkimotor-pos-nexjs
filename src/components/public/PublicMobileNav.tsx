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
              className={`nav-item-hover relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium min-w-[56px] min-h-[44px] justify-center ${
                active
                  ? "nav-item-active text-zinc-100 font-semibold"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-1/3 right-1/3 h-0.5 rounded-b-full"
                  style={{ backgroundColor: "var(--nav-active-indicator)" }}
                />
              )}
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {user && (
          <Link
            href={user.role === UserRole.ADMIN ? "/admin" : "/pos"}
            aria-label="Panel Admin"
            className="nav-item-hover flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] font-medium text-zinc-500 hover:text-zinc-300 min-w-[56px] min-h-[44px] justify-center"
          >
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            <span>Panel</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
