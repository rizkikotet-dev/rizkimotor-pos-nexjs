"use client";

import { useState } from "react";
import { Barcode } from "@/components/ui/Barcode";
import { printBarcodes } from "../produk/printBarcode";
import { encodePrice } from "@/lib/barcode-encode";
import { Printer, Minus, Plus, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  priceReseller: number | null;
  cost: number | null;
  stock: number;
  category: { name: string };
}

interface BarcodePageClientProps {
  products: Product[];
}

export function BarcodePageClient({ products }: BarcodePageClientProps) {
  const [selected, setSelected] = useState<Map<number, Product>>(new Map());
  const [copies, setCopies] = useState(1);
  const [showCost, setShowCost] = useState(false);
  const [showReseller, setShowReseller] = useState(false);
  const [showNormal, setShowNormal] = useState(false);

  function toggleProduct(product: Product) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(product.id)) {
        next.delete(product.id);
      } else {
        next.set(product.id, product);
      }
      return next;
    });
  }

  function selectAll() {
    const next = new Map<number, Product>();
    for (const p of products) {
      next.set(p.id, p);
    }
    setSelected(next);
  }

  function clearSelection() {
    setSelected(new Map());
  }

  function handlePrint() {
    const items = Array.from(selected.values());
    if (items.length === 0) {
      alert("Pilih produk terlebih dahulu");
      return;
    }
    printBarcodes(items, copies, { showCost, showReseller, showNormal });
  }

  const selectedArr = Array.from(selected.values());

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={selectAll} className="btn-ghost text-xs px-3 py-1.5">
            Pilih Semua
          </button>
          <button onClick={clearSelection} className="btn-ghost text-xs px-3 py-1.5">
            Hapus Pilihan
          </button>
          <span className="text-xs text-zinc-500">{selected.size} dipilih</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Copies:</span>
            <button
              onClick={() => setCopies(Math.max(1, copies - 1))}
              className="p-1 rounded hover:bg-surface-container-high text-zinc-400"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-sm font-bold text-zinc-200 w-6 text-center">{copies}</span>
            <button
              onClick={() => setCopies(Math.min(10, copies + 1))}
              className="p-1 rounded hover:bg-surface-container-high text-zinc-400"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={handlePrint}
            disabled={selected.size === 0}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            Cetak ({selected.size})
          </button>
        </div>
      </div>

      {/* Price display options */}
      <div className="card p-3 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400">Tampilkan harga tersembunyi:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showNormal}
              onChange={(e) => setShowNormal(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 text-blue-500"
            />
            <span className="text-xs text-zinc-300">Normal (HJ)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showCost}
              onChange={(e) => setShowCost(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 text-blue-500"
            />
            <span className="text-xs text-zinc-300">Modal (HB)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showReseller}
              onChange={(e) => setShowReseller(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-800 text-blue-500"
            />
            <span className="text-xs text-zinc-300">Reseller (HR)</span>
          </label>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
          Harga ditampilkan dalam kode: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G, 7=H, 8=I, 9=J
        </p>
      </div>

      {/* Preview */}
      {selectedArr.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="text-xs font-bold text-zinc-400 mb-3">Preview Barcode</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {selectedArr.map((p) => {
                const hiddenPrices: string[] = [];
                if (showNormal) {
                  hiddenPrices.push(`HJ-${encodePrice(p.price)}`);
                }
                if (showCost && p.cost !== null) {
                  hiddenPrices.push(`HB-${encodePrice(p.cost)}`);
                }
                if (showReseller && p.priceReseller !== null) {
                  hiddenPrices.push(`HR-${encodePrice(p.priceReseller)}`);
                }
                const hiddenStr = hiddenPrices.join(" | ");

                return (
                  <div key={p.id} className="border border-surface-outline-variant rounded-lg p-3 text-center">
                    <Barcode value={p.sku} height={30} fontSize={10} />
                    <p className="text-[10px] text-zinc-300 mt-1 truncate font-bold">{p.name}</p>
                    {!showNormal && (
                      <p className="text-[10px] text-zinc-300 font-bold">Rp {p.price.toLocaleString("id-ID")}</p>
                    )}
                    {hiddenStr && (
                      <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{hiddenStr}</p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-outline-variant bg-surface-container-low">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === products.length && products.length > 0}
                    onChange={() => selected.size === products.length ? clearSelection() : selectAll()}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest">SKU</th>
                <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Nama Produk</th>
                <th className="px-4 py-3 text-left text-[10px] text-zinc-500 font-mono uppercase tracking-widest hidden sm:table-cell">Kategori</th>
                <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Harga</th>
                <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest hidden md:table-cell">Kode</th>
                <th className="px-4 py-3 text-right text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-outline-variant">
              {products.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => toggleProduct(product)}
                  className={`cursor-pointer transition-colors ${
                    selected.has(product.id)
                      ? "bg-primary/5"
                      : "hover:bg-surface-container-high"
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleProduct(product)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">{product.sku}</td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-400 hidden sm:table-cell">{product.category.name}</td>
                  <td className="px-4 py-3 text-right text-primary font-semibold">Rp {product.price.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-right font-mono text-[10px] text-zinc-500 hidden md:table-cell">
                    {encodePrice(product.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={product.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                      {product.stock}
                    </span>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                    <ShoppingCart className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
