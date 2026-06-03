"use client";

import { Menu, User } from "lucide-react";

interface AdminHeaderProps {
  onMenuToggle: () => void;
  user?: { name?: string | null; role?: string } | null;
}

export function AdminHeader({ onMenuToggle, user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-14 bg-surface-base/80 backdrop-blur-xl border-b border-surface-outline-variant flex items-center justify-between px-4">
      <button
        onClick={onMenuToggle}
        className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40 lg:hidden min-h-[44px] min-w-[44px]"
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-1.5 border border-surface-outline-variant">
          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          </div>
          <div className="text-xs">
            <p className="font-medium text-zinc-200">{user?.name || "Admin"}</p>
            <p className="text-zinc-500 font-mono text-[10px]">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
