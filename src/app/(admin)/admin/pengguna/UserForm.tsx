"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface UserFormProps {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    username: string;
    name: string;
    role: string;
    active: boolean;
  };
  isEdit?: boolean;
}

export function UserForm({ action, initial, isEdit }: UserFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      router.refresh();
    } catch (e) {
      setError((e as Error).message || "Terjadi kesalahan");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/pengguna" className="btn-ghost text-sm">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <button type="submit" disabled={pending} className="btn-primary text-sm">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEdit ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-surface-900">Informasi Pengguna</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              required
              defaultValue={initial?.username}
              pattern="[a-zA-Z0-9_]+"
              placeholder="contoh: budi_kasir"
              className="input"
            />
            <p className="text-[11px] text-surface-500 mt-1">Hanya huruf, angka, dan underscore.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="contoh: Budi Santoso"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            Password {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            name="password"
            required={!isEdit}
            minLength={6}
            placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            name="role"
            required
            defaultValue={initial?.role ?? "KASIR"}
            className="input bg-white"
          >
            <option value="KASIR">KASIR — Hanya POS</option>
            <option value="ADMIN">ADMIN — Akses penuh</option>
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            type="checkbox"
            name="active"
            id="active"
            defaultChecked={initial?.active ?? true}
            value="true"
            className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="text-sm font-medium text-surface-900">Akun aktif</span>
            <p className="text-xs text-surface-500">Bisa login ke sistem</p>
          </div>
        </label>
      </div>
    </form>
  );
}
