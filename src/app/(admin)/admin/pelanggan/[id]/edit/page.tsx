"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function EditPelangganPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<{ name: string; phone: string | null; address: string | null; note: string | null } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (res.ok) setCustomer(await res.json());
        else toast.error("Pelanggan tidak ditemukan");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, toast]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get("name") as string,
      phone: form.get("phone") as string || null,
      address: form.get("address") as string || null,
      note: form.get("note") as string || null,
    };

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menyimpan");
        return;
      }

      toast.success("Pelanggan berhasil diupdate");
      router.push("/admin/pelanggan");
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-zinc-500">Pelanggan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/admin/pelanggan" className="btn-ghost mb-3">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <h1 className="text-xl font-bold text-zinc-100">Edit Pelanggan</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Nama <span className="text-red-400">*</span>
          </label>
          <input type="text" name="name" required maxLength={100} defaultValue={customer.name} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            No. Telepon
          </label>
          <input type="tel" name="phone" maxLength={20} defaultValue={customer.phone || ""} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Alamat
          </label>
          <textarea name="address" maxLength={200} rows={2} defaultValue={customer.address || ""} className="input" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Catatan
          </label>
          <input type="text" name="note" maxLength={200} defaultValue={customer.note || ""} className="input" />
        </div>
        <div className="flex gap-3 pt-2 border-t border-surface-outline-variant">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="h-4 w-4" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
