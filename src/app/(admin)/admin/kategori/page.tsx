import { prisma } from "@/lib/prisma";
import { createCategory } from "./actions";
import { CategoryDeleteButton } from "./CategoryDeleteButton";
import { formatDate } from "@/lib/format";
import { Tag, Plus, ShieldCheck, Info, Pencil } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CategoryPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const defaultCategory = categories.find((c) => c.isDefault);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">Kategori</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Kelola kategori produk.</p>
      </div>

      {/* Info banner */}
      <div className="card p-4 mb-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Tentang Kategori Default</p>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Satu kategori ditandai sebagai <strong className="text-zinc-200">default</strong> (saat ini:{" "}
              <strong className="text-zinc-200">{defaultCategory?.name ?? "—"}</strong>). Kategori ini tidak dapat
              dihapus. Jika Anda menghapus kategori lain yang memiliki produk, produk tersebut akan otomatis dialihkan ke kategori default.
            </p>
          </div>
        </div>
      </div>

      {/* Form tambah */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-zinc-200">Tambah Kategori</h2>
        </div>
        <form action={createCategory} className="flex gap-2 max-w-xl">
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Oli, Ban, Kampas Rem..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-4 py-2 text-sm">
            Simpan
          </button>
        </form>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-outline-variant flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-zinc-200">Daftar Kategori ({categories.length})</h2>
        </div>

        {categories.length === 0 ? (
          <p className="p-12 text-center text-sm text-zinc-500">
            Belum ada kategori. Tambahkan kategori pertama Anda di atas.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold hidden sm:table-cell">Slug</th>
                  <th className="px-4 py-3 text-center text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Produk</th>
                  <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold hidden md:table-cell">Dibuat</th>
                  <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-outline-variant">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-200">{c.name}</span>
                        {c.isDefault && (
                          <span className="tag bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            <ShieldCheck className="h-3 w-3" />
                            DEFAULT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs hidden sm:table-cell">{c.slug}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="tag-brand text-[10px]">{c._count.products}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs hidden md:table-cell">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/kategori/${c.id}/edit`}
                          className="p-1.5 text-zinc-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
                          aria-label={`Edit kategori ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <CategoryDeleteButton id={c.id} name={c.name} isDefault={c.isDefault} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
