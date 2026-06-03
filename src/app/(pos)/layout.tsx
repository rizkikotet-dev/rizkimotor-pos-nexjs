import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { POSHeader } from "@/components/pos/POSHeader";
import { POSMobileNav } from "@/components/pos/POSMobileNav";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  
  return (
    <div className="min-h-screen bg-surface-base">
      <POSHeader />
      <main id="main-content" className="pb-16 md:pb-0">{children}</main>
      <POSMobileNav isAdmin={user.role === "ADMIN"} />
    </div>
  );
}
