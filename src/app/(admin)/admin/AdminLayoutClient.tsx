"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: { name?: string | null; role?: string } | null;
}

export function AdminLayoutClient({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full bg-surface-base">
      <AdminSidebar
        collapsed={!sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} user={user} />

        <main id="main-content" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>

        <AdminMobileNav />
      </div>
    </div>
  );
}
