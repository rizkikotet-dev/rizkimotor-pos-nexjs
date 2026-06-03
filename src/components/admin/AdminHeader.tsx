"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, User as UserIcon, ChevronDown, Menu } from "lucide-react";

interface AdminHeaderProps {
  user: { name?: string | null; username: string; role: string };
  title: string;
  subtitle?: string;
}

export function AdminHeader({ user, title, subtitle }: AdminHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-surface-200/80 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-surface-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-surface-100 text-sm transition-colors"
        >
          <div className="bg-brand-100 text-brand-700 rounded-full h-8 w-8 flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="font-medium text-surface-900 text-sm">{user.name || user.username}</div>
            <div className="text-[10px] text-surface-500 uppercase tracking-wider font-semibold">{user.role}</div>
          </div>
          <ChevronDown className="h-4 w-4 text-surface-400 hidden sm:block" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 bg-white border border-surface-200 rounded-2xl shadow-lifted z-20 animate-scale-in overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-100 bg-surface-50">
                <div className="text-sm font-semibold text-surface-900">{user.name || user.username}</div>
                <div className="text-xs text-surface-500">@{user.username}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
