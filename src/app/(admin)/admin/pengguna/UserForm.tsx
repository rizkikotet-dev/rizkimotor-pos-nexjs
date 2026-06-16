"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/constants";

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
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      await action(formData);
      router.refresh();
    } catch (e) {
      if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) {
        throw e;
      }
      setError((e as Error).message || "Terjadi kesalahan");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="flex items-center justify-between">
        <Link href="/admin/pengguna" className="btn-ghost" aria-label="Kembali ke daftar pengguna">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </Link>
        <button type="submit" disabled={pending} className="btn-primary" aria-label={pending ? "Menyimpan pengguna" : isEdit ? "Simpan perubahan pengguna" : "Buat pengguna baru"}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {isEdit ? "Simpan Perubahan" : "Buat Pengguna"}
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-surface-900">Informasi Pengguna</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user-username" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Username <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="user-username"
              type="text"
              name="username"
              required
              defaultValue={initial?.username}
              pattern="[a-zA-Z0-9_]+"
              placeholder="contoh: budi_kasir"
              className="input min-h-[44px]"
              aria-required="true"
            />
            <p className="text-[11px] text-surface-500 mt-1">Hanya huruf, angka, dan underscore.</p>
          </div>

          <div>
            <label htmlFor="user-name" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Nama Lengkap <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              name="name"
              required
              defaultValue={initial?.name}
              placeholder="contoh: Budi Santoso"
              className="input min-h-[44px]"
              aria-required="true"
            />
          </div>
        </div>

        <div>
          <label htmlFor="user-password" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            Password {!isEdit && <span className="text-red-500" aria-hidden="true">*</span>}
          </label>
          <div className="relative">
            <input
              id="user-password"
              type={showPassword ? "text" : "password"}
              name="password"
              required={!isEdit}
              minLength={6}
              placeholder={isEdit ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
              className="input min-h-[44px] pr-10"
              aria-required={!isEdit}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-surface-400 hover:text-surface-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="user-role" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
            Role <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <select
            id="user-role"
            name="role"
            required
            defaultValue={initial?.role ?? UserRole.KASIR}
            className="select min-h-[44px]"
            aria-required="true"
          >
            <option value={UserRole.KASIR}>KASIR — Hanya POS</option>
            <option value={UserRole.ADMIN}>ADMIN — Akses penuh</option>
          </select>
        </div>

        <label htmlFor="user-active" className="flex items-center gap-3 cursor-pointer pt-2">
          <input
            id="user-active"
            type="checkbox"
            name="active"
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
