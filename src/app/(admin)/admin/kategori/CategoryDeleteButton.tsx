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
      <div className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium" title="Kategori default dilindungi">
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
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
        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/40 min-h-[32px] min-w-[32px]"
        aria-label={`Hapus kategori ${name}`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
      </button>
      {error && <p className="text-[10px] text-red-400 mt-1 max-w-[200px] text-right" role="alert">{error}</p>}
    </div>
  );
}
