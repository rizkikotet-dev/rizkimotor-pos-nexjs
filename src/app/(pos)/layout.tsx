import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <div className="min-h-screen bg-surface-50"><main id="main-content">{children}</main></div>;
}
