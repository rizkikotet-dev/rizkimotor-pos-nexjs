import { prisma } from "@/lib/prisma";
import { BarcodePageClient } from "./BarcodePageClient";
import { Barcode } from "lucide-react";
import { FadeIn } from "@/components/ui/FadeIn";

export const dynamic = "force-dynamic";

export default async function BarcodePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      priceReseller: true,
      cost: true,
      stock: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <FadeIn>
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Barcode className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Cetak Barcode</h1>
          </div>
          <p className="text-sm text-zinc-500 mt-0.5">Pilih produk dan cetak barcode untuk label harga.</p>
        </div>
      </FadeIn>

      <FadeIn delay={100}>
        <BarcodePageClient products={products} />
      </FadeIn>
    </div>
  );
}
