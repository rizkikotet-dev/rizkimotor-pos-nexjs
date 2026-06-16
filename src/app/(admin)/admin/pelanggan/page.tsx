"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { Pagination } from "@/components/ui/Pagination";
import { formatRupiah } from "@/lib/format";
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  note: string | null;
  totalDebt: number;
  transactionCount: number;
  unpaidDebtCount: number;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function PelangganPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const res = await fetch(`/api/customers?${params}`);
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.data);
        setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 0);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Pelanggan berhasil dihapus");
      setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Pelanggan</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Kelola data pelanggan toko</p>
        </div>
        <Link href="/admin/pelanggan/tambah" className="btn-primary">
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama atau nomor telepon..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">
            {searchQuery ? "Pelanggan tidak ditemukan" : "Belum ada pelanggan"}
          </p>
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-surface-outline-variant bg-surface-container-low hover:bg-surface-container transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-200 truncate">{customer.name}</p>
                  {customer.unpaidDebtCount > 0 && (
                    <span className="tag-brand text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                      Utang
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  {customer.phone && (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {customer.phone}
                    </span>
                  )}
                  {customer.address && (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {customer.address}
                    </span>
                  )}
                </div>
                {customer.totalDebt > 0 && (
                  <p className="text-xs text-red-400 mt-1">
                    Sisa utang: {formatRupiah(customer.totalDebt)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/admin/pelanggan/${customer.id}/edit`}
                  className="btn-ghost btn-sm"
                  aria-label={`Edit ${customer.name}`}
                >
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(customer.id)}
                  className="btn-ghost btn-sm text-red-400 hover:text-red-300"
                  aria-label={`Hapus ${customer.name}`}
                >
                  Hapus
                </button>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            </div>
          ))}
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              basePath="/admin/pelanggan"
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
        </>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-surface-base border border-surface-outline-variant rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Hapus Pelanggan</h3>
                <p className="text-xs text-zinc-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mb-5">
              Yakin ingin menghapus pelanggan ini? Data akan dinonaktifkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="btn-secondary">
                Batal
              </button>
              <button onClick={handleDelete} disabled={deleting} className="btn-danger">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
