import Link from "next/link";
import { Wrench, ShoppingCart, History, LogOut, LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

export async function POSHeader() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 bg-surface-base/80 backdrop-blur-xl border-b border-surface-outline-variant">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/pos"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg px-2 py-1 -ml-2"
            aria-label="RIZKI MOTOR - POS"
          >
            <div className="bg-primary text-surface-base p-1.5 rounded-lg">
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <div className="font-bold text-sm leading-none text-zinc-100 tracking-tight">
                RIZKI MOTOR POS
              </div>
              <div className="text-[10px] text-zinc-500 leading-tight mt-0.5 font-mono uppercase tracking-widest">
                {user?.name}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 text-sm" aria-label="Navigasi POS">
            <Link
              href="/pos"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-surface-container-high transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px]"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              <span>Kasir</span>
            </Link>
            <Link
              href="/pos/riwayat"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-surface-container-high transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[36px]"
            >
              <History className="h-4 w-4" aria-hidden="true" />
              <span>Riwayat</span>
            </Link>
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-2 btn-secondary btn-md"
                aria-label="Admin Panel"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span className="hidden lg:inline">Admin</span>
              </Link>
            )}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 btn-secondary btn-md"
              aria-label="Katalog"
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
              <span className="hidden lg:inline">Katalog</span>
            </Link>
            <LogoutButton className="hidden sm:flex" />
          </div>
        </div>
      </div>
    </header>
  );
}
