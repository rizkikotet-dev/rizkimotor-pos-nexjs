import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryEditForm } from "./CategoryEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CategoryEditPage({ params }: PageProps) {
  const { id } = await params;
  const categoryId = parseInt(id);
  if (isNaN(categoryId)) notFound();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
          Edit Kategori
        </h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Ubah nama kategori &quot;{category.name}&quot;
        </p>
      </div>

      <div className="card p-6 max-w-2xl">
        <CategoryEditForm category={category} />
      </div>
    </div>
  );
}
