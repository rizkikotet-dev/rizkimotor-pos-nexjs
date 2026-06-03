import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../../ProductForm";
import { updateProduct } from "../../actions";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProdukPage({ params }: PageProps) {
  await getCurrentUser();
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id)) notFound();

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <div className="page-container max-w-4xl pb-24 lg:pb-8">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Edit Produk</h1>
      <p className="text-sm text-surface-500 mb-6">{product.name}</p>

      <ProductForm
        categories={categories}
        action={updateProduct.bind(null, id)}
        submitLabel="Simpan Perubahan"
        initial={{
          sku: product.sku,
          name: product.name,
          description: product.description,
          categoryId: product.categoryId,
          price: product.price,
          priceReseller: product.priceReseller,
          cost: product.cost,
          stock: product.stock,
          minStock: product.minStock,
          image: product.image,
          active: product.active,
        }}
      />
    </div>
  );
}
