"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function TambahPelangganPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      phone: form.get("phone") as string || null,
      address: form.get("address") as string || null,
      note: form.get("note") as string || null,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menyimpan");
        return;
      }

      toast.success("Pelanggan berhasil ditambahkan");
      router.push("/admin/pelanggan");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/admin/pelanggan" className="btn-ghost mb-3">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">Tambah Pelanggan</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Isi data pelanggan baru</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Nama <span className="text-red-400">*</span>
          </label>
          <input type="text" name="name" required maxLength={100} className="input" placeholder="Nama pelanggan" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            No. Telepon
          </label>
          <input type="tel" name="phone" maxLength={20} className="input" placeholder="08xxxxxxxxxx" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Alamat
          </label>
          <textarea name="address" maxLength={200} rows={2} className="input" placeholder="Alamat pelanggan" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Catatan
          </label>
          <input type="text" name="note" maxLength={200} className="input" placeholder="Catatan tambahan" />
        </div>
        <div className="flex gap-3 pt-2 border-t border-surface-outline-variant">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}
