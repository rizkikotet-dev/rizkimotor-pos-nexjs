"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  };

  return (
    <button
      onClick={handleLogout}
      className={`items-center gap-2 btn-secondary text-sm px-3 py-1.5 min-h-[36px] text-zinc-500 hover:text-red-400 hover:border-red-500/20 ${className}`}
      aria-label="Logout"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
