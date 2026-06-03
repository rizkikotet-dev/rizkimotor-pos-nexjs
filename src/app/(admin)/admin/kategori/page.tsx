import { getCurrentUser } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { prisma } from "@/lib/prisma";
import { createCategory } from "./actions";
import { CategoryDeleteButton } from "./CategoryDeleteButton";
import { formatDate } from "@/lib/format";
import { Tag, Plus, ShieldCheck, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  const user = (await getCurrentUser())!;
  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const defaultCategory = categories.find((c) => c.isDefault);

  return (
    <>
      <AdminHeader user={user} title="Kategori" subtitle="Kelola kategori produk" />

      <div className="page-container pb-24 lg:pb-8">
        {/* INFO BANNER */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-3 mb-4">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Tentang Kategori Default</p>
            <p className="text-xs mt-1 leading-relaxed">
              Satu kategori ditandai sebagai <strong>default</strong> (saat ini:{" "}
              <strong>{defaultCategory?.name ?? "—"}</strong>). Kategori ini tidak dapat
              dihapus. Jika Anda menghapus kategori lain yang memiliki produk, produk tersebut akan otomatis dialihkan ke kategori default.
            </p>
          </div>
        </div>

        {/* FORM TAMBAH */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-surface-900">Tambah Kategori</h2>
          </div>
          <form action={createCategory} className="flex gap-2 max-w-xl">
            <input
              type="text"
              name="name"
              required
              placeholder="Contoh: Oli, Ban, Kampas Rem..."
              className="input flex-1"
            />
            <button type="submit" className="btn-primary">
              Simpan
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-2">
            <Tag className="h-4 w-4 text-brand-600" />
            <h2 className="font-semibold text-surface-900">Daftar Kategori ({categories.length})</h2>
          </div>

          {categories.length === 0 ? (
            <p className="p-12 text-center text-sm text-surface-500">
              Belum ada kategori. Tambahkan kategori pertama Anda di atas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden sm:table-cell">Slug</th>
                    <th className="text-center px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Produk</th>
                    <th className="text-left px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider hidden md:table-cell">Dibuat</th>
                    <th className="text-right px-4 py-3 font-semibold text-surface-600 text-xs uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-surface-900">{c.name}</span>
                          {c.isDefault && (
                            <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                              <ShieldCheck className="h-3 w-3" />
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-surface-500 font-mono text-xs hidden sm:table-cell">{c.slug}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="badge-info">{c._count.products}</span>
                      </td>
                      <td className="px-4 py-3.5 text-surface-500 text-xs hidden md:table-cell">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <CategoryDeleteButton id={c.id} name={c.name} isDefault={c.isDefault} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
