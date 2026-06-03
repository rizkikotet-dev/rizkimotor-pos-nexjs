"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { updateCategory } from "../../actions";
import { useToast } from "@/components/ui/Toast";

interface CategoryEditFormProps {
  category: {
    id: number;
    name: string;
    isDefault: boolean;
  };
}

export function CategoryEditForm({ category }: CategoryEditFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(category.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      await updateCategory(category.id, formData);
      toast.success("Kategori berhasil diperbarui");
      router.push("/admin/kategori");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memperbarui kategori";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      {category.isDefault && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400">
          <p className="font-semibold mb-1">Kategori Default</p>
          <p className="text-xs text-zinc-400">
            Kategori ini ditandai sebagai default. Anda hanya bisa mengubah namanya, tidak bisa menghapusnya.
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-xs font-medium text-zinc-400 mb-1.5">
          Nama Kategori
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          placeholder="Contoh: Oli, Ban, Kampas Rem..."
          className="input"
          aria-label="Nama kategori"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/admin/kategori"
          className="btn-secondary px-4 py-2 text-sm min-h-[44px]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Batal
        </Link>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="btn-primary px-4 py-2 text-sm min-h-[44px]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan
            </>
          )}
        </button>
      </div>
    </form>
  );
}
