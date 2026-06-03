"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ShieldCheck } from "lucide-react";

export function CategoryDeleteButton({ id, name, isDefault }: { id: number; name: string; isDefault: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isDefault) {
    return (
      <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 italic font-medium" title="Kategori default dilindungi">
        <ShieldCheck className="h-3 w-3" />
        default
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm(`Hapus kategori "${name}"?\n\nProduk yang ada di kategori ini akan dialihkan otomatis ke kategori default.`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghapus");
      }
      if (data.reassigned > 0) {
        alert(
          `${data.message}\n\n${data.reassigned} produk telah dialihkan ke "${data.defaultCategory}".`
        );
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="btn-ghost p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
        title="Hapus"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
      {error && <p className="text-[10px] text-red-600 mt-1 max-w-[200px] text-right">{error}</p>}
    </div>
  );
}
