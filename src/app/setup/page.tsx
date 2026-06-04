import { redirect } from "next/navigation";
import { checkNeedsSetup } from "@/lib/setup";

export default async function SetupPage() {
  const needsSetup = await checkNeedsSetup();

  if (!needsSetup) {
    redirect("/login");
  }

  // Layout sudah render SetupWizard, halaman ini tidak akan tampil
  return null;
}
