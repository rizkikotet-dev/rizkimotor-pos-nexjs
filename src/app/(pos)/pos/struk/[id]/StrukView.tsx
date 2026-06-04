"use client";

import { useState } from "react";
import { Printer, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { formatRupiah, formatDateTime } from "@/lib/format";
import { PaperSize } from "@/lib/constants";
import { printStruk } from "./printStruk";
import type { Settings } from "@/lib/settings";

interface StrukItem {
  id: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface StrukTransaction {
  id: number;
  invoiceNo: string;
  createdAt: Date | string;
  total: number;
  payment: number;
  change: number;
  user: { name: string };
  items: StrukItem[];
}

interface StrukViewProps {
  transaction: StrukTransaction;
  settings: Settings;
  backUrl?: string;
}

export function StrukView({ transaction, settings, backUrl = "/pos/riwayat" }: StrukViewProps) {
  const s = settings;
  const [paperSize, setPaperSize] = useState<PaperSize>(
    (s["receipt.paperSize"] as PaperSize) || PaperSize.P80MM
  );

  const showAddress = s["receipt.showAddress"] === "true" && s["store.address"];
  const showPhone = s["receipt.showPhone"] === "true" && s["store.phone"];
  const showEmail = s["receipt.showEmail"] === "true" && s["store.email"];
  const showWebsite = s["receipt.showWebsite"] === "true" && s["store.website"];
  const showKasir = s["receipt.showKasir"] === "true";
  const showDate = s["receipt.showInvoiceDate"] === "true";
  const headerNote = s["receipt.headerNote"];

  const strukWidthClass = paperSize === PaperSize.P58MM ? "struk-58mm" : "struk-80mm";

  const printPageCss = `
    @page {
      size: ${paperSize} auto;
      margin: 0;
    }
  `;

  function handlePrint() {
    printStruk(transaction, settings, paperSize);
  }

  return (
    <div className="min-h-screen bg-surface-base py-6 print:bg-white print:py-0">
      <style dangerouslySetInnerHTML={{ __html: printPageCss }} />

      <div className="max-w-md mx-auto no-print mb-3 px-3 flex items-center justify-between gap-2">
        <Link href={backUrl} className="btn-ghost min-h-[44px] min-w-[56px]" aria-label="Kembali ke riwayat transaksi">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali
        </Link>

        <div className="flex items-center gap-0.5 bg-surface-container rounded-lg p-0.5 text-xs border border-surface-outline-variant" role="radiogroup" aria-label="Ukuran kertas">
          <button
            onClick={() => setPaperSize(PaperSize.P58MM)}
            role="radio"
            aria-checked={paperSize === PaperSize.P58MM}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              paperSize === PaperSize.P58MM ? "bg-primary text-surface-base" : "text-zinc-400 hover:text-primary hover:bg-surface-container-high"
            }`}
          >
            58mm
          </button>
          <button
            onClick={() => setPaperSize(PaperSize.P80MM)}
            role="radio"
            aria-checked={paperSize === PaperSize.P80MM}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              paperSize === PaperSize.P80MM ? "bg-primary text-surface-base" : "text-zinc-400 hover:text-primary hover:bg-surface-container-high"
            }`}
          >
            80mm
          </button>
        </div>

        <button onClick={handlePrint} className="btn-primary print:hidden min-h-[44px] min-w-[56px]" aria-label={`Cetak struk ukuran ${paperSize}`}>
          <Printer className="h-4 w-4" aria-hidden="true" />
          Cetak
        </button>
      </div>

      <div className="max-w-md mx-auto no-print mb-3 px-3">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-400 flex items-start gap-2">
          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <strong>Tips cetak:</strong> Saat dialog cetak muncul, set{' '}
            <em>Margins: None / Minimum</em> dan pilih ukuran kertas{' '}
            <strong>{paperSize}</strong>{' '}
            di pengaturan printer.
          </div>
        </div>
      </div>

      <div
        className={`bg-stone-50 dark:bg-stone-100 p-2 print:bg-white mx-auto shadow-sm dark:shadow-lg print:shadow-none ${strukWidthClass}`}
        id="struk"
        data-paper-size={paperSize}
      >
        <div className="text-center border-b border-dashed border-gray-400 pb-1.5 mb-1.5">
          <h1 className="font-bold text-[13px] uppercase leading-tight">{s["store.name"]}</h1>
          {headerNote && <p className="text-[9px] text-gray-600 italic leading-tight">{headerNote}</p>}
          {showAddress && <p className="text-[9px] text-gray-600 leading-tight">{s["store.address"]}</p>}
          {showPhone && <p className="text-[9px] text-gray-600 leading-tight">Telp: {s["store.phone"]}</p>}
          {showEmail && <p className="text-[9px] text-gray-600 leading-tight">{s["store.email"]}</p>}
          {showWebsite && <p className="text-[9px] text-gray-600 leading-tight">{s["store.website"]}</p>}
        </div>

        <div className="text-[9px] space-y-0.5 mb-1.5 border-b border-dashed border-gray-400 pb-1.5">
          {showDate && (
            <div className="flex justify-between gap-1">
              <span>Tanggal</span>
              <span className="text-right">{formatDateTime(transaction.createdAt)}</span>
            </div>
          )}
          <div className="flex justify-between gap-1">
            <span>Invoice</span>
            <span className="font-mono">{transaction.invoiceNo}</span>
          </div>
          {showKasir && (
            <div className="flex justify-between gap-1">
              <span>Kasir</span>
              <span>{transaction.user.name}</span>
            </div>
          )}
        </div>

        <div className="border-b border-dashed border-gray-400 pb-1.5 mb-1.5">
          {transaction.items.map((item) => (
            <div key={item.id} className="text-[9px] mb-1">
              <div className="font-medium leading-tight">{item.productName}</div>
              <div className="text-gray-500 font-mono text-[8px]">{item.productSku}</div>
              <div className="flex justify-between gap-1">
                <span>
                  {item.quantity} &times; {formatRupiah(item.price)}
                </span>
                <span className="font-medium">{formatRupiah(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-b border-dashed border-gray-400 pb-1.5 mb-1.5 text-[9px] space-y-0.5">
          <div className="flex justify-between font-bold text-[11px]">
            <span>TOTAL</span>
            <span>{formatRupiah(transaction.total)}</span>
          </div>
          <div className="flex justify-between gap-1">
            <span>Bayar</span>
            <span>{formatRupiah(transaction.payment)}</span>
          </div>
          <div className="flex justify-between gap-1">
            <span>Kembali</span>
            <span>{formatRupiah(transaction.change)}</span>
          </div>
        </div>

        <div className="text-center text-[8px] text-gray-600 leading-tight space-y-0.5">
          {s["receipt.footerLine1"] && <p>{s["receipt.footerLine1"]}</p>}
          {s["receipt.footerLine2"] && <p>{s["receipt.footerLine2"]}</p>}
          <p className="text-[7px] text-gray-400 pt-0.5">&mdash; {transaction.invoiceNo} &mdash;</p>
        </div>
      </div>

      <div className="max-w-md mx-auto no-print mt-3 px-3 text-center text-xs text-zinc-500">
        <p>
          Struk di-print dengan ukuran {paperSize}. Atur di{' '}
          <Link href="/admin/pengaturan" className="text-primary hover:text-primary-400 underline font-medium" aria-label="Ubah pengaturan struk">
            Pengaturan
          </Link>{' '}
          untuk mengubah default.
        </p>
      </div>
    </div>
  );
}
