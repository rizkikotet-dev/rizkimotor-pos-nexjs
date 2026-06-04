import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { AdminLayoutClient } from "./admin/AdminLayoutClient";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== UserRole.ADMIN) redirect("/pos");

  return (
    <AdminLayoutClient user={user}>
      {children}
    </AdminLayoutClient>
  );
}
