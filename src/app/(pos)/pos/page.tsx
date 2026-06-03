import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { POSClient } from "./POSClient";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const user = await getCurrentUser();
  const settings = await getSettings();
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  return (
    <POSClient
      products={products}
      settings={settings}
      userRole={user?.role}
    />
  );
}
