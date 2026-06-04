import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/constants";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Jika sudah login, redirect otomatis ke panel sesuai role
  const user = await getCurrentUser();
  if (user) {
    if (user.role === UserRole.ADMIN) redirect("/admin");
    else redirect("/pos");
  }

  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
