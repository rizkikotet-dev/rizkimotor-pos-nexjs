import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export default async function TambahProdukPage() {
  await getCurrentUser();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="page-container max-w-4xl pb-24 lg:pb-8">
      <h1 className="text-xl font-bold text-surface-900 mb-1">Tambah Produk</h1>
      <p className="text-sm text-surface-500 mb-6">Lengkapi informasi produk baru</p>

      {categories.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-2xl p-5 flex items-start gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-semibold">Belum ada kategori</p>
            <p className="text-xs mt-1">
              Silakan{" "}
              <a href="/admin/kategori" className="underline font-semibold">
                buat kategori
              </a>{" "}
              terlebih dahulu.
            </p>
          </div>
        </div>
      ) : (
        <ProductForm categories={categories} action={createProduct} submitLabel="Simpan Produk" />
      )}
    </div>
  );
}
