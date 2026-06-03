"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function UserDeleteButton({ id, name, isSelf }: { id: number; name: string; isSelf: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isSelf) {
    return (
      <span className="text-[10px] text-surface-400 italic" title="Tidak dapat menghapus akun sendiri">
        akun sendiri
      </span>
    );
  }

  async function handleDelete() {
    if (!confirm(`Hapus pengguna "${name}"?\n\nPengguna yang punya riwayat transaksi akan dinonaktifkan.`)) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="btn-ghost p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
        title="Hapus"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
