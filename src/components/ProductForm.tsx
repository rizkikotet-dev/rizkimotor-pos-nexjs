"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload, X, Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  mode: "create" | "edit";
  categories: Category[];
  initialData?: {
    id: number;
    name: string;
    sku: string;
    description: string;
    price: number;
    priceReseller: number;
    stock: number;
    image: string;
    active: boolean;
    categoryId: number;
  };
}

export function ProductForm({ mode, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(initialData?.image || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadImage(): Promise<string> {
    if (!imageFile) return imagePreview || "";

    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Gagal upload gambar");
    const data = await res.json();
    return data.url;
  }

  function validateForm(form: FormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const name = form.get("name") as string;
    const sku = form.get("sku") as string;
    const price = form.get("price") as string;
    const stock = form.get("stock") as string;
    const categoryId = form.get("categoryId") as string;

    if (!name?.trim()) errors.name = "Nama produk wajib diisi";
    if (!sku?.trim()) errors.sku = "SKU wajib diisi";
    if (!categoryId) errors.categoryId = "Pilih kategori";
    if (!price || parseFloat(price) <= 0) errors.price = "Harga harus lebih dari 0";
    if (stock === "" || parseInt(stock) < 0) errors.stock = "Stok harus diisi";

    return errors;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const body = {
        name: formData.get("name") as string,
        sku: formData.get("sku") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        priceReseller: parseFloat(formData.get("priceReseller") as string) || 0,
        stock: parseInt(formData.get("stock") as string),
        image: imageUrl,
        active: formData.get("active") === "on",
        categoryId: parseInt(formData.get("categoryId") as string),
      };

      const url = mode === "edit" ? `/api/products/${initialData?.id}` : "/api/products";
      const method = mode === "edit" ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan produk");
      }

      router.push("/admin/produk");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl" noValidate>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Nama Produk <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialData?.name}
            className={`input ${fieldErrors.name ? "!border-red-500 !ring-red-500/20" : ""}`}
            placeholder="Contoh: Kampas Rem Depan"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name && <p id="name-error" className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.name}</p>}
        </div>

        <div>
          <label htmlFor="sku" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            SKU <span className="text-red-400">*</span>
          </label>
          <input
            id="sku"
            name="sku"
            type="text"
            required
            defaultValue={initialData?.sku}
            className={`input font-mono ${fieldErrors.sku ? "!border-red-500 !ring-red-500/20" : ""}`}
            placeholder="KR-001"
            aria-invalid={!!fieldErrors.sku}
            aria-describedby={fieldErrors.sku ? "sku-error" : undefined}
          />
          {fieldErrors.sku && <p id="sku-error" className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.sku}</p>}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Kategori <span className="text-red-400">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={initialData?.categoryId?.toString()}
            className={`select ${fieldErrors.categoryId ? "!border-red-500 !ring-red-500/20" : ""}`}
            aria-invalid={!!fieldErrors.categoryId}
            aria-describedby={fieldErrors.categoryId ? "category-error" : undefined}
          >
            <option value="">Pilih Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && <p id="category-error" className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.categoryId}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Harga Jual (Rp) <span className="text-red-400">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="100"
            required
            defaultValue={initialData?.price || ""}
            className={`input font-mono ${fieldErrors.price ? "!border-red-500 !ring-red-500/20" : ""}`}
            placeholder="150000"
            aria-invalid={!!fieldErrors.price}
            aria-describedby={fieldErrors.price ? "price-error" : undefined}
          />
          {fieldErrors.price && <p id="price-error" className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.price}</p>}
        </div>

        <div>
          <label htmlFor="priceReseller" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Harga Reseller (Rp)
          </label>
          <input
            id="priceReseller"
            name="priceReseller"
            type="number"
            min="0"
            step="100"
            defaultValue={initialData?.priceReseller || ""}
            className="input font-mono"
            placeholder="135000"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Stok <span className="text-red-400">*</span>
          </label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            required
            defaultValue={initialData?.stock ?? ""}
            className={`input font-mono ${fieldErrors.stock ? "!border-red-500 !ring-red-500/20" : ""}`}
            placeholder="50"
            aria-invalid={!!fieldErrors.stock}
            aria-describedby={fieldErrors.stock ? "stock-error" : undefined}
          />
          {fieldErrors.stock && <p id="stock-error" className="mt-1 text-xs text-red-400" role="alert">{fieldErrors.stock}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Deskripsi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialData?.description}
            className="input resize-y"
            placeholder="Deskripsi produk..."
          />
        </div>

        <div className="sm:col-span-2">
          <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
            Gambar Produk
          </span>
          {imagePreview ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="Preview gambar produk" className="w-32 h-32 object-cover rounded-lg border border-surface-outline-variant" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 min-h-[24px] min-w-[24px]"
                aria-label="Hapus gambar"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-surface-outline-variant rounded-lg cursor-pointer hover:border-surface-outline transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Upload className="h-6 w-6 text-zinc-600 mb-1" aria-hidden="true" />
              <span className="text-[10px] text-zinc-500 font-mono">Pilih gambar</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="sr-only"
                aria-label="Pilih file gambar produk"
              />
            </label>
          )}
          <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">PNG, JPG, WebP. Maks 5MB.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            id="active"
            defaultChecked={initialData?.active ?? true}
            className="h-4 w-4 rounded border-surface-outline bg-surface-container-high text-primary focus:ring-primary/40"
          />
          <label htmlFor="active" className="text-sm text-zinc-300 select-none">Aktif (ditampilkan di katalog)</label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-surface-outline-variant">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Menyimpan...
            </>
          ) : mode === "edit" ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Produk"
          )}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  );
}
