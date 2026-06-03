"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, X, Receipt, LogOut,
  History, Package, Wrench, Loader2, PenSquare, ChevronUp, ChevronDown,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";

interface POSUser {
  id: string;
  name?: string | null;
  username: string;
  role: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
  price: number;
  priceReseller: number;
  stock: number;
  image: string | null;
  categoryId: number;
  category: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

interface CartItem {
  id: string;
  productId: number | null;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  stock: number | null;
  isManual: boolean;
}

interface POSClientProps {
  products: Product[];
  categories: Category[];
  user: POSUser;
  storeName: string;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export function POSClient({ products, categories, user, storeName }: POSClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const [priceModal, setPriceModal] = useState<Product | null>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [manualQty, setManualQty] = useState(1);

  const [showCart, setShowCart] = useState(false);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (activeCategory && p.categoryId !== activeCategory) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, search, activeCategory]);

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const paymentNum = parseInt(payment.replace(/\D/g, "")) || 0;
  const change = paymentNum > 0 ? paymentNum - total : 0;
  const canCheckout = cart.length > 0 && paymentNum >= total && !checkoutLoading;

  function addToCart(product: Product, price: number) {
    setError("");
    const id = String(product.id);
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        if (existing.quantity + 1 > (product.stock ?? 0)) {
          setError(`Stok "${product.name}" tersisa ${product.stock}`);
          return prev;
        }
        return prev.map((c) =>
          c.id === id ? { ...c, quantity: c.quantity + 1, price } : c
        );
      }
      if ((product.stock ?? 0) < 1) {
        setError(`Stok "${product.name}" habis`);
        return prev;
      }
      return [
        ...prev,
        { id, productId: product.id, name: product.name, sku: product.sku, price, quantity: 1, stock: product.stock, isManual: false },
      ];
    });
  }

  function addManualItem() {
    setError("");
    if (!manualName.trim()) { setError("Nama barang wajib diisi"); return; }
    const price = parseInt(manualPrice.replace(/\D/g, "")) || 0;
    if (price <= 0) { setError("Harga harus lebih dari 0"); return; }
    const qty = Math.max(1, parseInt(String(manualQty)) || 1);
    const id = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const sku = `MANUAL-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setCart((prev) => [...prev, { id, productId: null, name: manualName.trim(), sku, price, quantity: qty, stock: null, isManual: true }]);
    setManualName(""); setManualPrice(""); setManualQty(1); setShowManualForm(false);
  }

  function handleProductClick(product: Product) {
    if (product.priceReseller > 0 && product.priceReseller !== product.price) {
      setPriceModal(product);
    } else {
      addToCart(product, product.price);
    }
  }

  function updateQty(cartId: string, delta: number) {
    setError("");
    setCart((prev) =>
      prev
        .map((c) => {
          if (c.id !== cartId) return c;
          const newQty = c.quantity + delta;
          if (newQty < 1) return c;
          if (c.stock !== null && newQty > c.stock) { setError(`Stok "${c.name}" tersisa ${c.stock}`); return c; }
          return { ...c, quantity: newQty };
        })
        .filter((c) => c.quantity > 0)
    );
  }

  function removeItem(cartId: string) { setCart((prev) => prev.filter((c) => c.id !== cartId)); }
  function clearCart() { setCart([]); setPayment(""); setError(""); }

  function setQuickAmount(amt: number) { setPayment(String(amt)); }
  function setExactAmount() { setPayment(String(total)); }

  async function checkout() {
    if (!canCheckout) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const items = cart.map((c) =>
        c.isManual
          ? { name: c.name, sku: c.sku, price: c.price, quantity: c.quantity }
          : { productId: c.productId!, price: c.price, quantity: c.quantity }
      );
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, payment: paymentNum }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Transaksi gagal"); }
      const data = await res.json();
      window.open(`/pos/struk/${data.id}`, "_blank");
      setCart([]); setPayment("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-surface-200/80 px-3 sm:px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-600 text-white p-1.5 rounded-lg shadow-sm shadow-brand-600/20">
            <Wrench className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <div className="font-bold text-surface-900 text-sm tracking-tight">{storeName}</div>
            <div className="text-[10px] text-surface-500 uppercase tracking-wider">POS / Kasir</div>
          </div>
        </div>
        <div className="flex items-center gap-1" role="toolbar" aria-label="Aksi POS">
          <a href="/pos/riwayat" className="btn-ghost text-xs px-2 py-1.5 rounded-lg" aria-label="Riwayat transaksi">
            <History className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Riwayat</span>
          </a>
          {user.role === "ADMIN" && (
            <a href="/admin" className="btn-ghost text-xs px-2 py-1.5 rounded-lg" aria-label="Panel Admin">
              <Package className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Admin</span>
            </a>
          )}
          <div className="border-l border-surface-200 pl-2 ml-1 flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-surface-900">{user.name}</div>
              <div className="text-[10px] text-surface-500 uppercase tracking-wider">{user.role}</div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Keluar dari akun"
              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: PRODUCTS */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-surface-200/80 p-3 space-y-2.5 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" aria-hidden="true" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk (nama / SKU)..."
                aria-label="Cari produk"
                className="input pl-10" />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Filter kategori">
              <button onClick={() => setActiveCategory(null)}
                role="tab"
                aria-selected={!activeCategory}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  !activeCategory ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20" : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                }`}>
                Semua
              </button>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)}
                  role="tab"
                  aria-selected={activeCategory === c.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === c.id ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20" : "bg-surface-100 text-surface-600 hover:bg-surface-200"
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 bg-surface-50">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-surface-500 text-sm">
                <Package className="h-10 w-10 mx-auto mb-3 text-surface-300" />
                {products.length === 0 ? "Belum ada produk. Tambahkan di panel admin." : "Tidak ada produk yang cocok."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5" role="list" aria-label="Daftar produk">
                {filteredProducts.map((p) => {
                  const out = p.stock < 1;
                  const hasReseller = p.priceReseller > 0 && p.priceReseller !== p.price;
                  return (
                    <button key={p.id} onClick={() => handleProductClick(p)} disabled={out}
                      role="listitem"
                      aria-label={`${p.name}, ${formatRupiah(p.price)}, stok ${p.stock}${out ? ', habis' : ''}`}
                      className="bg-white border border-surface-200 rounded-xl p-2 text-left hover:border-brand-400 hover:shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 min-h-[44px]">
                      <div className="aspect-square bg-surface-100 rounded-lg mb-1.5 flex items-center justify-center text-surface-300 overflow-hidden">
                        {p.image
                          ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          : <Package className="h-8 w-8" aria-hidden="true" />}
                      </div>
                      <p className="text-xs font-semibold text-surface-900 line-clamp-2 leading-tight mb-0.5 group-hover:text-brand-600 transition-colors duration-200">{p.name}</p>
                      <p className="text-[10px] text-surface-400 font-mono">{p.sku}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="text-[10px]">
                          {hasReseller ? (
                            <span className="badge-warning text-[10px] px-1.5 py-0">2 Harga</span>
                          ) : (
                            <span className="font-bold text-brand-600">{formatRupiah(p.price)}</span>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          out ? "badge-danger" : p.stock <= 5 ? "badge-warning" : "badge-success"
                        }`}>
                          {p.stock}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CART */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-surface-200/80 flex flex-col flex-shrink-0">
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-brand-600" aria-hidden="true" />
              <h2 className="font-semibold text-surface-900">Keranjang</h2>
              {cart.length > 0 && (
                <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full" aria-label={`${cart.reduce((s, c) => s + c.quantity, 0)} item`}>
                  {cart.reduce((s, c) => s + c.quantity, 0)}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1" aria-label="Kosongkan keranjang">
                Kosongkan
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[80px]">
            {cart.length === 0 ? (
              <div className="text-center py-10 text-surface-400 text-sm">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-surface-300" aria-hidden="true" />
                Keranjang kosong
              </div>
            ) : cart.map((item) => (
              <div key={item.id} className={`rounded-xl p-2.5 flex gap-2 ${item.isManual ? "bg-purple-50 border border-purple-200" : "bg-surface-50"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-surface-900 truncate">{item.name}</p>
                    {item.isManual && <PenSquare className="h-3 w-3 text-purple-500 flex-shrink-0" aria-hidden="true" />}
                  </div>
                  <p className="text-[10px] text-surface-400 font-mono">{item.sku}</p>
                  <p className="text-xs text-brand-600 font-semibold mt-0.5">
                    {formatRupiah(item.price)} × {item.quantity} = <span className="text-surface-900">{formatRupiah(item.price * item.quantity)}</span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button onClick={() => removeItem(item.id)}
                    aria-label={`Hapus ${item.name} dari keranjang`}
                    className="text-red-400 hover:text-red-600 p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                  <div className="flex items-center gap-0.5 bg-white border border-surface-200 rounded-lg">
                    <button onClick={() => updateQty(item.id, -1)}
                      aria-label={`Kurangi ${item.name}`}
                      className="px-1.5 py-0.5 hover:bg-surface-100 rounded-l-lg transition-colors min-h-[32px] min-w-[32px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <Minus className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <span className="text-xs font-semibold px-1.5 min-w-[24px] text-center" aria-label={`Stok: ${item.quantity}`}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)}
                      aria-label={`Tambah ${item.name}`}
                      className="px-1.5 py-0.5 hover:bg-surface-100 rounded-r-lg transition-colors min-h-[32px] min-w-[32px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                      <Plus className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Manual item toggle */}
          <div className="px-3 pt-2 flex-shrink-0">
            <button onClick={() => setShowManualForm(!showManualForm)}
              aria-expanded={showManualForm}
              aria-controls="manual-item-form"
              className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl py-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px]">
              <PenSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {showManualForm ? "Sembunyikan" : "Input Manual"}
              {showManualForm ? <ChevronUp className="h-3 w-3" aria-hidden="true" /> : <ChevronDown className="h-3 w-3" aria-hidden="true" />}
            </button>
          </div>

          {/* Manual item form */}
          {showManualForm && (
            <div id="manual-item-form" className="px-3 py-2.5 bg-purple-50 border-t border-purple-200 space-y-2 flex-shrink-0" role="region" aria-label="Form input manual">
              <input type="text" value={manualName} onChange={(e) => setManualName(e.target.value)}
                placeholder="Nama barang (mis: Jasa Service)"
                aria-label="Nama barang manual"
                className="w-full px-3 py-2 border border-purple-300 rounded-xl text-xs min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
              <div className="flex gap-2">
                <input type="text" inputMode="numeric" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="Harga"
                  aria-label="Harga barang manual"
                  className="flex-1 px-3 py-2 border border-purple-300 rounded-xl text-xs font-mono min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                <input type="number" min="1" value={manualQty} onChange={(e) => setManualQty(parseInt(e.target.value) || 1)}
                  aria-label="Jumlah"
                  className="w-16 px-2 py-2 border border-purple-300 rounded-xl text-xs text-center min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
                <button onClick={addManualItem}
                  className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-semibold hover:bg-purple-700 transition-colors min-h-[44px] min-w-[56px] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1">
                  Tambah
                </button>
              </div>
            </div>
          )}

          {/* Payment section */}
          <div className="border-t border-surface-200 p-3 space-y-2.5 bg-surface-50 flex-shrink-0">
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
                {error}
              </div>
            )}
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-surface-500 font-medium">Total</span>
              <span className="text-xl font-bold text-brand-600" aria-live="polite">{formatRupiah(total)}</span>
            </div>
            <div>
              <label htmlFor="payment-input" className="block text-xs font-semibold text-surface-600 mb-1.5">Bayar (Rp)</label>
              <input id="payment-input" type="text" inputMode="numeric" value={payment} onChange={(e) => setPayment(e.target.value.replace(/\D/g, ""))}
                placeholder="0" aria-label="Jumlah bayar" className="input font-mono text-base min-h-[44px]" />
            </div>
            <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Nominal cepat">
              <button onClick={setExactAmount}
                className="text-xs font-semibold bg-white border border-surface-200 hover:bg-surface-50 px-2 py-2 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                Pas
              </button>
              {QUICK_AMOUNTS.map((amt) => (
                <button key={amt} onClick={() => setQuickAmount(amt)}
                  className="text-xs font-semibold bg-white border border-surface-200 hover:bg-surface-50 px-2 py-2 rounded-lg transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                </button>
              ))}
            </div>
            {payment && parseInt(payment) > 0 && (
              <div className="flex justify-between text-sm pt-2 border-t border-surface-200">
                <span className="text-surface-500">Kembali</span>
                <span className={`font-bold ${change < 0 ? "text-red-600" : "text-emerald-600"}`} aria-live="polite">
                  {formatRupiah(change)}
                </span>
              </div>
            )}
            <button onClick={checkout} disabled={!canCheckout}
              className="btn-primary w-full py-3 text-base min-h-[48px] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              aria-label={checkoutLoading ? "Memproses pembayaran" : "Bayar dan cetak struk"}>
              {checkoutLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Memproses...</>
              ) : (
                <><Receipt className="h-4 w-4" aria-hidden="true" />Bayar & Cetak Struk</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* === PRICE SELECTION MODAL === */}
      {priceModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setPriceModal(null)} role="dialog" aria-modal="true" aria-label="Pilih harga jual">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-lifted animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-base text-surface-900 mb-1">Pilih Harga Jual</h3>
            <p className="text-xs text-surface-500 mb-5 truncate">{priceModal.name}</p>
            <div className="space-y-2">
              <button onClick={() => { addToCart(priceModal, priceModal.price); setPriceModal(null); }}
                className="w-full text-left px-4 py-3.5 border border-surface-200 rounded-xl hover:bg-surface-50 transition-all flex items-center justify-between min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                <span className="text-sm font-medium text-surface-600">Harga Normal</span>
                <span className="font-bold text-surface-900">{formatRupiah(priceModal.price)}</span>
              </button>
              <button onClick={() => { addToCart(priceModal, priceModal.priceReseller); setPriceModal(null); }}
                className="w-full text-left px-4 py-3.5 border-2 border-brand-500 bg-brand-50 rounded-xl hover:bg-brand-100 transition-all flex items-center justify-between min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500">
                <span className="text-sm font-semibold text-brand-700">Harga Reseller</span>
                <span className="font-bold text-brand-700">{formatRupiah(priceModal.priceReseller)}</span>
              </button>
            </div>
            <button onClick={() => setPriceModal(null)}
              className="w-full text-center text-xs text-surface-500 hover:text-surface-700 mt-4 py-2 font-medium transition-colors min-h-[44px] focus:outline-none focus:ring-2 focus:ring-surface-500 rounded-lg">
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
