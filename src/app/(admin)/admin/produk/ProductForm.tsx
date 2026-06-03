"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Upload, X, Package, ImageIcon } from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  action: (formData: FormData) => Promise<void>;
  initial?: {
    sku: string;
    name: string;
    description: string | null;
    categoryId: number;
    price: number;
    priceReseller: number;
    cost: number;
    stock: number;
    minStock: number;
    image: string | null;
    active: boolean;
  };
  submitLabel?: string;
}

export function ProductForm({ categories, action, initial, submitLabel = "Simpan" }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload gagal");
      const data = await res.json();
      setImageUrl(data.url);
    } catch {
      setUploadError("Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      if (imageUrl) fd.set("image", imageUrl);
      else fd.set("image", "");
      await action(fd);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Back + Save bar */}
      <div className="flex items-center justify-between">
        <Link href="/admin/produk" className="btn-ghost" aria-label="Kembali ke daftar produk">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </Link>
        <button type="submit" disabled={pending || uploading} className="btn-primary" aria-label={pending ? "Menyimpan produk" : submitLabel}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-5">
        <h2 className="font-semibold text-surface-900 mb-4">Informasi Dasar</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-sku" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
                SKU <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="product-sku"
                type="text"
                name="sku"
                required
                maxLength={50}
                defaultValue={initial?.sku}
                className="input min-h-[44px]"
                placeholder="Contoh: OLI-001"
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="product-category" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
                Kategori <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <select
                id="product-category"
                name="categoryId"
                required
                defaultValue={initial?.categoryId}
                className="select min-h-[44px]"
                aria-required="true"
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="product-name" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Nama Produk <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              name="name"
              required
              maxLength={150}
              defaultValue={initial?.name}
              className="input min-h-[44px]"
              placeholder="Nama produk"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="product-desc" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Deskripsi
            </label>
            <textarea
              id="product-desc"
              name="description"
              rows={3}
              defaultValue={initial?.description ?? ""}
              className="input resize-none min-h-[80px]"
              placeholder="Deskripsi produk (opsional)"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="card p-5">
        <h2 className="font-semibold text-surface-900 mb-4">Harga & Stok</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="product-price" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Harga Jual (Rp) <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              name="price"
              required
              min="0"
              defaultValue={initial?.price ?? 0}
              className="input min-h-[44px]"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="product-price-reseller" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Harga Reseller (Rp)
            </label>
            <input
              id="product-price-reseller"
              type="number"
              name="priceReseller"
              min="0"
              defaultValue={initial?.priceReseller ?? 0}
              className="input min-h-[44px]"
            />
            <p className="text-[11px] text-surface-500 mt-1">0 = tidak ada. Diisi = kasir pilih saat transaksi.</p>
          </div>
          <div>
            <label htmlFor="product-cost" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Harga Modal (Rp)
            </label>
            <input
              id="product-cost"
              type="number"
              name="cost"
              min="0"
              defaultValue={initial?.cost ?? 0}
              className="input min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="product-stock" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Stok
            </label>
            <input
              id="product-stock"
              type="number"
              name="stock"
              min="0"
              defaultValue={initial?.stock ?? 0}
              className="input min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="product-min-stock" className="block text-xs font-semibold text-surface-600 uppercase tracking-wider mb-1.5">
              Min. Stok
            </label>
            <input
              id="product-min-stock"
              type="number"
              name="minStock"
              min="0"
              defaultValue={initial?.minStock ?? 5}
              className="input min-h-[44px]"
            />
            <p className="text-[11px] text-surface-500 mt-1">Alert jika stok &le; nilai ini</p>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="card p-5">
        <h2 className="font-semibold text-surface-900 mb-4">Gambar Produk</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-40 h-40 bg-surface-100 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-surface-300">
            {imageUrl ? (
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Preview produk" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  aria-label="Hapus gambar"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 transition-colors min-h-[32px] min-w-[32px] focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="h-8 w-8 text-surface-300 mx-auto mb-1" aria-hidden="true" />
                <p className="text-[10px] text-surface-400">Belum ada gambar</p>
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Pilih gambar produk"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary mb-2 min-w-[56px] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              aria-label={uploading ? "Mengupload gambar" : "Pilih gambar dari komputer"}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
              {uploading ? "Uploading..." : "Pilih Gambar"}
            </button>
            <p className="text-xs text-surface-500">Format: JPG, PNG, WebP. Maks 5MB.</p>
            {uploadError && <p role="alert" className="text-xs text-red-600 mt-1">{uploadError}</p>}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="card p-5">
        <label htmlFor="product-active" className="flex items-center gap-3 cursor-pointer">
          <input
            id="product-active"
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
          />
          <div>
            <span className="text-sm font-medium text-surface-900">Produk Aktif</span>
            <p className="text-xs text-surface-500">Produk aktif akan tampil di katalog publik dan POS</p>
          </div>
        </label>
      </div>

      {/* Bottom save */}
      <div className="flex items-center justify-end gap-3 pt-4 pb-8 lg:pb-0 border-t border-surface-outline-variant">
        <Link href="/admin/produk" className="btn-secondary" aria-label="Batal dan kembali">
          Batal
        </Link>
        <button type="submit" disabled={pending || uploading} className="btn-primary" aria-label={pending ? "Menyimpan produk" : submitLabel}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
