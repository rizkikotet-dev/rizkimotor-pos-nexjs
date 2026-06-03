"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ShoppingCart, History, LogOut, LayoutDashboard } from "lucide-react";

interface POSMobileNavProps {
  isAdmin?: boolean;
}

const navItems = [
  { href: "/pos", label: "Kasir", icon: ShoppingCart },
  { href: "/pos/riwayat", label: "Riwayat", icon: History },
];

export function POSMobileNav({ isAdmin }: POSMobileNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-surface-base/95 backdrop-blur-xl border-t border-surface-outline-variant safe-area-bottom md:hidden"
      aria-label="Menu POS (mobile)"
    >
      <div className="grid grid-cols-4 h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors duration-150 ${
                isActive ? "text-primary" : "text-zinc-500 active:text-zinc-300"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center gap-0.5 min-h-[48px] text-zinc-500 active:text-zinc-300 transition-colors duration-150"
            aria-label="Admin"
          >
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            <span className="text-[10px] font-medium leading-tight">Admin</span>
          </Link>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login", redirect: true })}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[48px] text-zinc-500 active:text-red-400 transition-colors duration-150"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] font-medium leading-tight">Keluar</span>
        </button>
      </div>
    </nav>
  );
}
