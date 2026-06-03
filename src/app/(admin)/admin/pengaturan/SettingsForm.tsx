"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
  categories: { id: number; name: string }[];
}

export function SettingsForm({ initialSettings, categories }: SettingsFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const settings: Record<string, string> = {};

      for (const [key, value] of form.entries()) {
        settings[key] = value as string;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      toast.success("Pengaturan berhasil disimpan!");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "input";
  const labelClass = "block text-xs font-medium text-zinc-400 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      {/* Store info */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Informasi Toko</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nama Toko</label>
            <input name="store.name" defaultValue={initialSettings["store.name"]} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Tagline</label>
            <input name="store.tagline" defaultValue={initialSettings["store.tagline"]} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Deskripsi</label>
            <textarea name="store.description" rows={3} defaultValue={initialSettings["store.description"]} className={`${inputClass} resize-y`} />
          </div>
          <div>
            <label className={labelClass}>Telepon</label>
            <input name="store.phone" defaultValue={initialSettings["store.phone"]} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input name="store.whatsapp" defaultValue={initialSettings["store.whatsapp"]} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Alamat</label>
            <textarea name="store.address" rows={2} defaultValue={initialSettings["store.address"]} className={`${inputClass} resize-y`} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Maps Embed URL</label>
            <input name="store.mapsEmbedUrl" defaultValue={initialSettings["store.mapsEmbedUrl"]} className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
          </div>
        </div>
      </div>

      {/* Operating hours */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Jam Operasional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Hari</label>
            <input name="store.openDays" defaultValue={initialSettings["store.openDays"]} className={inputClass} placeholder="Senin - Sabtu" />
          </div>
          <div>
            <label className={labelClass}>Jam Buka</label>
            <input name="store.openStart" type="time" defaultValue={initialSettings["store.openStart"]} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jam Tutup</label>
            <input name="store.openEnd" type="time" defaultValue={initialSettings["store.openEnd"]} className={inputClass} />
          </div>
        </div>
      </div>

      {/* Reseller category */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Harga Reseller</h3>
        <div>
          <label className={labelClass}>Kategori Reseller</label>
          <select name="store.resellerCategoryId" defaultValue={initialSettings["store.resellerCategoryId"]} className={inputClass}>
            <option value="">Tidak ada</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
            Harga reseller hanya berlaku untuk produk di kategori ini.
          </p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-zinc-200 mb-4">Metode Pembayaran</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>CASH</label>
            <input name="payment.CASH" defaultValue={initialSettings["payment.CASH"]} className={inputClass} placeholder="Tunai" />
          </div>
          <div>
            <label className={labelClass}>QRIS</label>
            <input name="payment.QRIS" defaultValue={initialSettings["payment.QRIS"]} className={inputClass} placeholder="QRIS Scan" />
          </div>
          <div>
            <label className={labelClass}>Transfer BCA</label>
            <input name="payment.TRANSFER_BCA" defaultValue={initialSettings["payment.TRANSFER_BCA"]} className={inputClass} placeholder="1234567890 a.n. ..." />
          </div>
          <div>
            <label className={labelClass}>Transfer Mandiri</label>
            <input name="payment.TRANSFER_MANDIRI" defaultValue={initialSettings["payment.TRANSFER_MANDIRI"]} className={inputClass} placeholder="1234567890 a.n. ..." />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 text-sm">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Simpan Pengaturan
          </>
        )}
      </button>
    </form>
  );
}
