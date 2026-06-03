"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface DeleteButtonProps {
  productId: number;
  productName: string;
}

export function DeleteButton({ productId, productName }: DeleteButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus "${productName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Produk berhasil dihapus");
        router.refresh();
      } else {
        toast.error("Gagal menghapus produk");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/40 min-h-[32px] min-w-[32px]"
      aria-label={`Hapus ${productName}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
