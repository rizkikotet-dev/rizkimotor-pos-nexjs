import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
          <Search className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>

        <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
          404 — Halaman Tidak Ditemukan
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 mb-3">
          Halaman tidak ada
        </h1>

        <p className="text-zinc-400 leading-relaxed mb-8">
          Tautan yang Anda buka mungkin sudah dipindahkan, dihapus, atau tidak pernah ada.
          Coba kembali ke beranda atau jelajahi katalog kami.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              <Home className="h-4 w-4" aria-hidden="true" />
              Beranda
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="secondary" size="md" className="w-full sm:w-auto">
              <Search className="h-4 w-4" aria-hidden="true" />
              Katalog Produk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
